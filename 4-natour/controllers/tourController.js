const fs = require('fs');

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
	const id = req.params.id * 1; // Multiple 1 to convert string to a number

	if (id > tours.length || id < 0) {
		return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
	}
	next();
};

exports.checkBody = (req, res, next) => {
	if (!req.body.name || !req.body.price) {
		return res
			.status(400)
			.json({ status: 'fail', message: 'Missing name or price' });
	}
	next();
};

exports.getAllTours = (req, res) => {
	res
		.status(200)
		.json({ status: 'success', results: tours.length, data: { tours } });
};

exports.getTour = (req, res) => {
	const id = req.params.id * 1; // Multiple 1 to convert string to a number
	const tour = tours.find(t => t.id === id);

	res.status(200).json({ status: 'success', data: { tour } });
};

exports.createTour = (req, res) => {
	const newId = tours[tours.length - 1].id + 1; // newId = latest id + 1
	const newTour = Object.assign({ id: newId }, req.body);

	tours.push(newTour);
	fs.writeFile(
		`${__dirname}/./../dev-data/data/tours-simple.json`,
		JSON.stringify(tours),
		err => {
			if (err) {
				return console.log('ERRRROOORRRR 🤬');
			}
			res.status(201).json({ status: 'success', data: { tour: newTour } });
		}
	);
};

exports.updateTour = (req, res) => {
	res
		.status(200)
		.json({ status: 'success', data: { tour: 'Updated tour will be there' } });
};

exports.deleteTour = (req, res) => {
	res.status(204).json({ status: 'success', data: null });
};
