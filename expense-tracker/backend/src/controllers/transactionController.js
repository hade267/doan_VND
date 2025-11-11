const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');

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

      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(500).json({ message: 'Error creating transaction.', error: error.message });
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
