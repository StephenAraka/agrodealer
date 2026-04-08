# Agro Dealer Portal — Server

Express 5 + PostgreSQL REST API.

## Quick start

```bash
cd server
npm install
cp .env.example .env   # then fill in values
npm run dev            # nodemon, http://localhost:5001
```

## Environment

**Option A — Local PostgreSQL**
```env
PORT=5001
DB_USER="postgres"
DB_HOST="localhost"
DB_NAME="agrodealer"
DB_PORT=5432
DB_PASSWORD="your_local_postgres_password"
DB_SSL=false

JWT_SECRET="dev-only-super-secret-change-me"
OTP_TTL_MINUTES=10
DEFAULT_WALLET_BALANCE=500
NODE_ENV="development"
```

**Option B — Neon (serverless PostgreSQL, easiest for dev)**
```env
PORT=5001
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
DB_SSL=true

JWT_SECRET="dev-only-super-secret-change-me"
OTP_TTL_MINUTES=10
DEFAULT_WALLET_BALANCE=500
NODE_ENV="development"
```

When `DATABASE_URL` is set it takes precedence over individual `DB_*` vars.

## Notes

- OTP codes are returned in API responses for demo/development only.
- Protected endpoints require `Authorization: Bearer <token>`.
- All POST write operations use DB transactions where relevant.

---

## API reference

Base URL: `http://localhost:5001/api`

### Health

**GET `/health`**

### Auth & recovery

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create unverified user, returns OTP |
| POST | `/auth/verify-phone` | Consume OTP and activate account + wallet |
| POST | `/auth/login` | Returns JWT token |
| POST | `/auth/forgot-username/request-otp` | Send OTP for username recovery |
| POST | `/auth/forgot-username/verify-otp` | Return username after OTP check |
| POST | `/auth/forgot-password/request-otp` | Send OTP for password reset |
| POST | `/auth/forgot-password/reset` | Reset password after OTP verification |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List all products |
| GET | `/products/:id` | Single product |

### Wallet (protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/wallet` | Current balance |
| POST | `/wallet/topup` | Add funds |

### Transactions (protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/transactions/purchase` | Buy a product |
| GET | `/transactions` | History (`?limit=20`) |
| GET | `/transactions/:id` | Single transaction with line items |
| GET | `/transactions/:id/receipt-html` | Printable HTML receipt |
