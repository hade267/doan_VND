const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
// Lấy thêm categoryRules từ validation
const { validate, categoryRules } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');

// GET /api/categories (Lấy tất cả danh mục của người dùng)
router.get('/', protect, categoryController.getAllCategories);

// GET /api/categories/:id (Lấy 1 danh mục)
router.get('/:id', protect, categoryController.getCategoryById);

// POST /api/categories (Tạo danh mục mới)
router.post(
  '/',
  protect,
  categoryRules(), // 1. Chạy các quy tắc
  validate,        // 2. Kiểm tra kết quả
  categoryController.createCategory
);

// PUT /api/categories/:id (Cập nhật danh mục)
router.put(
  '/:id',
  protect,
  categoryRules(), // Sử dụng lại quy tắc
  validate,
  categoryController.updateCategory
);

// DELETE /api/categories/:id (Xóa danh mục)
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;