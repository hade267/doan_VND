const jwt = require('jsonwebtoken');

const generateToken = (payload, isRefreshToken = false) => {
  const secret = isRefreshToken ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
  const expiresIn = isRefreshToken ? process.env.JWT_REFRESH_EXPIRES_IN : process.env.JWT_EXPIRES_IN;

  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, isRefreshToken = false) => {
  const secret = isRefreshToken ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null; // Invalid token
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
