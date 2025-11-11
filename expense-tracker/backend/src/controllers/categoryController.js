const { Category } = require('../models');

const categoryController = {
  // Create a new category
  async createCategory(req, res) {
    const { name, type, icon, color } = req.body;
    const userId = req.user.id;

    try {
      const newCategory = await Category.create({
        user_id: userId,
        name,
        type,
        icon,
        color,
      });

      res.status(201).json(newCategory);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'A category with this name and type already exists.' });
      }
      res.status(500).json({ message: 'Error creating category.', error: error.message });
    }
  },

  // Get all categories for the logged-in user
  async getUserCategories(req, res) {
    const userId = req.user.id;
    const { type } = req.query; // Filter by type (e.g., 'income', 'expense')

    try {
        const whereClause = { user_id: userId };
        if (type) {
            whereClause.type = type;
        }
      const categories = await Category.findAll({ where: whereClause });
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories.', error: error.message });
    }
  },

  // Get a single category by ID
  async getCategoryById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const category = await Category.findOne({ where: { id, user_id: userId } });
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category.', error: error.message });
    }
  },

  // Update a category
  async updateCategory(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, icon, color } = req.body;

    try {
      const category = await Category.findOne({ where: { id, user_id: userId } });
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      await category.update({ name, icon, color });
      res.status(200).json(category);
    } catch (error) {
       if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'A category with this name and type already exists.' });
      }
      res.status(500).json({ message: 'Error updating category.', error: error.message });
    }
  },

  // Delete a category
  async deleteCategory(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const category = await Category.findOne({ where: { id, user_id: userId } });
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      await category.destroy();
      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category.', error: error.message });
    }
  },
};

module.exports = categoryController;
