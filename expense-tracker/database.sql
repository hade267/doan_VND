-- Drop database if exists (for development)
DROP DATABASE IF EXISTS expense_tracker;

-- Create database
CREATE DATABASE expense_tracker;

-- Connect to database
\c expense_tracker;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    icon VARCHAR(50),
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name, type)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount_limit DECIMAL(12,2) NOT NULL CHECK (amount_limit > 0),
    period VARCHAR(10) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, period, start_date)
);

-- NLP Logs table (for improving parser)
CREATE TABLE nlp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    parsed_result JSONB,
    is_correct BOOLEAN,
    corrected_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for refresh tokens)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_nlp_logs_user ON nlp_logs(user_id);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories (template for new users)
CREATE TABLE default_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    icon VARCHAR(50),
    color VARCHAR(7)
);

INSERT INTO default_categories (name, type, icon, color) VALUES
-- Expense categories
('Ăn uống', 'expense', '🍔', '#FF6B6B'),
('Đi lại', 'expense', '🚗', '#4ECDC4'),
('Mua sắm', 'expense', '🛍️', '#45B7D1'),
('Giải trí', 'expense', '🎮', '#96CEB4'),
('Hóa đơn', 'expense', '📄', '#FECA57'),
('Sức khỏe', 'expense', '🏥', '#FF9FF3'),
('Giáo dục', 'expense', '📚', '#54A0FF'),
('Nhà cửa', 'expense', '🏠', '#48DBFB'),
-- Income categories
('Lương', 'income', '💰', '#00D2D3'),
('Thưởng', 'income', '🎁', '#55EFC4'),
('Đầu tư', 'income', '📈', '#FDCB6E'),
('Khác', 'income', '💵', '#6C5CE7');

-- Sample data for testing (optional)
-- Uncomment below to add test data

/*
# Tiếp tục file database.sql
-- Test user (password: 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('demo', 'demo@example.com', '$2b$10$YKpZ1e3VEZxM6v5RnZvJpuD5eW9lVcR6tFh7YQ4rK5ZvN9jKqKZ5W', 'Demo User', 'user'),
('admin', 'admin@example.com', '$2b$10$YKpZ1e3VEZxM6v5RnZvJpuD5eW9lVcR6tFh7YQ4rK5ZvN9jKqKZ5W', 'Admin User', 'admin');
*/
