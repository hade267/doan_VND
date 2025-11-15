'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(100),
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'user',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verification_token: {
        type: Sequelize.STRING(128),
      },
      verification_token_expires: {
        type: Sequelize.DATE,
      },
      failed_login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lockout_until: {
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.createTable('default_categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING(50),
      },
      color: {
        type: Sequelize.STRING(7),
      },
    });

    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING(50),
      },
      color: {
        type: Sequelize.STRING(7),
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('categories', {
      fields: ['user_id', 'name', 'type'],
      type: 'unique',
      name: 'categories_user_name_type_unique',
    });

    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.UUID,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.createTable('budgets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount_limit: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      period: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('budgets', {
      fields: ['user_id', 'category_id', 'period', 'start_date'],
      type: 'unique',
      name: 'budgets_user_category_period_start_unique',
    });

    await queryInterface.createTable('nlp_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      transaction_id: {
        type: Sequelize.UUID,
        references: {
          model: 'transactions',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      input_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      parsed_json: {
        type: Sequelize.JSONB,
      },
      is_success: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      corrections: {
        type: Sequelize.JSONB,
      },
      feedback: {
        type: Sequelize.TEXT,
      },
      engine: {
        type: Sequelize.STRING(50),
        defaultValue: 'rule',
      },
      confidence: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      metadata: {
        type: Sequelize.JSONB,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      token_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.STRING(255),
      },
      ip_address: {
        type: Sequelize.STRING(64),
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked_at: {
        type: Sequelize.DATE,
      },
      metadata: {
        type: Sequelize.JSONB,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      entity: {
        type: Sequelize.STRING(100),
      },
      entity_id: {
        type: Sequelize.STRING(100),
      },
      metadata: {
        type: Sequelize.JSONB,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('transactions', ['user_id', 'transaction_date'], {
      name: 'transactions_user_date_idx',
    });
    await queryInterface.addIndex('transactions', ['user_id', 'type'], {
      name: 'transactions_user_type_idx',
    });
    await queryInterface.addIndex('budgets', ['user_id', 'category_id', 'period'], {
      name: 'budgets_user_category_period_idx',
    });
    await queryInterface.addIndex('nlp_logs', ['user_id', 'created_at'], {
      name: 'nlp_logs_user_created_idx',
    });
    await queryInterface.addIndex('refresh_tokens', ['user_id'], {
      name: 'refresh_tokens_user_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('refresh_tokens', 'refresh_tokens_user_idx');
    await queryInterface.removeIndex('nlp_logs', 'nlp_logs_user_created_idx');
    await queryInterface.removeIndex('budgets', 'budgets_user_category_period_idx');
    await queryInterface.removeIndex('transactions', 'transactions_user_type_idx');
    await queryInterface.removeIndex('transactions', 'transactions_user_date_idx');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('nlp_logs');
    await queryInterface.dropTable('budgets');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('default_categories');
    await queryInterface.dropTable('users');
  },
};
