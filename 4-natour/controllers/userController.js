const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (requestBody, ...allowedFields) => {
	const newObjFiltered = {};
	Object.keys(requestBody).forEach(el => {
		if (allowedFields.includes(el)) newObjFiltered[el] = requestBody[el];
	});
	return newObjFiltered;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();

	res.status(200).json({
		status: 'success',
		results: users.length,
		data: { users }
	});
});

exports.updateMe = catchAsync(async (req, res, next) => {
	// 1. Create error if user POSTs password data.
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword',
				400
			)
		);
	}

	// 2. Fillterd out unwanted fields names that are not allowed to be updated.
	// We want to allow user to update there email, name, avatar...
	const filteredBody = filterObj(req.body, 'name', 'email');

	// 3.Update user document.
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});

	res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });
	res.status(204).json({ status: 'success' });
});

exports.getUser = (req, res) => {
	res
		.status(500)
		.json({ status: 'err', message: 'This route is not yet defined!' });
};

exports.createUser = (req, res) => {
	res
		.status(500)
		.json({ status: 'err', message: 'This route is not yet defined!' });
};

exports.updateUser = (req, res) => {
	res
		.status(500)
		.json({ status: 'err', message: 'This route is not yet defined!' });
};

exports.deleteUser = (req, res) => {
	res
		.status(500)
		.json({ status: 'err', message: 'This route is not yet defined!' });
};
