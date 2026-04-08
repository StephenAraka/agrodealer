# agrodealer

Simple fullstack agro dealer app. Backend is built with Express + PostgreSQL + Joi.

## Backend Quick Start

1. Go to server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment in `server/.env`:
```env
PORT=5001
DB_USER="postgres"
DB_HOST="localhost"
DB_NAME="agrodealer"
DB_PORT=5432
DB_PASSWORD=pasword123

JWT_SECRET="dev-only-super-secret-change-me"
OTP_TTL_MINUTES=10
DEFAULT_WALLET_BALANCE=500
NODE_ENV="development"
```

4. Start server:
```bash
npm run start
```

Base URL:
```txt
http://localhost:5001/api
```

## Notes

- Dummy OTP is returned in API responses for assignment/demo only.
- Protected endpoints require `Authorization: Bearer <token>`.
- All POST write operations use DB transactions where relevant.

## API Docs

### 1. Health

#### GET `/health`
Check server and database connection.

Response:
```json
{
	"success": true,
	"message": "Server and database are healthy",
	"data": {
		"current_time": "2026-04-08T13:14:20.601Z",
		"db_name": "agrodealer"
	}
}
```

### 2. Auth and Recovery

#### POST `/auth/register`
Create a new unverified user and generate OTP.

Body:
```json
{
	"name": "Stephen Doe",
	"username": "stephen",
	"password": "secret123",
	"phone_number": "+254700111222"
}
```

Response (trimmed):
```json
{
	"success": true,
	"message": "User created. Verify phone number with OTP to activate account",
	"data": {
		"user": {
			"id": 1,
			"name": "Stephen Doe",
			"username": "stephen",
			"phone_number": "+254700111222",
			"is_phone_verified": false
		},
		"otp_code": "123456"
	}
}
```

#### POST `/auth/verify-phone`
Verify phone using OTP and create wallet with default balance.

Body:
```json
{
	"phone_number": "+254700111222",
	"otp_code": "123456"
}
```

#### POST `/auth/login`
Login with username and password (only verified users).

Body:
```json
{
	"username": "stephen",
	"password": "secret123"
}
```

Response includes access token:
```json
{
	"success": true,
	"data": {
		"token": "<jwt_token>",
		"user": {
			"id": 1,
			"name": "Stephen Doe",
			"username": "stephen",
			"phone_number": "+254700111222"
		}
	}
}
```

#### POST `/auth/forgot-username/request-otp`
Generate OTP to recover username.

Body:
```json
{
	"phone_number": "+254700111222"
}
```

#### POST `/auth/forgot-username/verify-otp`
Verify OTP and return username.

Body:
```json
{
	"phone_number": "+254700111222",
	"otp_code": "123456"
}
```

#### POST `/auth/forgot-password/request-otp`
Generate OTP for password reset.

Body:
```json
{
	"username": "stephen",
	"phone_number": "+254700111222"
}
```

#### POST `/auth/forgot-password/reset`
Reset password after OTP verification.

Body:
```json
{
	"username": "stephen",
	"phone_number": "+254700111222",
	"otp_code": "123456",
	"new_password": "newSecret123"
}
```

### 3. Products

#### GET `/products`
List all products for client shop view.

Response:
```json
{
	"success": true,
	"data": {
		"products": [
			{
				"id": 1,
				"name": "Wheat floor 2kg",
				"price": "186.00"
			}
		]
	}
}
```

#### GET `/products/:id`
Get one product by id.

### 4. Wallet

#### GET `/wallet` (Protected)
Get current user wallet balance.

Headers:
```txt
Authorization: Bearer <token>
```

#### POST `/wallet/topup` (Protected)
Top up wallet manually.

Body:
```json
{
	"amount": 500
}
```

### 5. Transactions

#### POST `/transactions/purchase` (Protected)
Buy a product with wallet money.

Body:
```json
{
	"product_id": 1,
	"quantity": 2
}
```

#### GET `/transactions` (Protected)
List current user transaction history.

Optional query:
```txt
?limit=20
```

#### GET `/transactions/:id` (Protected)
Get single transaction with line items.

### 6. Receipt

#### GET `/transactions/:id/receipt-html` (Protected)
Returns printable HTML receipt for that transaction.

Open in browser and print.

## Suggested Frontend Flow

1. Register user
2. Verify phone OTP
3. Login and save token
4. Load product list
5. Show wallet balance
6. Top up wallet (optional)
7. Purchase product
8. Show transaction list
9. Open receipt HTML and print
