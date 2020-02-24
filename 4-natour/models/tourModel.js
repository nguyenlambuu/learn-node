const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./../models/userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour name must have less or equal than 40 characters'],
			minlength: [10, 'A tour name must have more or equal than 10 characters']
			// Custom validate with validator.js
			// validate: [validator.isAlpha, 'Tour name must only contains characters']
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficult'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either: easy, medium or difficult'
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0']
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function(val) {
					// 'this' only point to current document on NEW document creation
					return this.price >= val; // 200 > 100: true, 100 > 200: false;
				},
				message: `Discount price ({VALUE}) should be below regular price`
			}
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a description']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image']
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now()
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number], // [Longtitude, Latitude]
			address: String,
			description: String
		},
		locations: [
			// Array of locations
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: String,
				description: String
			}
		],
		// guides: Array // -> Embeded guides in tour
		guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

tourSchema.indexes({ price: 1, ratingsAverage: -1 });
tourSchema.indexes({ slug: 1 });

// Virtual property is not really save into database, but user can query it
tourSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
});

// Virtual populate reviews
tourSchema.virtual('reviews', {
	ref: 'Review', // The Model this points to
	foreignField: 'tour', // The field within that model
	localField: '_id' // The corresponding field within the parent model (the tour's ID in this case)
});

// 4️⃣types middlewares in mongoDB are DOCUMENT, QUERY, AGGREGATE and MODEL

/**
 * @description DOCUMENT MIDDLEWARE: Processing a document
 * Just only run before .save() and .create()
 * @function pre() will run before an actual event.
 * @function post() will run after document executed.
 * That event in this case is the @event save.
 * Or we can call save hook, or save middleware
 * @this document
 */
tourSchema.pre('save', function(next) {
	// console.log(this); // 'this' keyword point to document
	this.slug = slugify(this.name, { lower: true });
	next();
});

// How could I embeded guides in tour.
// tourSchema.pre('save', async function(next) {
// 	const guidesPromises = this.guides.map(async id => await User.findById(id));
// 	// Result of async id => await User.findById(id) is a promise.

// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// });

// tourSchema.pre('save', function(next) {
// 	console.log('Will save document');
// 	next();
// });

// tourSchema.post('save', function(document, next) {
// 	console.log(document);
// 	next();
// });

/**
 * @description QUERY MIDDLEWARE: Processing a query
 * @function pre() will run before an actual event.
 *  * @function post() will run after document executed.
 * That event in this case is the @event find.
 * We have a "secret tour", and it only show with VIP member
 * It means find all tour which secretTour not secret
 * @this query
 */
// It works only find,
// but not work for findOne, findOneAndDelete, findOneAndUpdate...
// tourSchema.pre('find', function(next) {
// Match any event start with 'find...'
tourSchema.pre(/^find/, function(next) {
	// console.log(this); // 'this' keyword point to query
	this.find({ secretTour: { $ne: true } });

	this.start = Date.now();
	next();
});

// Populate fields when find
tourSchema.pre(/^find/, function(next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt'
	});
	next();
});

tourSchema.post(/^find/, function(document, next) {
	console.log(`Query took ${Date.now() - this.start} miliseconds!`);
	// console.log(document);
	next();
});

/**
 * @description AGGREGATION MIDDLEWARE: Processing a aggregate
 * @function pre() will run before an actual event.
 *  * @function post() will run after document executed.
 * That event in this case is the @event aggregate.
 * We have a "secret tour", and it only show with VIP member
 * It means find all tour which secretTour not secret
 * @this aggregate
 */
tourSchema.pre('aggregate', function(next) {
	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
	// console.log(this);
	next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
