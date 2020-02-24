const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
	{
		review: { type: String, required: [true, 'Review can not be empty'] },
		rating: { type: Number, min: 1, max: 5 },
		createdAt: { type: Date, default: Date.now() },
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Review must belong to a tour.']
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user.']
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// User cannot create multiple reviews for the same tour.
reviewSchema.indexes({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
	// this.populate({
	// 		path: 'tour',
	// 		select: 'name'
	// 	})
	// 	.populate({
	// 		path: 'user',
	// 		select: 'name photo'
	// 	});
	this.populate({
		path: 'user',
		select: 'name photo'
	});
	next();
});

reviewSchema.statics.calculateAverageRatings = async function(tourId) {
	const stats = await this.aggregate([
		{ $match: { tour: tourId } }, // Select all reviews which match with tourId
		{
			$group: {
				_id: '$tour',
				numberOfRatings: { $sum: 1 },
				averageRatings: { $avg: '$rating' }
			}
		}
	]);

	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].numberOfRatings,
			ratingsAverage: stats[0].averageRatings
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5
		});
	}
};

// Calculating ratings when user leave their review or rating
reviewSchema.post('save', function() {
	// THIS points to current review
	this.constructor.calculateAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// Calculating ratings when user update or delete their review or rating
reviewSchema.pre(/^findOneAnd/, async function(next) {
	this.r = await this.findOne();
	next();
});

reviewSchema.post(/^findOneAnd/, async function() {
	// await this.findOne(); does NOT work here, query has already executed.
	await this.r.constructor.calculateAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
