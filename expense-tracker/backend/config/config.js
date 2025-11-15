require('dotenv').config();

const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const {
    DB_USER = 'postgres',
    DB_PASSWORD = '',
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'expense_tracker',
  } = process.env;
  return `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

module.exports = {
  development: {
    url: getDatabaseUrl(),
    dialect: 'postgres',
  },
  test: {
    url: getDatabaseUrl(),
    dialect: 'postgres',
    logging: false,
  },
  production: {
    url: getDatabaseUrl(),
    dialect: 'postgres',
    logging: false,
  },
};
