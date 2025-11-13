const { Transaction, Category, sequelize } = require('../models');
const { Op, fn, col, QueryTypes } = require('sequelize');

const buildSummary = async ({ userId, startDate, endDate }) => {
  const where = { user_id: userId };
  if (startDate && endDate) {
    where.transaction_date = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  const totals = await Transaction.findAll({
    where,
    attributes: [
      'type',
      [fn('COALESCE', fn('SUM', col('amount')), 0), 'total'],
    ],
    group: ['type'],
    raw: true,
  });

  const replacements = { userId };
  let dateFilter = '';
  if (startDate && endDate) {
    replacements.startDate = startDate;
    replacements.endDate = endDate;
    dateFilter = 'AND transaction_date BETWEEN :startDate AND :endDate';
  }

  const categoryBreakdown = await sequelize.query(
    `
    SELECT
      c.id,
      c.name,
      c.icon,
      c.color,
      t.type,
      COALESCE(SUM(t.amount), 0) AS total
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = :userId ${dateFilter}
    GROUP BY c.id, c.name, c.icon, c.color, t.type
    ORDER BY total DESC
  `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );

  const monthly = await sequelize.query(
    `
    SELECT DATE_TRUNC('month', transaction_date) AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM transactions
    WHERE user_id = :userId ${dateFilter}
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 6
  `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );

  const totalIncome = totals.find((t) => t.type === 'income')?.total || 0;
  const totalExpense = totals.find((t) => t.type === 'expense')?.total || 0;

  return {
    totalIncome: Number(totalIncome),
    totalExpense: Number(totalExpense),
    balance: Number(totalIncome) - Number(totalExpense),
    categoryBreakdown: categoryBreakdown.map((item) => ({
      category: {
        id: item.id,
        name: item.name,
        icon: item.icon,
        color: item.color,
      },
      type: item.type,
      total: Number(item.total),
    })),
    monthly: monthly
      .map((item) => ({
        month: item.month,
        income: Number(item.income),
        expense: Number(item.expense),
      }))
      .reverse(),
  };
};

const reportController = {
  async getSummary(req, res) {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    console.log('[Reports] Generating summary', { userId, startDate, endDate });
    try {
      const summary = await buildSummary({ userId, startDate, endDate });
      res.json(summary);
      console.log('[Reports] Summary generated', {
        userId,
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        balance: summary.balance,
      });
    } catch (error) {
      console.error('[Reports] Failed to generate summary', { userId, error: error.message });
      res.status(500).json({ message: 'Error generating summary report.', error: error.message });
    }
  },
};

module.exports = { ...reportController, buildSummary };
