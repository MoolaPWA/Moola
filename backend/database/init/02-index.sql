CREATE INDEX idx_users_email ON users(email);

-- Категории
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Транзакции
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);

-- Refresh-токены
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_revoked ON refresh_tokens(expires_at, revoked) WHERE revoked IS NULL;
