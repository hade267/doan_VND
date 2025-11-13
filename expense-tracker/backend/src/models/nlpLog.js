const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class NlpLog extends Model {}

NlpLog.init(
  {
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
    input_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parsed_json: {
      type: DataTypes.JSONB,
    },
    is_success: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    corrections: {
      type: DataTypes.JSONB,
    },
    feedback: {
      type: DataTypes.TEXT,
    },
    engine: {
      type: DataTypes.STRING(50),
      defaultValue: 'rule',
    },
    confidence: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    meta: {
      type: DataTypes.JSONB,
    },
    transaction_id: {
      type: DataTypes.UUID,
      references: {
        model: 'transactions',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'NlpLog',
    tableName: 'nlp_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = NlpLog;
