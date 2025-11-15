const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { NlpLog, Category, Transaction } = require('../models');
const { logAudit } = require('../utils/auditLogger');
const { getNlpConfig, saveNlpConfig } = require('../utils/nlpConfig');
const { parseNaturalLanguage } = require('../utils/nlp');
const { buildSummary } = require('./reportController');

const isNlpLoggingEnabled = process.env.NLP_LOGGING_ENABLED !== 'false';
const respondLogsDisabled = (res) =>
  res.status(404).json({ message: 'NLP logging features are disabled in production.' });

const buildLogWhereClause = (userId, status) => {
  const where = { user_id: userId };
  if (status === 'success') where.is_success = true;
  if (status === 'failed') where.is_success = false;
  return where;
};

const PERIOD_PRESETS = [
  {
    label: 'hôm nay',
    keywords: ['hôm nay', 'today', 'ngày hôm nay'],
    range: () => {
      const start = dayjs().startOf('day');
      return {
        startDate: start.toISOString(),
        endDate: start.endOf('day').toISOString(),
        label: 'hôm nay',
      };
    },
  },
  {
    label: 'tuần này',
    keywords: ['tuần này', 'this week'],
    range: () => {
      const start = dayjs().startOf('week');
      return {
        startDate: start.toISOString(),
        endDate: start.endOf('week').toISOString(),
        label: 'tuần này',
      };
    },
  },
  {
    label: 'tháng này',
    keywords: ['tháng này', 'this month'],
    range: () => {
      const start = dayjs().startOf('month');
      return {
        startDate: start.toISOString(),
        endDate: start.endOf('month').toISOString(),
        label: 'tháng này',
      };
    },
  },
  {
    label: 'năm nay',
    keywords: ['năm nay', 'this year'],
    range: () => {
      const start = dayjs().startOf('year');
      return {
        startDate: start.toISOString(),
        endDate: start.endOf('year').toISOString(),
        label: 'năm nay',
      };
    },
  },
];

const resolvePeriod = (text) => {
  const lowered = text.toLowerCase();
  for (const preset of PERIOD_PRESETS) {
    if (preset.keywords.some((kw) => lowered.includes(kw))) {
      return preset.range();
    }
  }
  const start = dayjs().startOf('month');
  return {
    startDate: start.toISOString(),
    endDate: start.endOf('month').toISOString(),
    label: 'tháng này',
  };
};

const METRIC_KEYWORDS = {
  income: ['thu nhập', 'income', 'kiếm được'],
  expense: ['chi tiêu', 'tiêu bao nhiêu', 'expense', 'đã tiêu', 'đã chi'],
  balance: ['cân bằng', 'số dư', 'còn lại', 'balance'],
};

