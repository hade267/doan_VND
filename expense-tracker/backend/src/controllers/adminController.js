const { Op, literal } = require('sequelize');
const { User, Transaction } = require('../models');
const { logAudit } = require('../utils/auditLogger');

const buildUserWhere = ({ q, role, status }) => {
  const where = {};
  if (q) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
      { full_name: { [Op.iLike]: `%${q}%` } },
    ];
  }
  if (role) {
    where.role = role;
  }
  if (status === 'active') {
    where.is_active = true;
  } else if (status === 'inactive') {
    where.is_active = false;
  }
  return where;
};

const adminController = {
  async listUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        q,
        role,
        status,
      } = req.query;

      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

      const where = buildUserWhere({ q, role, status });
      const offset = (pageNumber - 1) * pageSize;

      const { rows, count } = await User.findAndCountAll({
        where,
        attributes: {
          exclude: ['password_hash'],
          include: [
            [
              literal(`(
                SELECT COUNT(*) FROM transactions AS t WHERE t.user_id = "User"."id"
              )`),
              'transactionCount',
            ],
            [
              literal(`COALESCE((
                SELECT SUM(amount) FROM transactions AS t WHERE t.user_id = "User"."id" AND t.type = 'income'
              ), 0)`),
              'totalIncome',
            ],
            [
              literal(`COALESCE((
                SELECT SUM(amount) FROM transactions AS t WHERE t.user_id = "User"."id" AND t.type = 'expense'
              ), 0)`),
              'totalExpense',
            ],
          ],
        },
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
      });

      res.json({
        total: count,
        items: rows,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res) {
    const { id } = req.params;
    const { role, is_active } = req.body;

    const target = await User.findByPk(id);
    if (!target) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (target.id === req.user.id) {
      if (role && role !== target.role) {
        return res.status(400).json({ message: 'Bạn không thể tự đổi vai trò của mình.' });
      }
      if (typeof is_active === 'boolean' && is_active === false) {
        return res.status(400).json({ message: 'Bạn không thể tự vô hiệu hóa tài khoản.' });
      }
    }

    const payload = {};
    if (role) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
      }
      payload.role = role;
    }
    if (typeof is_active === 'boolean') {
      payload.is_active = is_active;
    }

    await target.update(payload);
    await logAudit({
      userId: req.user.id,
      action: 'admin:update_user',
      entity: 'user',
      entityId: target.id,
      metadata: {
        changes: payload,
        targetUser: target.id,
      },
    });
    const updated = target.toJSON();
    delete updated.password_hash;
    res.json(updated);
  },

  async getStats(req, res, next) {
    try {
      const [totalUsers, activeUsers, adminCount, recentTransactions] = await Promise.all([
        User.count(),
        User.count({ where: { is_active: true } }),
        User.count({ where: { role: 'admin' } }),
        Transaction.count({
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminCount,
        recentTransactions,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
