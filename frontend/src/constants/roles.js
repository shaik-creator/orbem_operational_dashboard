export const ROLES = {
  ADMIN: 'Admin',
  OPERATIONS: 'Operations Staff',
  ACCOUNTS: 'Accounts Staff',
  WAREHOUSE: 'Warehouse Staff'
};

const ROLE_ALIASES = {
  'admin': ROLES.ADMIN,
  'admin / owner': ROLES.ADMIN,
  'admin - full access': ROLES.ADMIN,
  'operations': ROLES.OPERATIONS,
  'operations staff': ROLES.OPERATIONS,
  'accounts': ROLES.ACCOUNTS,
  'accounts staff': ROLES.ACCOUNTS,
  'accounts & payments': ROLES.ACCOUNTS,
  'warehouse': ROLES.WAREHOUSE,
  'warehouse staff': ROLES.WAREHOUSE
};

export function normalizeRole(role) {
  const key = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[key] || role || '';
}

export function roleLabel(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.ADMIN) return 'Admin / Owner';
  return normalized || 'Team member';
}

export const ALL_ROLES = Object.values(ROLES);
