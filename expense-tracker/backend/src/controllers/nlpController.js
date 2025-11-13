const { Op } = require('sequelize');
const { NlpLog, Category, Transaction } = require('../models');
const { getNlpConfig, saveNlpConfig } = require('../utils/nlpConfig');
const { parseWithGemini } = require('../utils/ai/geminiClient');
const { getCachedResult, setCachedResult } = require('../utils/ai/cache');
const { enforceDailyAiLimit } = require('../utils/ai/aiUsage');

const buildLogWhereClause = (userId, status) => {
  const where = { user_id: userId };
  if (status === 'success') where.is_success = true;
  if (status === 'failed') where.is_success = false;
  return where;
};

const nlpController = {
  async listLogs(req, res) {
    const { status, limit = 20, offset = 0, q } = req.query;
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
        limit: Number(limit),
        offset: Number(offset),
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
      const updated = {
        incomeKeywords: req.body.incomeKeywords || current.incomeKeywords,
        expenseKeywords: req.body.expenseKeywords || current.expenseKeywords,
        categories: req.body.categories || current.categories,
      };
      saveNlpConfig(updated);
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
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: 'GEMINI_API_KEY is not configured.' });
      }

      const cached = getCachedResult(req.user.id, text);
      if (cached) {
        return res.json({ ...cached, engine: 'gemini', cached: true });
      }

      await enforceDailyAiLimit(req.user.id);
      const aiResult = await parseWithGemini(text);
      setCachedResult(req.user.id, text, aiResult);
      return res.json({ ...aiResult, engine: 'gemini', cached: false });
    } catch (error) {
      res.status(500).json({ message: 'Cannot parse text.', error: error.message });
    }
  },
};

module.exports = nlpController;
