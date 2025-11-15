const { AuditLog } = require('../models');

const logAuditEvent = async (
  req,
  userId,
  action,
  metadata = {},
) => {
  try {
    await AuditLog.create({
      user_id: userId || null,
      action,
      metadata,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[audit] Failed to write audit log', error);
  }
};

module.exports = {
  logAuditEvent,
};
