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
