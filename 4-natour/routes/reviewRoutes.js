const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// POST /tours/48264fkgsdgfhgsd/reviews -> redirect to this route 😎
router
	.route('/')
	.get(authController.protect, reviewController.getAllReviews)
	.post(
		authController.protect,
		authController.restrictTo('user'),
		reviewController.createReview
	);

router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;
