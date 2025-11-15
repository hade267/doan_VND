const {
  User,
  Category,
  DefaultCategory,
  sequelize,
} = require('../models');
const { generateToken, verifyToken } = require('../utils/jwt');
const {
  createSession,
  findValidSession,
  revokeSession,
  rotateSession,
  revokeAllSessions,
} = require('../services/sessionService');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookies');

const buildUserPayload = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

const createTokenPair = (user) => ({
  accessToken: generateToken({ id: user.id, role: user.role }),
  refreshToken: generateToken({ id: user.id, role: user.role }, true),
});

const sendAuthResponse = async ({ user, req, res, statusCode, message }) => {
  const tokens = createTokenPair(user);
  await createSession({
    userId: user.id,
    refreshToken: tokens.refreshToken,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  return res.status(statusCode).json({
    message,
    user: buildUserPayload(user),
  });
};

const authController = {
  async register(req, res) {
    const { username, email, password, full_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const transaction = await sequelize.transaction();

    try {
      const newUser = await User.create(
        {
          username,
          email,
          password_hash: password,
          full_name,
        },
        { transaction },
      );

      const defaultCategories = await DefaultCategory.findAll();
      const userCategories = defaultCategories.map((cat) => ({
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        is_default: false,
        user_id: newUser.id,
      }));

      await Category.bulkCreate(userCategories, { transaction });
      await transaction.commit();

      return sendAuthResponse({
        user: newUser,
        req,
        res,
        statusCode: 201,
        message: 'User registered successfully!',
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    return sendAuthResponse({
      user,
      req,
      res,
      statusCode: 200,
      message: 'Logged in successfully!',
    });
  },

  async refresh(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Missing refresh token.' });
    }

    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      await revokeSession(await findValidSession(refreshToken));
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const session = await findValidSession(refreshToken);
    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Refresh token revoked or expired.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      await revokeSession(session);
      clearAuthCookies(res);
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    if (!user.is_active) {
      await revokeSession(session);
      clearAuthCookies(res);
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const tokens = createTokenPair(user);
    await rotateSession(session, tokens.refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res.status(200).json({
      message: 'Session refreshed successfully.',
      user: buildUserPayload(user),
    });
  },

  async logout(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const session = await findValidSession(refreshToken);
      await revokeSession(session);
    }
    clearAuthCookies(res);

    return res.status(200).json({ message: 'Logged out successfully.' });
  },

  async logoutAll(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await revokeAllSessions(req.user.id);
    clearAuthCookies(res);
    return res.status(200).json({ message: 'Logged out from all devices.' });
  },
};

module.exports = authController;
