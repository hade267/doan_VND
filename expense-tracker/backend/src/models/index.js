const { sequelize } = require('../config/database');
const User = require('./user');
const Category = require('./category');
const Transaction = require('./transaction');
const Budget = require('./budget');
const DefaultCategory = require('./defaultCategory');
const NlpLog = require('./nlpLog');

// Định nghĩa các mối quan hệ (associations)

// User -> Category (One-to-Many)
User.hasMany(Category, { 
  foreignKey: 'user_id', 
  onDelete: 'CASCADE' 
});
Category.belongsTo(User, { 
  foreignKey: 'user_id' 
});

// User -> Transaction (One-to-Many)
User.hasMany(Transaction, { 
  foreignKey: 'user_id', 
  onDelete: 'CASCADE' 
});
Transaction.belongsTo(User, { 
  foreignKey: 'user_id' 
});

// Category -> Transaction (One-to-Many)
Category.hasMany(Transaction, { 
  foreignKey: 'category_id', 
  onDelete: 'SET NULL',
  as: 'transactions',
});
Transaction.belongsTo(Category, { 
  foreignKey: 'category_id',
  as: 'category',
});

// User -> Budget (One-to-Many)
User.hasMany(Budget, { 
  foreignKey: 'user_id', 
  onDelete: 'CASCADE' 
});
Budget.belongsTo(User, { 
  foreignKey: 'user_id' 
});

// Category -> Budget (One-to-Many)
Category.hasMany(Budget, { 
  foreignKey: 'category_id', 
  onDelete: 'CASCADE' 
});
Budget.belongsTo(Category, { 
  foreignKey: 'category_id' 
});

// User -> NlpLog (One-to-Many)
User.hasMany(NlpLog, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});
NlpLog.belongsTo(User, {
  foreignKey: 'user_id',
});

// Sync database models
const syncModels = async () => {
  try {
    const shouldAlter =
      process.env.DB_AUTO_SYNC === 'true' ||
      (!process.env.DB_AUTO_SYNC && process.env.NODE_ENV === 'development');
    await sequelize.sync({ force: false, alter: shouldAlter });
    console.log('✅ Database models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database models:', error);
    throw error;
  }
};

// Xuất tất cả models và sequelize instance
module.exports = {
  sequelize,
  User,
  Category,
  Transaction,
  Budget,
  DefaultCategory,
  NlpLog,
  syncModels,
};
