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
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProductById, listProducts } from "../controllers/productsController.js";
import {
	getMyTransactionDetail,
	getWalletBalance,
	listMyTransactions,
	purchaseProduct,
	topupWallet,
} from "../controllers/transactionsController.js";
import {
	purchaseSchema,
	topupSchema,
	transactionListQuerySchema,
} from "../validators/operationValidator.js";

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

router.get("/products", listProducts);
router.get("/products/:id", getProductById);

router.get("/wallet", authMiddleware, getWalletBalance);
router.post("/wallet/topup", authMiddleware, inputValidator(topupSchema), topupWallet);

router.post(
	"/transactions/purchase",
	authMiddleware,
	inputValidator(purchaseSchema),
	purchaseProduct,
);

router.get(
	"/transactions",
	authMiddleware,
	inputValidator(transactionListQuerySchema, "query"),
	listMyTransactions,
);

router.get("/transactions/:id", authMiddleware, getMyTransactionDetail);

export default router;
