const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.getTopFiveCheap = catchAsync(async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
});

exports.getTourStats = catchAsync(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{ $match: { ratingsAverage: { $gte: 4.5 } } }, // Matching
		{
			$group: {
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

// '/tours-within/:distance/center/:latlng/unit/:unit'
// /tours-within/200/center/-45,36/unit/mi
exports.getTourWithin = catchAsync(async (req, res, next) => {
	const { distance, latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',');

	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if (!lat || !lng) {
		return next(new AppError('Error', 400));
	}

	const tours = await Tour.find({
		startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
	});

	res
		.status(200)
		.json({ status: 'success', results: tours.length, data: { data: tours } });
});

// /distances/:latlng/unit/:unit
// /distances/34.006377,-118.333515/unit/mi
exports.getDistance = catchAsync(async (req, res, next) => {
	const { latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',');

	const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

	if (!lat || !lng) {
		return next(new AppError('Error', 400));
	}

	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1, lat * 1]
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		},
		{
			$project: { distance: 1, name: 1 }
		}
	]);

	res.status(200).json({
		status: 'success',
		data: { data: distances }
	});
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews', select: '-__v' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
