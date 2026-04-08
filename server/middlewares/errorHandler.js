const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;

	if (process.env.NODE_ENV !== "test") {
		console.error(err);
	}

	res.status(statusCode).json({
		success: false,
		message: err.message || "Internal server error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

export default errorHandler;
