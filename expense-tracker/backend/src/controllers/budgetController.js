const { Budget, Category } = require('../models');

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

      const newBudget = await Budget.create({
        user_id: userId,
        category_id,
        amount_limit,
        period,
        start_date,
        end_date,
      });
      res.status(201).json(newBudget);
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
      const budgets = await Budget.findAll({ where: { user_id: userId }, include: 'category' });
      res.status(200).json(budgets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching budgets.', error: error.message });
    }
  },

  // Get a single budget by ID
  async getBudgetById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    try {
      const budget = await Budget.findOne({ where: { id, user_id: userId }, include: 'category' });
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }
      res.status(200).json(budget);
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

      await budget.update({ amount_limit, period, start_date, end_date, is_active });
      res.status(200).json(budget);
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
