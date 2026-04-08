import pool from "../config/db.js";

const getExecutor = (dbClient) => dbClient || pool;

const normalizeUser = (row) => {
	if (!row) return null;

	return {
		id: Number(row.id),
		name: row.name,
		username: row.username,
		password_hash: row.password_hash,
		phone_number: row.phone_number,
		is_phone_verified: row.is_phone_verified,
		created_at: row.created_at,
		updated_at: row.updated_at,
	};
};

export const createUser = async ({ name, username, passwordHash, phoneNumber }, dbClient = null) => {
	const executor = getExecutor(dbClient);
	const query = `
		INSERT INTO users (name, username, password_hash, phone_number)
		VALUES ($1, $2, $3, $4)
		RETURNING *
	`;

	const values = [name, username, passwordHash, phoneNumber];
	const result = await executor.query(query, values);
	return normalizeUser(result.rows[0]);
};

export const findUserByUsername = async (username, dbClient = null) => {
	const executor = getExecutor(dbClient);
	const result = await executor.query(
		"SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1",
		[username],
	);

	return normalizeUser(result.rows[0]);
};

export const findUserByPhoneNumber = async (phoneNumber, dbClient = null) => {
	const executor = getExecutor(dbClient);
	const result = await executor.query(
		"SELECT * FROM users WHERE phone_number = $1 LIMIT 1",
		[phoneNumber],
	);

	return normalizeUser(result.rows[0]);
};

export const createOtpCode = async (
	{ userId = null, phoneNumber, purpose, otpCode, expiresAt },
	dbClient = null,
) => {
	const executor = getExecutor(dbClient);
	const query = `
		INSERT INTO otp_codes (user_id, phone_number, purpose, otp_code, expires_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *
	`;

	const values = [userId, phoneNumber, purpose, otpCode, expiresAt];
	const result = await executor.query(query, values);
	return result.rows[0];
};

export const getValidOtpCode = async ({ phoneNumber, purpose, otpCode }, dbClient = null) => {
	const executor = getExecutor(dbClient);
	const query = `
		SELECT *
		FROM otp_codes
		WHERE phone_number = $1
			AND purpose = $2
			AND otp_code = $3
			AND consumed_at IS NULL
			AND expires_at > NOW()
		ORDER BY created_at DESC
		LIMIT 1
	`;

	const values = [phoneNumber, purpose, otpCode];
	const result = await executor.query(query, values);
	return result.rows[0] || null;
};

export const consumeOtpCode = async (otpId, dbClient = null) => {
	const executor = getExecutor(dbClient);
	await executor.query(
		"UPDATE otp_codes SET consumed_at = NOW() WHERE id = $1",
		[otpId],
	);
};

export const markPhoneAsVerified = async (userId, dbClient = null) => {
	const executor = getExecutor(dbClient);
	const result = await executor.query(
		`
			UPDATE users
			SET is_phone_verified = TRUE,
					updated_at = NOW()
			WHERE id = $1
			RETURNING *
		`,
		[userId],
	);

	return normalizeUser(result.rows[0]);
};

export const ensureWallet = async (userId, initialBalance, dbClient = null) => {
	const executor = getExecutor(dbClient);
	const result = await executor.query(
		`
			INSERT INTO wallets (user_id, balance)
			VALUES ($1, $2)
			ON CONFLICT (user_id)
			DO NOTHING
			RETURNING *
		`,
		[userId, initialBalance],
	);

	return result.rows[0] || null;
};

export const updateUserPassword = async (userId, passwordHash, dbClient = null) => {
	const executor = getExecutor(dbClient);
	await executor.query(
		`
			UPDATE users
			SET password_hash = $2,
					updated_at = NOW()
			WHERE id = $1
		`,
		[userId, passwordHash],
	);
};
