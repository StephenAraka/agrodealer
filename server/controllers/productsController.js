import pool from "../config/db.js";
import AppError from "../utils/appError.js";

export const listProducts = async (req, res, next) => {
	try {
		const result = await pool.query(
			"SELECT id, name, price, created_at FROM products ORDER BY id ASC",
		);

		return res.status(200).json({
			success: true,
			data: {
				products: result.rows,
			},
		});
	} catch (error) {
		return next(error);
	}
};

export const getProductById = async (req, res, next) => {
	try {
		const productId = Number(req.params.id);
		if (!Number.isInteger(productId) || productId <= 0) {
			throw new AppError("Invalid product id", 400);
		}

		const result = await pool.query(
			"SELECT id, name, price, created_at FROM products WHERE id = $1 LIMIT 1",
			[productId],
		);

		if (result.rows.length === 0) {
			throw new AppError("Product not found", 404);
		}

		return res.status(200).json({
			success: true,
			data: {
				product: result.rows[0],
			},
		});
	} catch (error) {
		return next(error);
	}
};
