const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class DefaultCategory extends Model {}

DefaultCategory.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
}, {
  sequelize,
  modelName: 'DefaultCategory',
  tableName: 'default_categories',
  timestamps: false, // Bảng này không có createdAt/updatedAt
});

module.exports = DefaultCategory;