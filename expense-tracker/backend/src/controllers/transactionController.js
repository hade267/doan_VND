const { Transaction, Category, NlpLog } = require('../models');
const { Op } = require('sequelize');
const { getBudgetAlerts } = require('../utils/budget');
const { parseNaturalLanguage } = require('../utils/nlp');

const transactionController = {
  // Create a new transaction
  async createTransaction(req, res) {
    const { category_id, amount, type, description, transaction_date } = req.body;
    const userId = req.user.id;

    try {
       // Verify category belongs to user
       if (category_id) {
           const category = await Category.findOne({ where: { id: category_id, user_id: userId }});
           if (!category) {
               return res.status(404).json({ message: "Category not found or doesn't belong to the user." });
           }
           // Ensure transaction type matches category type
            if (category.type !== type) {
                return res.status(400).json({ message: `Transaction type '${type}' does not match category type '${category.type}'.` });
            }
       }

      const newTransaction = await Transaction.create({
        user_id: userId,
        category_id,
        amount,
        type,
        description,
        transaction_date,
      });

      const budgetAlerts =
        type === 'expense'
          ? await getBudgetAlerts({
              userId,
              categoryId: category_id,
              amount,
              transactionDate: transaction_date,
            })
          : [];

      res.status(201).json({ transaction: newTransaction, budgetAlerts });
    } catch (error) {
      res.status(500).json({ message: 'Error creating transaction.', error: error.message });
    }
  },

  async createTransactionFromNLP(req, res) {
    const userId = req.user.id;
    const { text, overrides = {}, confirm = false } = req.body;

    if (!text || text.trim().length < 3) {
      console.log('[NLP] Invalid text input', { userId, text });
      return res.status(400).json({ message: 'Please provide a valid sentence.' });
    }

    try {
      console.log('[NLP] Parsing text', { userId, text });

      const parsed = parseNaturalLanguage(text);
      const engine = 'rules';
      const confidenceValues =
        typeof parsed.confidence === 'number'
          ? [parsed.confidence]
          : Object.values(parsed.confidence || {});
      const confidenceScore =
        confidenceValues.length > 0
          ? confidenceValues.reduce((sum, value) => sum + Number(value || 0), 0) /
            confidenceValues.length
          : 0.6;
      const meta = {
        ai: confidenceScore,
        cached: false,
      };

      const finalData = {
        ...parsed,
        ...overrides,
      };

      if (!confirm) {
        return res.status(200).json({
          requiresConfirmation: true,
          parsed: finalData,
          meta,
          message: 'Xác nhận dữ liệu trước khi lưu giao dịch.',
        });
      }

      if (!finalData.amount || Number.isNaN(finalData.amount)) {
        console.log('[NLP] Missing amount detected', { userId, parsed, overrides });
        return res.status(400).json({ message: 'Could not detect amount from sentence.' });
      }

      const categoryName = finalData.category;
      if (!categoryName) {
        console.log('[NLP] Missing category detected', { userId, parsed, overrides });
        return res.status(400).json({ message: 'Could not detect category from sentence.' });
      }
      let category = await Category.findOne({
        where: { user_id: userId, name: categoryName, type: finalData.type },
      });

      if (!category) {
        category = await Category.create({
          user_id: userId,
          name: categoryName,
          type: finalData.type,
          icon: overrides.icon || '📝',
          color: overrides.color || '#9CA3AF',
          is_default: false,
        });
      }

      const transaction = await Transaction.create({
        user_id: userId,
        category_id: category.id,
        amount: finalData.amount,
        type: finalData.type,
        description: finalData.description,
        transaction_date: new Date(finalData.date || finalData.transaction_date || Date.now()),
      });

      await NlpLog.create({
        user_id: userId,
        input_text: text,
        parsed_json: parsed,
        corrections: overrides,
        transaction_id: transaction.id,
        is_success: true,
        engine,
        confidence: confidenceScore,
        meta,
      });

      const budgetAlerts =
        transaction.type === 'expense'
          ? await getBudgetAlerts({
              userId,
              categoryId: transaction.category_id,
              amount: transaction.amount,
              transactionDate: transaction.transaction_date,
            })
          : [];

        console.log('[NLP] Transaction created successfully', {
          userId,
          transactionId: transaction.id,
          parsed,
        });
        res.status(201).json({ transaction, budgetAlerts });
    } catch (error) {
      console.error('[NLP] Failed to process text', { userId, text, error: error.message });
      await NlpLog.create({
        user_id: userId,
        input_text: text,
        parsed_json: { error: error.message },
        corrections: overrides,
        engine: 'rules',
        is_success: false,
      }).catch(() => {});
      res.status(500).json({ message: 'Error parsing natural language input.', error: error.message });
    }
  },

  // Get all transactions for the logged-in user with filtering
  async getUserTransactions(req, res) {
    const userId = req.user.id;
    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const whereClause = { user_id: userId };
        if (type) whereClause.type = type;
        if (category) whereClause.category_id = category;
        if (startDate && endDate) {
            whereClause.transaction_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

      const { count, rows } = await Transaction.findAndCountAll({
          where: whereClause,
          include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
          order: [['transaction_date', 'DESC']],
          limit: parseInt(limit),
          offset: parseInt(offset)
      });

      res.status(200).json({
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          transactions: rows
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions.', error: error.message });
    }
  },

  // Get a single transaction by ID
  async getTransactionById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const transaction = await Transaction.findOne({ where: { id, user_id: userId }, include: 'category' });
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found.' });
      }
      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transaction.', error: error.message });
    }
  },

  // Update a transaction
  async updateTransaction(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { category_id, amount, description, transaction_date } = req.body;

    try {
      const transaction = await Transaction.findOne({ where: { id, user_id: userId } });
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found.' });
      }

      // Verify new category if changed
       if (category_id && category_id !== transaction.category_id) {
           const category = await Category.findOne({ where: { id: category_id, user_id: userId }});
           if (!category) {
               return res.status(404).json({ message: "New category not found." });
           }
            if (category.type !== transaction.type) {
                return res.status(400).json({ message: `Cannot change category to one with a different type.` });
            }
       }

      await transaction.update({ category_id, amount, description, transaction_date });
      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error updating transaction.', error: error.message });
    }
  },

  // Delete a transaction
  async deleteTransaction(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const transaction = await Transaction.findOne({ where: { id, user_id: userId } });
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found.' });
      }

      await transaction.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting transaction.', error: error.message });
    }
  },
};

module.exports = transactionController;
