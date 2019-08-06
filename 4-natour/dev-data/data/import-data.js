const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const tours = JSON.parse(
	fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(() => console.log('DB connection succesful! 🤝'));

const importData = async () => {
	try {
		await Tour.create(tours);
		console.log('Data imported');
	} catch (error) {
		console.log(error);
	}
	process.exit();
};

const deleteData = async () => {
	try {
		await Tour.deleteMany({});
		console.log('Data deleted');
	} catch (error) {
		console.log(error);
	}
	process.exit();
};

if (process.argv[2] === '--import') {
	importData();
} else if (process.argv[2] === '--delete') {
	deleteData();
}
