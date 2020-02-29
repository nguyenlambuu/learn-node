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

const sendErrorDev = (err, req, res) => {
	// A) For API
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			error: err,
			stack: err.stack
		});
	}

	// B) For RENDERED WEBSITE
	console.error('ERRRROOORRRR 💥 💀', err);
	res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: err.message
	});
};

const sendErrorProd = (err, req, res) => {
	// A) For API
	if (req.originalUrl.startsWith('/api')) {
		// Operation, trusted error => send to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message
			});
		}
		// Unknown error => Don't need to leak error details
		// 1. Log the error
		console.error('ERRRROOORRRR 💥 💀', err);
		// 2. Send generic error
		return res.status(500).json({
			status: 'error',
			message: 'Something went wrong!'
		});
	}

	// B) For RENDERED WEBSITE
	if (err.isOperational) {
		// Operation, trusted error => send to client
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong!',
			msg: err.message
		});
	}
	// Unknown error => Don't need to leak error details
	// 1. Log the error
	console.error('ERRRROOORRRR 💥 💀', err);
	// 2. Send generic error
	res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: 'Please try again later.'
	});
};

const handleJsonWebTokenError = () =>
	new AppError('Invalid token. Please log in again', 401);

const handleTokenExpiredError = () =>
	new AppError('Your token has expired. Please log in again.', 401);

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.message = err.message;

		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateErrorDB(error);
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
		if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
		sendErrorProd(error, req, res);
	}
};
