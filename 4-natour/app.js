const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. GLOBAL MIDDLEWARES

// Set security HTTP headers.
app.use(helmet());

// Development logging.
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit requests from same API.
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many request from an IP. Please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware here.
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// 3. ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorController);
module.exports = app;
