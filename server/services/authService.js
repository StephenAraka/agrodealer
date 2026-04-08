import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

const OTP_LENGTH = 6;

export const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(Math.random() * (max - min + 1) + min));
};

export const getOtpExpiryDate = () => {
  const otpTtlMinutes = Number(process.env.OTP_TTL_MINUTES) || 10;
  return new Date(Date.now() + otpTtlMinutes * 60 * 1000);
};

export const signAccessToken = (payload) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new AppError("JWT_SECRET is missing in environment variables", 500);
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: "1d",
  });
};
