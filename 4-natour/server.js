const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
	console.log(err.name, err.message);
	console.log('UNCAUGHT EXCEPTION, SHUTTING DOWN 😢');
	process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app.js');

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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`🏁 🏁 🏁 Application running on port ${port}...`);
});

process.on('unhandledRejection', err => {
	console.log(err.name, err.message);
	console.log('UNHANDLED REJECTION, SHUTTING DOWN 😢');
	server.close(() => {
		process.exit(1);
	});
});
