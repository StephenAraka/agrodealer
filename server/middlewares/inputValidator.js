const inputValidator = (schema, source = "body") => {
	return (req, res, next) => {
		const data = req[source];
		const { error, value } = schema.validate(data, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: error.details.map((detail) => detail.message),
			});
		}

		req[source] = value;
		return next();
	};
};

export default inputValidator;
