const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
	try {
		// BUILD A QUERY
		// Filtering
		const queryObject = { ...req.query };
		const excludedFields = ['page', 'sort', 'limit', 'fields'];
		excludedFields.forEach(element => delete queryObject[element]);

		// Advanced Filtering
		let queryString = JSON.stringify(queryObject);
		queryString = queryString.replace(
			/\b(gt|gte|lt|lte)\b/g,
			match => `$${match}`
		);

		let query = Tour.find(JSON.parse(queryString));

		// Sorting
		if (req.query.sort) {
			const sortBy = req.query.sort.split(',').join(' ');
			query = query.sort(sortBy);
		}

		// Field limit => Bandwidth
		if (req.query.fields) {
			const fields = req.query.fields.split(',').join(' ');
			query = query.select(fields);
		} else {
			query = query.select('-__v'); // Minus means exclude the __v field
		}

		// EXECUTE QUERY
		const tours = await query;

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
