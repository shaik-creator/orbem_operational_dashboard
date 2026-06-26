const ROLES = {
  ADMIN: 'Admin',
  OPERATIONS: 'Operations Staff',
  ACCOUNTS: 'Accounts Staff',
  WAREHOUSE: 'Warehouse Staff'
};

const ROLE_ALIASES = {
  admin: ROLES.ADMIN,
  'admin / owner': ROLES.ADMIN,
  'admin - full access': ROLES.ADMIN,
  operations: ROLES.OPERATIONS,
  'operations staff': ROLES.OPERATIONS,
  accounts: ROLES.ACCOUNTS,
  'accounts staff': ROLES.ACCOUNTS,
  'accounts & payments': ROLES.ACCOUNTS,
  warehouse: ROLES.WAREHOUSE,
  'warehouse staff': ROLES.WAREHOUSE
};

function normalizeRole(role) {
  const key = String(role || '').trim().toLowerCase();
  return ROLE_ALIASES[key] || role || '';
}

function normalizeUserRole(user) {
  if (!user) return user;
  return {
    ...user,
    raw_role: user.role,
    role: normalizeRole(user.role)
  };
}

module.exports = {
  ROLES,
  ROLE_VALUES: Object.values(ROLES),
  normalizeRole,
  normalizeUserRole
};
