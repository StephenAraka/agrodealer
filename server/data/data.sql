CREATE TABLE IF NOT EXISTS users (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(120) NOT NULL,
	username VARCHAR(60) NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	phone_number VARCHAR(20) NOT NULL UNIQUE,
	is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
	phone_number VARCHAR(20) NOT NULL,
	purpose VARCHAR(30) NOT NULL,
	otp_code VARCHAR(10) NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	consumed_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_purpose ON otp_codes(phone_number, purpose);

CREATE TABLE IF NOT EXISTS wallets (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
	balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0)
);

CREATE TABLE IF NOT EXISTS products (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(180) NOT NULL,
	price NUMERIC(12, 2) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT products_price_positive CHECK (price > 0)
);

CREATE TABLE IF NOT EXISTS transactions (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	transaction_type VARCHAR(20) NOT NULL,
	status VARCHAR(20) NOT NULL,
	amount NUMERIC(12, 2) NOT NULL,
	balance_before NUMERIC(12, 2) NOT NULL,
	balance_after NUMERIC(12, 2) NOT NULL,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT transactions_amount_positive CHECK (amount > 0),
	CONSTRAINT transactions_type_check CHECK (transaction_type IN ('purchase', 'topup')),
	CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'success', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS transaction_items (
	id BIGSERIAL PRIMARY KEY,
	transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
	product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
	product_name VARCHAR(180) NOT NULL,
	unit_price NUMERIC(12, 2) NOT NULL,
	quantity INTEGER NOT NULL,
	line_total NUMERIC(12, 2) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CONSTRAINT transaction_items_unit_price_positive CHECK (unit_price > 0),
	CONSTRAINT transaction_items_quantity_positive CHECK (quantity > 0),
	CONSTRAINT transaction_items_line_total_positive CHECK (line_total > 0)
);
