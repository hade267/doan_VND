const dayjs = require('dayjs');
const { Budget, Category } = require('../models');
const { fetchBudgets, getBudgetUsage, computeDefaultEndDate } = require('../utils/budget');

const budgetController = {
  // Create a new budget
  async createBudget(req, res) {
    const { category_id, amount_limit, period, start_date, end_date } = req.body;
    const userId = req.user.id;

    try {
        // Verify category belongs to user and is an expense category
        const category = await Category.findOne({ where: { id: category_id, user_id: userId }});
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }
        if (category.type !== 'expense') {
            return res.status(400).json({ message: "Budgets can only be set for expense categories." });
        }

      const normalizedStart = dayjs(start_date);
      const normalizedEnd = end_date ? dayjs(end_date) : computeDefaultEndDate(start_date, period);

      const newBudget = await Budget.create({
        user_id: userId,
        category_id,
        amount_limit,
        period,
        start_date: normalizedStart.toDate(),
        end_date: normalizedEnd.toDate(),
      });
      const usage = await getBudgetUsage(newBudget);
      res.status(201).json({ ...newBudget.toJSON(), usage });
    } catch (error) {
       if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'A budget for this category, period, and start date already exists.' });
      }
      res.status(500).json({ message: 'Error creating budget.', error: error.message });
    }
  },

  // Get all budgets for the logged-in user
  async getUserBudgets(req, res) {
    const userId = req.user.id;
    try {
      const budgets = await fetchBudgets(userId);
      const enriched = await Promise.all(
        budgets.map(async (budget) => ({
          ...budget.toJSON(),
          usage: await getBudgetUsage(budget),
        }))
      );
      res.status(200).json(enriched);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching budgets.', error: error.message });
    }
  },

  // Get a single budget by ID
  async getBudgetById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const budget = await Budget.findOne({ where: { id, user_id: userId }, include: { model: Category } });
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }
      const usage = await getBudgetUsage(budget);
      res.status(200).json({ ...budget.toJSON(), usage });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching budget.', error: error.message });
    }
  },

  // Update a budget
  async updateBudget(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount_limit, period, start_date, end_date, is_active } = req.body;

    try {
      const budget = await Budget.findOne({ where: { id, user_id: userId } });
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }

      const payload = {
        amount_limit,
        period,
        start_date,
        end_date,
        is_active,
      };

      if (start_date) {
        payload.start_date = dayjs(start_date).toDate();
      }
      if (!end_date && payload.period && payload.start_date) {
        payload.end_date = computeDefaultEndDate(payload.start_date, payload.period).toDate();
      } else if (end_date) {
        payload.end_date = dayjs(end_date).toDate();
      }

      await budget.update(payload);
      const usage = await getBudgetUsage(budget);
      res.status(200).json({ ...budget.toJSON(), usage });
    } catch (error) {
      res.status(500).json({ message: 'Error updating budget.', error: error.message });
    }
  },

  // Delete a budget
  async deleteBudget(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const budget = await Budget.findOne({ where: { id, user_id: userId } });
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }
      await budget.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting budget.', error: error.message });
    }
  },
};

module.exports = budgetController;
