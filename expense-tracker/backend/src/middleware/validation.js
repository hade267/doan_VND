const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

const registerRules = () => [
  body('email').trim().isEmail().withMessage('Email không hợp lệ.'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Tên đăng nhập là bắt buộc.')
    .isLength({ min: 3 })
    .withMessage('Tên đăng nhập phải có ít nhất 3 ký tự.'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Họ và tên là bắt buộc.')
    .isLength({ min: 3 })
    .withMessage('Họ và tên phải có ít nhất 3 ký tự.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu phải có ít nhất 8 ký tự.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .withMessage('Mật khẩu phải bao gồm chữ thường, chữ hoa, chữ số và ký tự đặc biệt.'),
];

const loginRules = () => [
  body('email').trim().isEmail().withMessage('Email không hợp lệ.'),
  body('password').notEmpty().withMessage('Mật khẩu là bắt buộc.'),
];

const categoryRules = () => [
  body('name').trim().notEmpty().withMessage('Tên danh mục là bắt buộc.'),
  body('type').isIn(['expense', 'income']).withMessage("Loại hợp lệ là 'expense' hoặc 'income'."),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  categoryRules,
};
