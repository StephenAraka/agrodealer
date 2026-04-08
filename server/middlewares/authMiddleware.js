import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      throw new AppError("Missing access token", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError("JWT secret is not configured", 500);
    }

    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      id: payload.userId,
      username: payload.username,
    };

    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401));
    }

    return next(error);
  }
};

export default authMiddleware;
