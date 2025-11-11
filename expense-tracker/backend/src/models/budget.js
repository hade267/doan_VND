const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Budget extends Model {}

Budget.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  amount_limit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0.01,
    },
  },
  period: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['daily', 'weekly', 'monthly', 'yearly']],
    },
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Budget',
  tableName: 'budgets',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'category_id', 'period', 'start_date'],
    },
  ],
});

module.exports = Budget;
