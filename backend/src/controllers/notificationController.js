const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { runAlertChecks } = require('../services/alertService');
const { createHttpError } = require('../utils/validators');
const { logActivity } = require('../services/activityService');
const socketHelper = require('../config/socket');
const { ROLES, normalizeRole } = require('../utils/roles');

const NOTIFICATION_TYPES_BY_ROLE = {
  [ROLES.ADMIN]: null,
  [ROLES.OPERATIONS]: ['Shipment', 'Document', 'Reminder'],
  [ROLES.ACCOUNTS]: ['Payment', 'Reminder'],
  [ROLES.WAREHOUSE]: ['Shipment', 'Document', 'Reminder']
};

function notificationFilterForUser(user, alias = 'n') {
  const allowedTypes = NOTIFICATION_TYPES_BY_ROLE[normalizeRole(user?.role)];
  if (!allowedTypes) return { sql: '', params: [] };
  return {
    sql: `AND ${alias}.type IN (${allowedTypes.map(() => '?').join(', ')})`,
    params: allowedTypes
  };
}

const listNotifications = asyncHandler(async (req, res) => {
  const filter = notificationFilterForUser(req.user);
  const rows = await query(
    `SELECT n.*, b.booking_id
     FROM notifications n
     LEFT JOIN bookings b ON b.id = n.related_booking_id
     WHERE (n.user_id IS NULL OR n.user_id = ?)
     ${filter.sql}
     ORDER BY n.created_at DESC, n.id DESC
     LIMIT 100`,
     [req.user.id, ...filter.params]
  );
  res.json({ notifications: rows });
});

const markRead = asyncHandler(async (req, res) => {
  const filter = notificationFilterForUser(req.user);
  const result = await query(
    `UPDATE notifications n SET n.is_read = 1 WHERE n.id = ? AND (n.user_id IS NULL OR n.user_id = ?) ${filter.sql}`,
    [req.params.id, req.user.id, ...filter.params]
  );
  if (!result.affectedRows) throw createHttpError('Notification not found.', 404);

  socketHelper.emit('alerts:update', { id: req.params.id, action: 'read' });
  socketHelper.emit('dashboard:update', { type: 'alerts' });

  res.json({ message: 'Notification marked as read.' });
});

const dismissNotification = asyncHandler(async (req, res) => {
  const filter = notificationFilterForUser(req.user);
  const result = await query(
    `UPDATE notifications n SET n.is_read = 1 WHERE n.id = ? AND (n.user_id IS NULL OR n.user_id = ?) ${filter.sql}`,
    [req.params.id, req.user.id, ...filter.params]
  );
  if (!result.affectedRows) throw createHttpError('Notification not found.', 404);
  await logActivity({
    userId: req.user.id,
    actionType: 'Alert',
    title: 'Notification dismissed',
    relatedType: 'notification',
    relatedId: req.params.id
  });

  socketHelper.emit('alerts:update', { id: req.params.id, action: 'dismiss' });
  socketHelper.emit('dashboard:update', { type: 'alerts' });

  res.json({ message: 'Notification dismissed.' });
});

const assignTaskFromNotification = asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM notifications WHERE id = ? LIMIT 1', [req.params.id]);
  if (!rows.length) throw createHttpError('Notification not found.', 404);
  const notification = rows[0];
  const result = await query(
    `INSERT INTO tasks (title, description, priority, assigned_to, due_date, status, related_booking_id, created_by)
     VALUES (?, ?, ?, ?, CURDATE(), 'To Do', ?, ?)`,
    [
      notification.title,
      notification.message,
      notification.severity === 'Critical' ? 'Critical' : 'High',
      req.body.assigned_to || req.user.id,
      notification.related_booking_id || null,
      req.user.id
    ]
  );
  await logActivity({
    userId: req.user.id,
    actionType: 'Task',
    title: 'Task assigned from notification',
    description: notification.title,
    relatedType: 'task',
    relatedId: result.insertId
  });

  socketHelper.emit('tasks:update', { id: result.insertId, action: 'create' });
  socketHelper.emit('alerts:update', { id: req.params.id, action: 'task_assigned' });
  socketHelper.emit('dashboard:update', { type: 'tasks' });

  res.status(201).json({ message: 'Task assigned from alert.', task: { id: result.insertId } });
});

const runAlerts = asyncHandler(async (req, res) => {
  const result = await runAlertChecks();

  socketHelper.emit('alerts:update', { action: 'run_checks' });
  socketHelper.emit('dashboard:update', { type: 'alerts' });

  res.json({
    message: `Alert check completed. ${result.createdCount} new notifications created.`,
    ...result
  });
});

module.exports = {
  listNotifications,
  markRead,
  dismissNotification,
  assignTaskFromNotification,
  runAlerts
};
