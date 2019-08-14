const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true
		},
		slug: String,
		duration: {
			type: Number,
			required: [true]
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficult']
		},
		ratingsAverage: {
			type: Number,
			default: 4.5
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		priceDiscount: Number,
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
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// Virtual property is not really save into database, but user can query it
tourSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
});

// 4️⃣types middlewares in mongoDB are DOCUMENT, QUERY, AGGREGATE and MODEL

/**
 * @description DOCUMENT MIDDLEWARE: Processing a document
 * Just only run before .save() and .create()
 * @function pre() will run before an actual event.
 * @function post() will run after an actual event.
 * That event in this case is the @event save.
 * Or we can call save hook, or save middleware
 * @this document
 */
tourSchema.pre('save', function(next) {
	// console.log(this); // 'this' keyword point to document
	this.slug = slugify(this.name, { lower: true });
	next();
});

// tourSchema.pre('save', function(next) {
// 	console.log('Will save document');
// 	next();
// });

// tourSchema.post('save', function(document, next) {
// 	console.log(document);
// 	next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
