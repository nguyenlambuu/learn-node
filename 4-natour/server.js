const dotenv = require('dotenv');
const app = require('./app.js');

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Application running on port ${port}...`);
});
