const AuditLog = require('../models/AuditLog');

async function logAction(user, action, resource, resourceId, details, restaurantId) {
  try {
    await AuditLog.create({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      resource,
      resourceId: resourceId || null,
      details: details || null,
      restaurantId: restaurantId || user.restaurantId || null,
    });
  } catch (err) {
    console.error(`[audit] Failed to log ${action} on ${resource}: ${err.message}`);
  }
}

module.exports = { logAction };
