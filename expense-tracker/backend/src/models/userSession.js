const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class UserSession extends Model {}

UserSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_sessions',
    modelName: 'UserSession',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['token_hash'],
      },
      {
        fields: ['user_id'],
      },
    ],
  },
);

module.exports = UserSession;
