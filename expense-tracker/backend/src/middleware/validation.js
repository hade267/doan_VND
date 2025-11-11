const { body, validationResult } = require('express-validator');

// Xử lý và trả về lỗi validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  // Trả về lỗi 400 (Bad Request) nếu có lỗi validation
  return res.status(400).json({ errors: errors.array() });
};

// Quy tắc cho route đăng ký
const registerRules = () => {
  return [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email không hợp lệ.'),
    
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Tên đăng nhập là bắt buộc.')
      .isLength({ min: 3 })
      .withMessage('Tên đăng nhập phải có ít nhất 3 ký tự.'),
      
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự.'),
  ];
};

// Quy tắc cho route đăng nhập
const loginRules = () => {
  return [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email không hợp lệ.'),
      
    body('password')
      .notEmpty()
      .withMessage('Mật khẩu là bắt buộc.'),
  ];
};

// Quy tắc cho tạo/cập nhật category
const categoryRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Tên danh mục là bắt buộc.'),
    body('type')
      .isIn(['expense', 'income'])
      .withMessage("Loại (type) phải là 'expense' hoặc 'income'."),
  ];
};

module.exports = {
  validate,
  registerRules,
  loginRules,
  categoryRules,
};