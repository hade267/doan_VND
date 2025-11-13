const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { Budget, Category, Transaction } = require('../models');

const PERIOD_UNITS = {
  daily: { unit: 'day', value: 1 },
  weekly: { unit: 'week', value: 1 },
  monthly: { unit: 'month', value: 1 },
  yearly: { unit: 'year', value: 1 },
};

const resolveBudgetWindow = (budget) => {
  const period = PERIOD_UNITS[budget.period] || PERIOD_UNITS.monthly;
  const start = dayjs(budget.start_date);
  const end = budget.end_date
    ? dayjs(budget.end_date)
    : start.add(period.value, period.unit).subtract(1, 'second');
  return { start, end };
};

const fetchBudgets = async (userId, { categoryId, includeInactive = true } = {}) => {
  const where = { user_id: userId };
  if (categoryId) where.category_id = categoryId;
  if (!includeInactive) where.is_active = true;

  return Budget.findAll({
    where,
    include: [{ model: Category, attributes: ['id', 'name', 'icon', 'color', 'type'] }],
    order: [['start_date', 'DESC']],
  });
};

const getBudgetUsage = async (budget, { excludeTransactionId } = {}) => {
  const { start, end } = resolveBudgetWindow(budget);
  const where = {
    user_id: budget.user_id,
    category_id: budget.category_id,
    type: 'expense',
    transaction_date: {
      [Op.between]: [start.toDate(), end.toDate()],
    },
  };

  if (excludeTransactionId) {
    where.id = { [Op.ne]: excludeTransactionId };
  }

  const spentRaw = await Transaction.sum('amount', { where });
  const spent = Number(spentRaw) || 0;
  const limit = Number(budget.amount_limit) || 0;

  return {
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    spent,
    remaining: limit > 0 ? Math.max(limit - spent, 0) : null,
    percentage: limit > 0 ? Math.min((spent / limit) * 100, 999) : null,
    limit,
    window: { start: start.toISOString(), end: end.toISOString() },
  };
};

const getBudgetAlerts = async ({ userId, categoryId, amount, transactionDate }) => {
  if (!categoryId) return [];
  const budgets = await fetchBudgets(userId, { categoryId, includeInactive: false });
  if (!budgets.length) return [];

  const alerts = [];
  const txnDay = dayjs(transactionDate);
  const value = Number(amount) || 0;

  await Promise.all(
    budgets.map(async (budget) => {
      const { start, end } = resolveBudgetWindow(budget);
      if (txnDay.isBefore(start) || txnDay.isAfter(end)) return;

      const usage = await getBudgetUsage(budget);
      const limit = usage.limit;
      if (!limit) return;

      const projected = usage.spent + value;
      const projectedPercentage = (projected / limit) * 100;

      if (projectedPercentage >= 100) {
        alerts.push({
          budgetId: budget.id,
          status: 'exceeded',
          category: budget.Category ? budget.Category.name : undefined,
          limit,
          spent: usage.spent,
          projected,
          window: usage.window,
          message: `Ngân sách ${budget.Category?.name || ''} đã vượt giới hạn.`,
        });
      } else if (projectedPercentage >= 85) {
        alerts.push({
          budgetId: budget.id,
          status: 'warning',
          category: budget.Category ? budget.Category.name : undefined,
          limit,
          spent: usage.spent,
          projected,
          window: usage.window,
          message: `Ngân sách ${budget.Category?.name || ''} đã sử dụng ${projectedPercentage.toFixed(0)}%.`,
        });
      }
    })
  );

  return alerts;
};

const computeDefaultEndDate = (startDate, period) => {
  const unit = PERIOD_UNITS[period] || PERIOD_UNITS.monthly;
  return dayjs(startDate).add(unit.value, unit.unit).subtract(1, 'second');
};

module.exports = {
  fetchBudgets,
  getBudgetUsage,
  getBudgetAlerts,
  resolveBudgetWindow,
  computeDefaultEndDate,
};
