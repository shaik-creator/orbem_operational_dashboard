const axios = require('axios');
const { query } = require('../config/db');
const { getDashboardSummary, getBookingContext } = require('./dashboardSummaryService');
const { ROLES, normalizeRole } = require('../utils/roles');

function extractBookingId(message) {
  const match = String(message || '').match(/\b(ORB-\d{4}-\d{4}|ORB\d{3,}|AWB\d+)\b/i);
  return match ? match[0].toUpperCase() : null;
}

function extractAirportCodes(message) {
  const known = ['BOM', 'BLR', 'DEL', 'HYD', 'AMD', 'MAA', 'JAI', 'COK', 'CCU', 'PNQ', 'DXB', 'SIN', 'LHR', 'DOH', 'FRA', 'HKG', 'AMS', 'BKK', 'JED'];
  const text = String(message || '').toUpperCase();
  return known.filter((code) => new RegExp(`\\b${code}\\b`).test(text));
}

function compactContext(context) {
  return JSON.stringify(context, null, 2).slice(0, 6000);
}

function getGrokApiKey() {
  return process.env.GROK_API_KEY;
}

const financeKeywords = ['revenue', 'payment', 'payments', 'invoice', 'invoices', 'paid', 'balance', 'balances', 'overdue', 'collection', 'sales'];
const operationsKeywords = ['booking', 'bookings', 'shipment', 'shipments', 'document', 'documents', 'delay', 'delayed', 'awb', 'cargo', 'dispatch', 'warehouse', 'task', 'tasks'];
const adminKeywords = ['staff', 'user', 'users', 'admin', 'role', 'roles', 'permission', 'permissions', 'system settings'];

function containsAny(text, words) {
  return words.some((word) => text.includes(word));
}

function isUnauthorizedQuestion(message, user) {
  const role = normalizeRole(user?.role);
  if (role === ROLES.ADMIN) return false;

  const text = String(message || '').toLowerCase();
  if (containsAny(text, adminKeywords)) return true;

  if (role === ROLES.OPERATIONS) {
    return containsAny(text, financeKeywords);
  }

  if (role === ROLES.ACCOUNTS) {
    return containsAny(text, operationsKeywords) && !containsAny(text, financeKeywords) && !text.includes('customer');
  }

  if (role === ROLES.WAREHOUSE) {
    return containsAny(text, financeKeywords) || text.includes('customer balance') || text.includes('rate');
  }

  return true;
}

function canSeeFinance(user) {
  return [ROLES.ADMIN, ROLES.ACCOUNTS].includes(normalizeRole(user?.role));
}

function alertTypeFilter(user) {
  const role = normalizeRole(user?.role);
  if (role === ROLES.ACCOUNTS) return ['Overdue Payments'];
  if (role === ROLES.OPERATIONS || role === ROLES.WAREHOUSE) return ['Delayed Shipments', 'Pending Documents'];
  return null;
}

async function callGrok(prompt) {
  const apiKey = getGrokApiKey();
  if (!apiKey) {
    return { reply: null, unavailableReason: 'missing-key' };
  }

  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: process.env.GROK_MODEL || 'grok-2-latest',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are ORBEM Ops Assistant. Answer using the provided dashboard/database context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return {
      reply: response.data?.choices?.[0]?.message?.content || null,
      unavailableReason: null
    };
  } catch (error) {
    const providerMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      JSON.stringify(error.response?.data || {}) ||
      error.message;
    console.warn('Grok assistant request failed:', providerMessage);
    return { reply: null, unavailableReason: 'request-failed' };
  }
}

