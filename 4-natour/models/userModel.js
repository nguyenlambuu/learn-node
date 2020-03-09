const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: { type: String, required: [true, 'Please tell us your name'] },
	email: {
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	photo: { type: String, default: 'default.jpg' },
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			// This only works on CREATE and SAVE!!!!
			validator: function(el) {
				return el === this.password; // abc === abc
			},
			message: 'Password are not the same!'
		},
		select: false
	},
	passwordChangedAt: { type: Date, select: false },
	passwordResetToken: { type: String, select: false },
	passwordResetExpires: { type: Date, select: false },
	active: {
		type: Boolean,
		default: true,
		select: false // Don't show
	}
});

// Encrypt new password when inserted into database.
userSchema.pre('save', async function(next) {
	// Only run this function if password was actual modified.
	if (!this.isModified('password')) return next();

	// Hash the password with cost of 12.
	this.password = await bcrypt.hash(this.password, 12);

	// Delete passwordConfirm field.
	this.passwordConfirm = undefined;
	next();
});

// Find all user who is contains active not equal false (not deleted).
userSchema.pre(/^find/, function(next) {
	// 'this' points to the current query
	this.find({ active: { $ne: false } });
	next();
});

// Compare password which user input with encrypted password.
userSchema.methods.correctPassword = async function(
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

// Change password
userSchema.pre('save', function(next) {
	if (!this.isModified('password') || this.isNew) return next();

	// Saving to database maybe a little bit slower than issuing the JWT
	// Because changed password after timestamp
	this.passwordChangedAt = Date.now() - 1000; // Trick -> make sure JWT token alway created after the password has been changed
	next();
});

// Check password was changed after timestamp
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);
		return JWTTimestamp < changedTimestamp; // 100 < 200
	}

	// False means NOT changed
	return false;
};

userSchema.methods.createPasswordResetToken = function() {
	// Generate a random text
	const resetToken = crypto.randomBytes(32).toString('hex');

	// Encrypted the random text and save it in database
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
