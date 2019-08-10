const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
	try {
		// BUILD A QUERY
		// 1/ Filtering
		const queryObject = { ...req.query };
		const excludedFields = ['page', 'sort', 'limit', 'fields'];
		excludedFields.forEach(element => delete queryObject[element]);

		// 	2/ Advanced Filtering

		let queryString = JSON.stringify(queryObject);
		queryString = queryString.replace(
			/\b(gt|gte|lt|lte)\b/g,
			match => `$${match}`
		);
		console.log(JSON.parse(queryString));

		// { difficulty: 'easy', duration: { $gte: 4 }}
		// { difficulty: 'easy', duration: { gte: '4' }}
		// gt, gte, lt, lte

		const query = await Tour.find(JSON.parse(queryString));

		// EXECUTE QUERY
		const tours = query;
		// const query = await Tour.find()
		// 	.where('duration')
		// 	.gte(4)
		// 	.where('difficulty')
		// 	.equals('easy');

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