const detectMetric = (text) => {
  const lowered = text.toLowerCase();
  if (METRIC_KEYWORDS.income.some((kw) => lowered.includes(kw))) return 'income';
  if (METRIC_KEYWORDS.expense.some((kw) => lowered.includes(kw))) return 'expense';
  if (METRIC_KEYWORDS.balance.some((kw) => lowered.includes(kw))) return 'balance';
  return null;
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const nlpController = {
  async listLogs(req, res) {
    if (!isNlpLoggingEnabled) {
      return respondLogsDisabled(res);
    }
    const { status, q } = req.query;
    const requestedLimit = Number(req.query.limit);
    const requestedOffset = Number(req.query.offset);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20;
    const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;
    try {
      const where = buildLogWhereClause(req.user.id, status);
      if (q) {
        where.input_text = {
          [Op.iLike]: `%${q}%`,
        };
      }

      const logs = await NlpLog.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      res.json({
        total: logs.count,
        items: logs.rows,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching NLP logs.', error: error.message });
    }
  },

  async updateLog(req, res) {
    if (!isNlpLoggingEnabled) {
      return respondLogsDisabled(res);
    }
    const { id } = req.params;
    const { is_success, feedback, corrections } = req.body;

    try {
      const log = await NlpLog.findOne({ where: { id, user_id: req.user.id } });
      if (!log) {
        return res.status(404).json({ message: 'Log not found.' });
      }

      await log.update({
        ...(typeof is_success === 'boolean' ? { is_success } : {}),
        ...(feedback !== undefined ? { feedback } : {}),
        ...(corrections !== undefined ? { corrections } : {}),
      });

      res.json(log);
    } catch (error) {
      res.status(500).json({ message: 'Error updating NLP log.', error: error.message });
    }
  },

  async reapplyLog(req, res) {
    if (!isNlpLoggingEnabled) {
      return respondLogsDisabled(res);
    }
    const { id } = req.params;
    const overrides = req.body.overrides || {};

    try {
      const log = await NlpLog.findOne({ where: { id, user_id: req.user.id } });
      if (!log) {
        return res.status(404).json({ message: 'Log not found.' });
      }

      const baseData = {
        ...(log.parsed_json || {}),
        ...(log.corrections || {}),
        ...overrides,
      };

      if (!baseData.amount || !baseData.category) {
        return res.status(400).json({ message: 'Log is missing amount or category data.' });
      }

      const type = baseData.type || 'expense';
      const categoryName = baseData.category;

      let category = await Category.findOne({
        where: { user_id: req.user.id, name: categoryName, type },
      });

      if (!category) {
        category = await Category.create({
          user_id: req.user.id,
          name: categoryName,
          type,
          icon: baseData.icon || '📝',
          color: baseData.color || '#94a3b8',
          is_default: false,
        });
      }

      const transaction = await Transaction.create({
        user_id: req.user.id,
        category_id: category.id,
        amount: baseData.amount,
        type,
        description: baseData.description || log.input_text,
        transaction_date: new Date(baseData.date || Date.now()),
      });

      await log.update({
        is_success: true,
        corrections: baseData,
        transaction_id: transaction.id,
      });

      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error re-applying NLP log.', error: error.message });
    }
  },

  async getConfig(req, res) {
    try {
      res.json(getNlpConfig());
    } catch (error) {
      res.status(500).json({ message: 'Unable to load NLP config.', error: error.message });
    }
  },

  async updateConfig(req, res) {
    try {
      const current = getNlpConfig();
      const { confirm = false } = req.body;
      const updated = {
        incomeKeywords: req.body.incomeKeywords || current.incomeKeywords,
        expenseKeywords: req.body.expenseKeywords || current.expenseKeywords,
        categories: req.body.categories || current.categories,
      };

      if (!confirm) {
        return res.json({
          requiresConfirmation: true,
          preview: updated,
          message: 'Xác nhận cấu hình NLP trước khi lưu.',
        });
      }

      saveNlpConfig(updated);
      await logAudit({
        userId: req.user.id,
        action: 'nlp:update_config',
        entity: 'nlp_config',
        metadata: {
          previous: current,
          updated,
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Unable to update NLP config.', error: error.message });
    }
  },

  async quickParse(req, res) {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required.' });
    }
    try {
      const parsed = parseNaturalLanguage(text);
      return res.json({ ...parsed, engine: 'rules', cached: false });
    } catch (error) {
      res.status(500).json({ message: 'Cannot parse text.', error: error.message });
    }
  },

  async askSummary(req, res) {
    const { text } = req.body;
    if (!text || text.trim().length < 3) {
      return res.status(400).json({ message: 'Vui lòng nhập câu hỏi.' });
    }
    try {
      const period = resolvePeriod(text);
      const summary = await buildSummary({
        userId: req.user.id,
        startDate: period.startDate,
        endDate: period.endDate,
      });

      const metric = detectMetric(text);
      const lowered = text.toLowerCase();
      const categoryMatch =
        summary.categoryBreakdown?.find((item) => {
          const name = item.category?.name?.toLowerCase();
          return name && lowered.includes(name);
        }) || null;

      let answer = '';
      if (categoryMatch) {
        answer =
          categoryMatch.type === 'income'
            ? `Danh mục ${categoryMatch.category.name} đã ghi nhận thu ${formatCurrency(categoryMatch.total)} trong ${
                period.label
              }.`
            : `Bạn đã chi ${formatCurrency(categoryMatch.total)} cho ${categoryMatch.category.name} trong ${period.label}.`;
      } else if (metric === 'income') {
        answer = `Thu nhập ${period.label} của bạn là ${formatCurrency(summary.totalIncome)}.`;
      } else if (metric === 'expense') {
        answer = `Bạn đã chi ${formatCurrency(summary.totalExpense)} trong ${period.label}.`;
      } else if (metric === 'balance') {
        answer = `Số dư ${period.label} là ${formatCurrency(summary.balance)} (thu ${formatCurrency(
          summary.totalIncome
        )} - chi ${formatCurrency(summary.totalExpense)}).`;
      } else {
        answer = `Trong ${period.label}, bạn thu ${formatCurrency(summary.totalIncome)} và chi ${formatCurrency(
          summary.totalExpense
        )}.`;
      }

      res.json({
        answer,
        summary,
        context: {
          period,
          metric: metric || (categoryMatch ? categoryMatch.category?.name : null),
        },
      });
    } catch (error) {
      console.error('[NLP] askSummary failed', error);
      res.status(500).json({ message: 'Không thể trả lời câu hỏi.', error: error.message });
    }
  },
};

module.exports = nlpController;
