const express = require('express');
const userController = require('./../controllers/userController.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Authentication first
router.use(authController.protect); // protect all routes after this middleware -> trick 😙

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Only allowed admin to perform actions after this middleware.
router.use(authController.restrictTo('admin'));

router
	.route('/')
	.get(userController.getAllUsers)
	.post(userController.createUser);
router
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;
