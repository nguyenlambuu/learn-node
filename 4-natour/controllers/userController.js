const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (requestBody, ...allowedFields) => {
	const newObjFiltered = {};
	Object.keys(requestBody).forEach(el => {
		if (allowedFields.includes(el)) newObjFiltered[el] = requestBody[el];
	});
	return newObjFiltered;
};

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

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'err',
		message: 'This route is not yet defined! Please use /signup instead'
	});
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// DO NOT update user password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
