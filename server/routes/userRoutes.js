import { Router } from "express";
import {
	loginUser,
	registerUser,
	requestForgotPasswordOtp,
	requestForgotUsernameOtp,
	resetForgotPassword,
	verifyForgotUsernameOtp,
	verifyPhoneOtp,
} from "../controllers/userController.js";
import inputValidator from "../middlewares/inputValidator.js";
import {
	forgotPasswordRequestSchema,
	forgotPasswordResetSchema,
	forgotUsernameRequestSchema,
	forgotUsernameVerifySchema,
	loginSchema,
	registerSchema,
	verifyPhoneSchema,
} from "../validators/authValidator.js";

const router = Router();

router.get("/users/health", (req, res) => {
	res.json({
		success: true,
		message: "User routes are up",
	});
});

router.post("/auth/register", inputValidator(registerSchema), registerUser);
router.post("/auth/verify-phone", inputValidator(verifyPhoneSchema), verifyPhoneOtp);
router.post("/auth/login", inputValidator(loginSchema), loginUser);

router.post(
	"/auth/forgot-username/request-otp",
	inputValidator(forgotUsernameRequestSchema),
	requestForgotUsernameOtp,
);

router.post(
	"/auth/forgot-username/verify-otp",
	inputValidator(forgotUsernameVerifySchema),
	verifyForgotUsernameOtp,
);

router.post(
	"/auth/forgot-password/request-otp",
	inputValidator(forgotPasswordRequestSchema),
	requestForgotPasswordOtp,
);

router.post(
	"/auth/forgot-password/reset",
	inputValidator(forgotPasswordResetSchema),
	resetForgotPassword,
);

export default router;
