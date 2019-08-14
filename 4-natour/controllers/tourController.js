const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getTopFiveCheap = async (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getAllTours = async (req, res) => {
	try {
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
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};

exports.getTour = async (req, res) => {
	try {
		// Tour.findOn({ _id: req.params.id });
		const tour = await Tour.findById(req.params.id);

		res.status(200).json({
			status: 'success',
			data: { tour }
		});
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};

exports.createTour = async (req, res) => {
	try {
		const newTour = await Tour.create(req.body);
		res.status(201).json({
			status: 'success',
			data: { tour: newTour }
		});
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};

exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});

		res.status(200).json({
			status: 'success',
			data: { tour: tour }
		});
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};

exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);
		res.status(204).json({ status: 'success', data: null });
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};

/**
 * @description Find tours which have ratingsAverage greater than equal 4.5
 * Group by difficulty,
 * Sort by * minPrice desc,
 * Excludes difficulty is EASY
 * @param req
 * @param res
 * @returns JSON
 */
exports.getTourStats = async (req, res) => {
	try {
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
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};

exports.getMonthyPlan = async (req, res) => {
	try {
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
	} catch (error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};
