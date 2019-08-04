const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
	// Solution 1: Read all file, if done, send to user.
	// fs.readFile('test-file.txt', 'utf-8', (err, data) => {
	// 	if (err) return console.log(err);
	// 	res.end(data);
	// });

	// Solution 2: Streams -> read and write data from I/O devices
	// const readable = fs.createReadStream('test-file.txt');
	// readable.on('data', chunk => {
	// 	res.write(chunk);
	// });
	// readable.on('end', () => {
	// 	res.end();
	// });
	// readable.on('error', err => {
	// 	console.log(err);
	// 	res.statusCode = 500;
	// 	res.end('File not found');
	// });

	// Solution 3: Pipe -> Connect multiple streams together
	// readableSource.pipe(writeableDestination);
	const readable = fs.createReadStream('test-file.txt');
	readable.pipe(res);
});

server.listen(8000, '127.0.0.1', () => {
	console.log('Watting for request');
});
