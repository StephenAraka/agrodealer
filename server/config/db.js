import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const useConnectionString = Boolean(process.env.DATABASE_URL);

const shouldUseSsl = () => {
	if (process.env.DB_SSL === "true") return true;
	if (process.env.DB_SSL === "false") return false;
	if (!process.env.DATABASE_URL) return false;
	return process.env.DATABASE_URL.includes("neon.tech");
};

const sslConfig = shouldUseSsl() ? { rejectUnauthorized: false } : undefined;

const pool = new Pool(
	useConnectionString
		? {
				connectionString: process.env.DATABASE_URL,
				ssl: sslConfig,
			}
		: {
				user: process.env.DB_USER,
				host: process.env.DB_HOST,
				database: process.env.DB_NAME,
				password: process.env.DB_PASSWORD,
				port: Number(process.env.DB_PORT) || 5432,
				ssl: sslConfig,
			},
);

export const testDatabaseConnection = async () => {
	const client = await pool.connect();

	try {
		const result = await client.query("SELECT NOW() AS current_time, current_database() AS db_name");
		return result.rows[0];
	} finally {
		client.release();
	}
};

export default pool;
