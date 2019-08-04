const EventEmitter = require('events');
const http = require('http');

class Sale extends EventEmitter {
	constructor() {
		super();
	}
}

// const myEmitter = new EventEmitter();
const saleEmit = new Sale();

// Observer
saleEmit.on('hotSale', () => {
	console.log('A hot sale was explore');
});

// Observer
saleEmit.on('hotSale', () => {
	console.log('Customer name: Buu Nguyen');
});

saleEmit.on('hotSale', items => {
	console.log(`There are now ${items} items left in stock.`); // 9
});

saleEmit.emit('hotSale', 9);

// ====================================== //

const server = http.createServer();

server.on('request', (req, res) => {
	console.log('Request received!');
	console.log(req.url);
	res.end('Request received!');
});

server.on('request', (req, res) => {
	console.log('Another request 🥳');
});

server.on('close', () => {
	console.log('Server closed');
});

server.listen(8000, '127.0.0.1', () => {
	console.log('Watting for request...');
});
