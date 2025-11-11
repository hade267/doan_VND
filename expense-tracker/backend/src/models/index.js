const { sequelize } = require('../config/database');
const User = require('./user');
const Category = require('./category');
const Transaction = require('./transaction');
const Budget = require('./budget');

// User associations
User.hasMany(Category, { foreignKey: 'user_id', as: 'categories' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
User.hasMany(Budget, { foreignKey: 'user_id', as: 'budgets' });

// Category associations
Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Category.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions' });
Category.hasMany(Budget, { foreignKey: 'category_id', as: 'budgets' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Transaction.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Budget associations
Budget.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Budget.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

const db = {
  sequelize,
  User,
  Category,
  Transaction,
  Budget,
};

// Function to sync all models
db.syncModels = async () => {
  try {
    // In development, you might want to use { force: true } or { alter: true }
    // Be careful with this in production!
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ All models were synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to synchronize models with the database:', error);
    process.exit(1);
  }
};

module.exports = db;
