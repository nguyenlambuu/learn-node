const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
	const userData = { ...req.body };
	const newUser = await User.create({
		name: userData.name,
		email: userData.email,
		password: userData.password,
		passwordConfirm: userData.passwordConfirm
	});

	res.status(201).json({
		status: 'success',
		data: { user: newUser }
	});
});
