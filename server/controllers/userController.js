import bcrypt from "bcrypt";
import pool from "../config/db.js";
import AppError from "../utils/appError.js";
import {
	consumeOtpCode,
	createOtpCode,
	createUser,
	ensureWallet,
	findUserByPhoneNumber,
	findUserByUsername,
	getValidOtpCode,
	markPhoneAsVerified,
	updateUserPassword,
} from "../models/userModel.js";
import { generateOtp, getOtpExpiryDate, signAccessToken } from "../services/authService.js";

const DEFAULT_WALLET_BALANCE = Number(process.env.DEFAULT_WALLET_BALANCE) || 500;

const rollbackQuietly = async (client) => {
	try {
		await client.query("ROLLBACK");
	} catch (_error) {
		// Ignore rollback errors to avoid masking the original failure.
	}
};

export const registerUser = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		const { name, username, password, phone_number: phoneNumber } = req.body;

		const existingByUsername = await findUserByUsername(username, client);
		if (existingByUsername) {
			throw new AppError("Username is already in use", 409);
		}

		const existingByPhone = await findUserByPhoneNumber(phoneNumber, client);
		if (existingByPhone) {
			throw new AppError("Phone number is already in use", 409);
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const user = await createUser(
			{
			name,
			username,
			passwordHash,
			phoneNumber,
			},
			client,
		);

		const otpCode = generateOtp();
		await createOtpCode(
			{
				userId: user.id,
				phoneNumber,
				purpose: "register_verify",
				otpCode,
				expiresAt: getOtpExpiryDate(),
			},
			client,
		);

		await client.query("COMMIT");

		return res.status(201).json({
			success: true,
			message: "User created. Verify phone number with OTP to activate account",
			data: {
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					phone_number: user.phone_number,
					is_phone_verified: user.is_phone_verified,
				},
				otp_code: otpCode,
			},
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};

export const verifyPhoneOtp = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		const { phone_number: phoneNumber, otp_code: otpCode } = req.body;
		const user = await findUserByPhoneNumber(phoneNumber, client);

		if (!user) {
			throw new AppError("No account found for this phone number", 404);
		}

		const otpRecord = await getValidOtpCode(
			{
				phoneNumber,
				purpose: "register_verify",
				otpCode,
			},
			client,
		);

		if (!otpRecord) {
			throw new AppError("Invalid or expired OTP", 400);
		}

		await consumeOtpCode(otpRecord.id, client);

		const verifiedUser = user.is_phone_verified
			? user
			: await markPhoneAsVerified(user.id, client);
		await ensureWallet(verifiedUser.id, DEFAULT_WALLET_BALANCE, client);

		await client.query("COMMIT");

		return res.status(200).json({
			success: true,
			message: "Phone number verified successfully",
			data: {
				user: {
					id: verifiedUser.id,
					name: verifiedUser.name,
					username: verifiedUser.username,
					phone_number: verifiedUser.phone_number,
					is_phone_verified: true,
				},
			},
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};

export const loginUser = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await findUserByUsername(username);

		if (!user) {
			throw new AppError("Invalid username or password", 401);
		}

		const passwordMatches = await bcrypt.compare(password, user.password_hash);
		if (!passwordMatches) {
			throw new AppError("Invalid username or password", 401);
		}

		if (!user.is_phone_verified) {
			throw new AppError("Phone number is not verified", 403);
		}

		const token = signAccessToken({
			userId: user.id,
			username: user.username,
		});

		return res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				token,
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					phone_number: user.phone_number,
				},
			},
		});
	} catch (error) {
		return next(error);
	}
};

export const requestForgotUsernameOtp = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		const { phone_number: phoneNumber } = req.body;
		const user = await findUserByPhoneNumber(phoneNumber, client);

		if (!user || !user.is_phone_verified) {
			throw new AppError("Verified account not found for this phone number", 404);
		}

		const otpCode = generateOtp();
		await createOtpCode(
			{
				userId: user.id,
				phoneNumber,
				purpose: "forgot_username",
				otpCode,
				expiresAt: getOtpExpiryDate(),
			},
			client,
		);

		await client.query("COMMIT");

		return res.status(200).json({
			success: true,
			message: "OTP generated for username recovery",
			data: {
				otp_code: otpCode,
			},
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};

export const verifyForgotUsernameOtp = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		const { phone_number: phoneNumber, otp_code: otpCode } = req.body;
		const user = await findUserByPhoneNumber(phoneNumber, client);

		if (!user || !user.is_phone_verified) {
			throw new AppError("Verified account not found for this phone number", 404);
		}

		const otpRecord = await getValidOtpCode(
			{
				phoneNumber,
				purpose: "forgot_username",
				otpCode,
			},
			client,
		);

		if (!otpRecord) {
			throw new AppError("Invalid or expired OTP", 400);
		}

		await consumeOtpCode(otpRecord.id, client);

		await client.query("COMMIT");

		return res.status(200).json({
			success: true,
			message: "Username recovered successfully",
			data: {
				username: user.username,
			},
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};

export const requestForgotPasswordOtp = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		const { username, phone_number: phoneNumber } = req.body;
		const user = await findUserByUsername(username, client);

		if (!user || user.phone_number !== phoneNumber || !user.is_phone_verified) {
			throw new AppError("Username and phone number do not match a verified account", 404);
		}

		const otpCode = generateOtp();
		await createOtpCode(
			{
				userId: user.id,
				phoneNumber,
				purpose: "forgot_password",
				otpCode,
				expiresAt: getOtpExpiryDate(),
			},
			client,
		);

		await client.query("COMMIT");

		return res.status(200).json({
			success: true,
			message: "OTP generated for password reset",
			data: {
				otp_code: otpCode,
			},
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};

export const resetForgotPassword = async (req, res, next) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		const {
			username,
			phone_number: phoneNumber,
			otp_code: otpCode,
			new_password: newPassword,
		} = req.body;

		const user = await findUserByUsername(username, client);
		if (!user || user.phone_number !== phoneNumber || !user.is_phone_verified) {
			throw new AppError("Username and phone number do not match a verified account", 404);
		}

		const otpRecord = await getValidOtpCode(
			{
				phoneNumber,
				purpose: "forgot_password",
				otpCode,
			},
			client,
		);

		if (!otpRecord) {
			throw new AppError("Invalid or expired OTP", 400);
		}

		const newPasswordHash = await bcrypt.hash(newPassword, 10);
		await updateUserPassword(user.id, newPasswordHash, client);
		await consumeOtpCode(otpRecord.id, client);

		await client.query("COMMIT");

		return res.status(200).json({
			success: true,
			message: "Password reset successful",
		});
	} catch (error) {
		await rollbackQuietly(client);
		return next(error);
	} finally {
		client.release();
	}
};
