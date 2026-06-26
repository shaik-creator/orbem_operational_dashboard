const { requireRole } = require('./requireRole');

function requireRoles(...roles) {
  return requireRole(...roles);
}

module.exports = {
  requireRoles
};
