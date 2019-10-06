const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		error: err,
		stack: err.stack
	});
};

const sendErrorProd = (err, res) => {
	// Operation, trusted error => send to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});
	} else {
		// Unknown error => Don't need to leak error details
		// 1. Log the error
		console.error('ERRRROOORRRR 💥 💀', err);
		// 2. Send generic error
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong!'
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };

		if (error.name === 'CastError') error = handleCastErrorDB(error);

		sendErrorProd(error, res);
	}
};
