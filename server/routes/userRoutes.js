import { Router } from "express";

const router = Router();

router.get("/users/health", (req, res) => {
	res.json({
		success: true,
		message: "User routes are up",
	});
});

export default router;
