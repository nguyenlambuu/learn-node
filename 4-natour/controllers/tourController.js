const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError.js');
const catchAsync = require('./../utils/catchAsync');

exports.getTopFiveCheap = catchAsync(async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
});

exports.getAllTours = catchAsync(async (req, res, next) => {
	// EXECUTE QUERY
	const features = new APIFeatures(Tour.find(), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();
	const tours = await features.query;

	// SEND DATA
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: { tours }
	});
});

exports.getTour = catchAsync(async (req, res, next) => {
	// Tour.findOne({ _id: req.params.id });
	const tour = await Tour.findById(req.params.id).populate('reviews');

	if (!tour) {
		return next(new AppError('No tour found with that ID', 404));
	}

	res.status(200).json({
		status: 'success',
		data: { tour }
	});
});

exports.createTour = catchAsync(async (req, res, next) => {
	const newTour = await Tour.create(req.body);
	res.status(201).json({
		status: 'success',
		data: { tour: newTour }
	});
});

exports.updateTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	if (!tour) {
		return next(new AppError(`Cannot find tour with id ${req.params.id}`, 404));
	}

	res.status(200).json({
		status: 'success',
		data: { tour: tour }
	});
});

exports.deleteTour = catchAsync(async (req, res, next) => {
	const tour = await Tour.findByIdAndDelete(req.params.id);

	if (!tour) {
		return next(new AppError('No tour found with that ID', 404));
	}

	res.status(204).json({ status: 'success', data: null });
});

/**
 * @description Find tours which have ratingsAverage greater than equal 4.5
 * Group by difficulty,
 * Sort by * minPrice desc,
 * Excludes difficulty is EASY
 * @param req
 * @param res
 * @returns JSON
 */
exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{ $match: { ratingsAverage: { $gte: 4.5 } } }, // Matching
		{
			$group: {
				// _id: '$difficulty',
				_id: { $toUpper: '$difficulty' }, // Group by
				numberOfTours: { $sum: 1 },
				numOfRatings: { $sum: '$ratingsQuantity' },
				avgRating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				maxPrice: { $max: '$price' },
				minPrice: { $min: '$price' }
			}
		},
		{
			$sort: { minPrice: -1 } // Sorting 1 for ASC, -1 for DESC
		}
		// { $match: { _id: { $ne: 'EASY' } } } // Can use match multiple times
	]);
	res
		.status(200)
		.json({ status: 'success', results: stats.length, data: stats });
});

exports.getMonthyPlan = catchAsync(async (req, res, next) => {
	const year = req.params.year * 1;

	const plans = await Tour.aggregate([
		{ $unwind: '$startDates' },
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`)
				}
			}
		},
		{
			$group: {
				_id: { $month: '$startDates' },
				numOfTours: { $sum: 1 },
				tours: { $push: '$name' }
			}
		},
		{ $addFields: { month: '$_id' } },
		{ $project: { _id: 0 } },
		{ $sort: { month: -1 } },
		{ $limit: 6 }
	]);

	res
		.status(200)
		.json({ status: 'success', results: plans.length, data: plans });
});
