const { Category } = require('../models');

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
const getAllCategories = async (req, res) => {
  const categories = await Category.findAll({
    where: { user_id: req.user.id },
    order: [['type', 'ASC'], ['name', 'ASC']]
  });
  res.status(200).json(categories);
};

// @desc    Get single category by id
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOne({
    where: { id, user_id: req.user.id }
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found.' });
  }
  res.status(200).json(category);
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  const { name, type, icon, color } = req.body;

  // Validation middleware đã xử lý name và type
  // Kiểm tra xem đã tồn tại chưa
  const existingCategory = await Category.findOne({
    where: {
      user_id: req.user.id,
      name,
      type
    }
  });

  if (existingCategory) {
    return res.status(409).json({ message: 'Category with this name and type already exists.' });
  }

  const newCategory = await Category.create({
    user_id: req.user.id,
    name,
    type,
    icon,
    color,
    is_default: false
  });

  res.status(201).json(newCategory);
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, type, icon, color } = req.body;

  const category = await Category.findOne({
    where: { id, user_id: req.user.id }
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  // Cập nhật các trường
  category.name = name;
  category.type = type;
  category.icon = icon;
  category.color = color;

  await category.save();

  res.status(200).json(category);
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findOne({
    where: { id, user_id: req.user.id }
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  await category.destroy();

  res.status(200).json({ message: 'Category deleted successfully.' });
};

// PHẦN QUAN TRỌNG NHẤT LÀ ĐÂY:
module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};