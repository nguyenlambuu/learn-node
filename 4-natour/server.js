const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app.js');

dotenv.config({ path: './config.env' });

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
app.listen(port, () => {
	console.log(`🏁 🏁 🏁 Application running on port ${port}...`);
});
