const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['expense', 'income']],
    },
  },
  icon: {
    type: DataTypes.STRING(50),
  },
  color: {
    type: DataTypes.STRING(7),
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'name', 'type'],
    },
  ],
});

module.exports = Category;
