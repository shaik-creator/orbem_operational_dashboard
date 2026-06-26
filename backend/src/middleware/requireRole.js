const { normalizeRole } = require('../utils/roles');

function requireRole(...roles) {
  const allowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(normalizeRole(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return next();
  };
}

module.exports = {
  requireRole
};
