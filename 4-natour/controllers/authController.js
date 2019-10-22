const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const { name, email, password, passwordConfirm } = req.body;
	const user = await User.create({
		name,
		email,
		password,
		passwordConfirm
	});

	const token = signToken(user._id);

	res.status(201).json({
		status: 'success',
		token,
		data: { user }
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1. Check email and password are exist
	if (!email || !password) {
		return next(new AppError('Please provide email and password!', 400));
	}
	// 2. Check user exists and password is correct
	const user = await User.findOne({ email }).select('+password');

	// If user is not exists, not run check password method.
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password!', 401));
	}

	// 3. Send token to client
	const token = signToken(user._id);
	res.status(200).json({ status: 'success', token });
});