function ruleBasedResponse(message, context, user) {
  const text = String(message || '').toLowerCase();
  const kpis = context.dashboard?.kpis || {};
  const financeAllowed = canSeeFinance(user);

  if (text.includes('chargeable weight')) {
    return 'Chargeable weight is the higher value between actual weight and volumetric weight. Volumetric weight = length x width x height x package count / 6000. Use the higher number for airline billing.';
  }

  if ((text.includes('revenue') || text.includes('sales')) && financeAllowed) {
    return `Current month revenue is INR ${Number(kpis.monthlyRevenue || 0).toFixed(2)}. Total received revenue is INR ${Number(kpis.totalRevenue || 0).toFixed(2)}, pending payments are INR ${Number(kpis.pendingPayments || 0).toFixed(2)}, and ${kpis.overduePayments || 0} payment records are overdue.`;
  }

  if ((text.includes('pending payment') || text.includes('overdue payment')) && financeAllowed) {
    const rows = context.dashboard?.tables?.pendingPayments || [];
    if (!rows.length) return 'No pending payment rows are visible for the current dashboard context.';
    return `Pending payments total INR ${Number(kpis.pendingPayments || 0).toFixed(2)}. Start with ${rows
      .slice(0, 3)
      .map((row) => `${row.booking_id}: INR ${Number(row.balance_amount || 0).toFixed(2)} due ${row.due_date || 'soon'}`)
      .join('; ')}.`;
  }

  if (text.includes('how many bookings') || text.includes('dashboard summary')) {
    if (text.includes('month')) {
      return `There are ${kpis.bookingsThisMonth || 0} bookings created this month. Current total bookings are ${kpis.totalBookings || 0}.`;
    }
    return `Current dashboard summary: ${kpis.totalBookings || 0} total bookings, ${kpis.activeShipments || 0} active shipments, ${kpis.completedShipments || 0} completed shipments, ${kpis.pendingDocuments || 0} bookings with pending documents, and ${kpis.delayedShipments || 0} delayed shipments.`;
  }

  if (text.includes('status of') && context.booking?.booking) {
    const booking = context.booking.booking;
    const financeLine = financeAllowed ? ` Payment status: ${booking.payment_status || 'not recorded'}.` : '';
    return `${booking.booking_id || booking.awb_number} is currently ${booking.shipment_status}. Route: ${booking.origin_airport || booking.origin} to ${booking.destination_airport || booking.destination}.${financeLine}`;
  }

  if (text.includes('pending document') || text.includes('documents')) {
    const rows = context.dashboard?.tables?.pendingDocuments || [];
    if (!rows.length) return 'No pending document rows are visible for the current dashboard context.';
    return `Pending document attention is needed for ${rows.length} recent bookings. Start with ${rows
      .slice(0, 3)
      .map((row) => `${row.booking_id}: ${row.pending_documents}`)
      .join('; ')}.`;
  }

  if (text.includes('delayed') || text.includes('delay')) {
    const rows = context.dashboard?.tables?.delayedShipments || [];
    if (!rows.length) return 'No delayed shipments are visible in the current context.';
    return `Delayed shipment count is ${kpis.delayedShipments || rows.length}. Prioritize ${rows
      .slice(0, 3)
      .map((row) => `${row.booking_id} (${row.origin_airport}-${row.destination_airport})`)
      .join(', ')} and send customer updates after checking carrier status.`;
  }

  if (text.includes('customer update')) {
    const booking = context.booking?.booking;
    if (!booking) return 'Share the booking ID and I can draft a customer update using the shipment data.';
    return `Dear ${booking.customer_name}, your shipment ${booking.booking_id} is currently ${booking.shipment_status}. Our operations team is monitoring the ${booking.origin_airport}-${booking.destination_airport} movement and will update you at the next milestone.`;
  }

  if (text.includes('reminder')) {
    const booking = context.booking?.booking;
    if (!booking) return 'Share a booking ID and I can prepare a staff reminder.';
    return `Reminder: Please review ${booking.booking_id}, currently ${booking.shipment_status}, priority ${booking.priority}. Check pending documents and the next shipment milestone today.`;
  }

  if (text.includes('weather') || text.includes('airspace') || text.includes('flight tracking')) {
    return 'Live weather, airspace, and flight-tracking APIs are not connected in this demo build. Use airline/carrier portals for live movement checks, then update ORBEM booking milestones and customer notes.';
  }

  if (financeAllowed) {
    return `Current dashboard summary: ${kpis.totalBookings || 0} bookings, ${kpis.completedShipments || 0} completed shipments, ${kpis.pendingDocuments || 0} bookings with pending documents, ${kpis.delayedShipments || 0} delayed shipments, and INR ${Number(kpis.pendingPayments || 0).toFixed(2)} pending payments. Recommended next step: clear document blockers first, then contact owners for delayed and high-priority bookings.`;
  }

  return `Current dashboard summary: ${kpis.totalBookings || 0} bookings, ${kpis.completedShipments || 0} completed shipments, ${kpis.pendingDocuments || 0} bookings with pending documents, and ${kpis.delayedShipments || 0} delayed shipments. Recommended next step: clear document blockers first, then update delayed and high-priority shipment milestones.`;
}

async function buildAssistantContext(message, user) {
  const dashboard = await getDashboardSummary({}, user);
  const alertTypes = alertTypeFilter(user);
  const recentAlerts = await query(
    `SELECT title, message, type, severity, created_at
     FROM alerts
     ${alertTypes ? `WHERE type IN (${alertTypes.map(() => '?').join(', ')})` : ''}
     ORDER BY created_at DESC, id DESC
     LIMIT 8`,
    alertTypes || []
  );

  const context = {
    dashboard,
    databaseContext: {
      totalBookings: dashboard.kpis.totalBookings,
      bookingsThisMonth: dashboard.kpis.bookingsThisMonth,
      activeShipments: dashboard.kpis.activeShipments,
      completedShipments: dashboard.kpis.completedShipments,
      pendingDocuments: dashboard.kpis.pendingDocuments,
      delayedShipments: dashboard.kpis.delayedShipments,
      monthlyRevenue: dashboard.kpis.monthlyRevenue,
      pendingPayments: dashboard.kpis.pendingPayments,
      overduePayments: dashboard.kpis.overduePayments,
      activeStaffToday: dashboard.kpis.activeStaffToday,
      recentAlerts
    }
  };

  const bookingId = extractBookingId(message);
  if (bookingId) {
    context.booking = await getBookingContext(bookingId);
    if (context.booking?.booking && !canSeeFinance(user)) {
      delete context.booking.booking.invoice_amount;
      delete context.booking.booking.paid_amount;
      delete context.booking.booking.balance_amount;
      delete context.booking.booking.payment_status;
    }
  }

  const airportCodes = extractAirportCodes(message);
  if (airportCodes.length) {
    context.routeCodes = airportCodes;
  }

  return context;
}

async function generateAssistantReply(message, user) {
  if (isUnauthorizedQuestion(message, user)) {
    return {
      reply: 'You do not have permission to access that information.',
      provider: 'role-policy',
      context: null
    };
  }

  const context = await buildAssistantContext(message, user);
  const finalPrompt = `You are ORBEM Ops Assistant for ORBEM Solutions Private Limited.
Use internal operations data first. Be concise, practical, and do not invent live cargo rates.
Respect role-based access. If the question asks for data outside the role scope, say: You do not have permission to access that information.

User: ${user?.name || 'Operations user'} (${user?.role || 'Staff'})
Question: ${message}

Internal and optional live context:
${compactContext(context)}

Answer with clear operations next steps.`;

  const grok = await callGrok(finalPrompt);
  if (grok.reply) {
    return { reply: grok.reply.trim(), provider: 'grok', context };
  }

  return {
    reply: `Assistant is running in local mode.\n\n${ruleBasedResponse(message, context, user)}`,
    provider: 'rule-based',
    context
  };
}

module.exports = {
  generateAssistantReply
};
