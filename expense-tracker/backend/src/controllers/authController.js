// Thêm Category, DefaultCategory và sequelize từ models
const { User, Category, DefaultCategory, sequelize } = require('../models');
const { generateToken } = require('../utils/jwt');

const authController = {
  // Register a new user
  async register(req, res) {
    const { username, email, password, full_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Sử dụng transaction
    const transaction = await sequelize.transaction();

    try {
      // 1. Create new user
      const newUser = await User.create({
        username,
        email,
        password_hash: password, // Hook sẽ hash
        full_name,
      }, { transaction });

      // 2. Lấy tất cả danh mục mặc định
      const defaultCategories = await DefaultCategory.findAll();

      // 3. Chuẩn bị dữ liệu danh mục mới cho người dùng
      const userCategories = defaultCategories.map(cat => {
        return {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          is_default: false, 
          user_id: newUser.id, // Liên kết với user mới
        };
      });

      // 4. Tạo hàng loạt các danh mục mới cho user
      await Category.bulkCreate(userCategories, { transaction });

      // 5. Nếu mọi thứ thành công, commit transaction
      await transaction.commit();

      // Generate tokens
      const accessToken = generateToken({ id: newUser.id, role: newUser.role });

      res.status(201).json({
        message: 'User registered successfully!',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
        accessToken,
      });

    } catch (error) {
      // Nếu có lỗi, rollback tất cả thay đổi
      await transaction.rollback();
      
      // Ném lỗi để middleware xử lý lỗi tập trung bắt
      throw error; 
    }
  },

  // Login an existing user
  async login(req, res) {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    // Generate tokens
    const accessToken = generateToken({ id: user.id, role: user.role });

    res.status(200).json({
      message: 'Logged in successfully!',
      accessToken,
    });
  },
};

module.exports = authController;