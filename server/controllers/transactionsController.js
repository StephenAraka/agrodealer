import pool from "../config/db.js";
import AppError from "../utils/appError.js";

const rollbackQuietly = async (client) => {
	try {
		await client.query("ROLLBACK");
	} catch (_error) {
		// Ignore rollback errors to preserve the root cause.
	}
};

export const getWalletBalance = async (req, res, next) => {
	try {
		const result = await pool.query(
			"SELECT id, user_id, balance FROM wallets WHERE user_id = $1 LIMIT 1",
			[req.user.id],
		);

		if (result.rows.length === 0) {
			throw new AppError("Wallet not found", 404);
		}

		return res.status(200).json({
			success: true,
			data: {
				wallet: result.rows[0],
			},
		});
	} catch (error) {
		return next(error);
	}
};

export const topupWallet = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const amount = Number(req.body.amount);
		const walletResult = await client.query(
			"SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE",
			[req.user.id],
		);

		if (walletResult.rows.length === 0) {
			throw new AppError("Wallet not found", 404);
		}

		const balanceBefore = Number(walletResult.rows[0].balance);
		const balanceAfter = balanceBefore + amount;

		await client.query(
			"UPDATE wallets SET balance = $2, updated_at = NOW() WHERE user_id = $1",
			[req.user.id, balanceAfter],
		);

		const transactionResult = await client.query(
			`
				INSERT INTO transactions (
					user_id,
					transaction_type,
					status,
					amount,
					balance_before,
					balance_after,
					description
				)
				VALUES ($1, 'topup', 'success', $2, $3, $4, $5)
				RETURNING id, transaction_type, status, amount, balance_before, balance_after, created_at
			`,
			[req.user.id, amount, balanceBefore, balanceAfter, "Wallet top-up"],
		);

		await client.query("COMMIT");

		return res.status(201).json({
			success: true,
			message: "Wallet topped up successfully",
			data: {
				balance: balanceAfter,
				transaction: transactionResult.rows[0],
			},
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};

export const purchaseProduct = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const productId = Number(req.body.product_id);
		const quantity = Number(req.body.quantity);

		const productResult = await client.query(
			"SELECT id, name, price FROM products WHERE id = $1 LIMIT 1",
			[productId],
		);

		if (productResult.rows.length === 0) {
			throw new AppError("Product not found", 404);
		}

		const product = productResult.rows[0];
		const unitPrice = Number(product.price);
		const totalAmount = unitPrice * quantity;

		const walletResult = await client.query(
			"SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE",
			[req.user.id],
		);

		if (walletResult.rows.length === 0) {
			throw new AppError("Wallet not found", 404);
		}

		const balanceBefore = Number(walletResult.rows[0].balance);
		if (balanceBefore < totalAmount) {
			throw new AppError("Insufficient wallet balance", 400);
		}

		const balanceAfter = balanceBefore - totalAmount;

		await client.query(
			"UPDATE wallets SET balance = $2, updated_at = NOW() WHERE user_id = $1",
			[req.user.id, balanceAfter],
		);

		const transactionResult = await client.query(
			`
				INSERT INTO transactions (
					user_id,
					transaction_type,
					status,
					amount,
					balance_before,
					balance_after,
					description
				)
				VALUES ($1, 'purchase', 'success', $2, $3, $4, $5)
				RETURNING id, transaction_type, status, amount, balance_before, balance_after, created_at
			`,
			[req.user.id, totalAmount, balanceBefore, balanceAfter, `Purchase of ${product.name}`],
		);

		await client.query(
			`
				INSERT INTO transaction_items (
					transaction_id,
					product_id,
					product_name,
					unit_price,
					quantity,
					line_total
				)
				VALUES ($1, $2, $3, $4, $5, $6)
			`,
			[
				transactionResult.rows[0].id,
				product.id,
				product.name,
				unitPrice,
				quantity,
				totalAmount,
			],
		);

		await client.query("COMMIT");

		return res.status(201).json({
			success: true,
			message: "Purchase completed successfully",
			data: {
				transaction: transactionResult.rows[0],
				item: {
					product_id: product.id,
					product_name: product.name,
					unit_price: unitPrice,
					quantity,
					line_total: totalAmount,
				},
				balance: balanceAfter,
			},
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};

export const listMyTransactions = async (req, res, next) => {
	try {
		const limit = Number(req.query.limit) || 20;
		const result = await pool.query(
			`
				SELECT
					id,
					transaction_type,
					status,
					amount,
					balance_before,
					balance_after,
					description,
					created_at
				FROM transactions
				WHERE user_id = $1
				ORDER BY created_at DESC
				LIMIT $2
			`,
			[req.user.id, limit],
		);

		return res.status(200).json({
			success: true,
			data: {
				transactions: result.rows,
			},
		});
	} catch (error) {
		return next(error);
	}
};

export const getMyTransactionDetail = async (req, res, next) => {
	try {
		const transactionId = Number(req.params.id);
		if (!Number.isInteger(transactionId) || transactionId <= 0) {
			throw new AppError("Invalid transaction id", 400);
		}

		const transactionResult = await pool.query(
			`
				SELECT
					id,
					user_id,
					transaction_type,
					status,
					amount,
					balance_before,
					balance_after,
					description,
					created_at
				FROM transactions
				WHERE id = $1 AND user_id = $2
				LIMIT 1
			`,
			[transactionId, req.user.id],
		);

		if (transactionResult.rows.length === 0) {
			throw new AppError("Transaction not found", 404);
		}

		const itemsResult = await pool.query(
			`
				SELECT product_id, product_name, unit_price, quantity, line_total
				FROM transaction_items
				WHERE transaction_id = $1
				ORDER BY id ASC
			`,
			[transactionId],
		);

		return res.status(200).json({
			success: true,
			data: {
				transaction: transactionResult.rows[0],
				items: itemsResult.rows,
			},
		});
	} catch (error) {
		return next(error);
	}
};

export const getMyTransactionReceiptHtml = async (req, res, next) => {
	try {
		const transactionId = Number(req.params.id);
		if (!Number.isInteger(transactionId) || transactionId <= 0) {
			throw new AppError("Invalid transaction id", 400);
		}

		const userResult = await pool.query(
			"SELECT name, username, phone_number FROM users WHERE id = $1 LIMIT 1",
			[req.user.id],
		);

		if (userResult.rows.length === 0) {
			throw new AppError("User not found", 404);
		}

		const transactionResult = await pool.query(
			`
				SELECT
					id,
					user_id,
					transaction_type,
					status,
					amount,
					balance_before,
					balance_after,
					description,
					created_at
				FROM transactions
				WHERE id = $1 AND user_id = $2
				LIMIT 1
			`,
			[transactionId, req.user.id],
		);

		if (transactionResult.rows.length === 0) {
			throw new AppError("Transaction not found", 404);
		}

		const itemsResult = await pool.query(
			`
				SELECT product_name, unit_price, quantity, line_total
				FROM transaction_items
				WHERE transaction_id = $1
				ORDER BY id ASC
			`,
			[transactionId],
		);

		const user = userResult.rows[0];
		const transaction = transactionResult.rows[0];
		const items = itemsResult.rows;

		const itemsRowsHtml = items.length
			? items
					.map(
						(item) => `
						<tr>
							<td>${item.product_name}</td>
							<td>${item.quantity}</td>
							<td>${Number(item.unit_price).toFixed(2)}</td>
							<td>${Number(item.line_total).toFixed(2)}</td>
						</tr>
					`,
					)
					.join("")
			: `
				<tr>
					<td colspan="4">No line items</td>
				</tr>
			`;

		const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Receipt #${transaction.id}</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 24px; color: #222; }
		h1, h2 { margin: 0 0 8px; }
		.section { margin-bottom: 18px; }
		table { width: 100%; border-collapse: collapse; margin-top: 8px; }
		th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
		th { background: #f2f2f2; }
		.summary { margin-top: 16px; }
		.summary p { margin: 4px 0; }
		@media print {
			.no-print { display: none; }
			body { margin: 0; }
		}
	</style>
</head>
<body>
	<div class="section">
		<h1>Agrodealer Receipt</h1>
		<p>Transaction ID: ${transaction.id}</p>
		<p>Date: ${new Date(transaction.created_at).toLocaleString()}</p>
	</div>

	<div class="section">
		<h2>Customer</h2>
		<p>Name: ${user.name}</p>
		<p>Username: ${user.username}</p>
		<p>Phone: ${user.phone_number}</p>
	</div>

	<div class="section">
		<h2>Items</h2>
		<table>
			<thead>
				<tr>
					<th>Product</th>
					<th>Qty</th>
					<th>Unit Price</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>${itemsRowsHtml}</tbody>
		</table>
	</div>

	<div class="summary">
		<p>Type: ${transaction.transaction_type}</p>
		<p>Status: ${transaction.status}</p>
		<p>Amount: ${Number(transaction.amount).toFixed(2)}</p>
		<p>Balance Before: ${Number(transaction.balance_before).toFixed(2)}</p>
		<p>Balance After: ${Number(transaction.balance_after).toFixed(2)}</p>
		<p>Description: ${transaction.description || "-"}</p>
	</div>

	<button class="no-print" onclick="window.print()">Print Receipt</button>
</body>
</html>`;

		res.setHeader("Content-Type", "text/html; charset=utf-8");
		return res.status(200).send(html);
	} catch (error) {
		return next(error);
	}
};
