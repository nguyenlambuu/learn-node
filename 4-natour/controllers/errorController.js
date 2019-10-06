const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const handleDuplicateErrorDB = err => {
	const duplicateValue = err.errmsg.match(/"(.*?)"/)[1];
	const message = `Duplicate field value: ${duplicateValue}. Please use a different value!`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);
	const message = `Invalid input data: ${errors.join('. ')}`;
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
		if (error.code === 11000) error = handleDuplicateErrorDB(error);
		if (error.name === 'ValidationError') {
			error = handleValidationErrorDB(error);
		}

		sendErrorProd(error, res);
	}
};
