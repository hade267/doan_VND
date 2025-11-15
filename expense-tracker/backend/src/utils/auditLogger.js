const { AuditLog } = require('../models');

const logAudit = async ({ userId, action, entity, entityId, metadata }) => {
  if (!userId || !action) {
    return;
  }
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      metadata: metadata || null,
    });
  } catch (error) {
    console.error('[Audit] Failed to write log', { action, entity, entityId, error: error.message });
  }
};

module.exports = { logAudit };
