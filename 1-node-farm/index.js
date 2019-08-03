const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

/**
 * File
 */

// *** Blocking - Synchronous
// const textIn = fs.readFileSync("./txt/input.txt", { encoding: 'utf-8' });
// console.log('Reading file...');
// console.log(textIn);
// const textOut = `This is what we know about the avocado: ${textIn}.\n Created on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt',textOut);
// console.log(`File written`);

// *** Non-blocking => Asynchronous
// fs.readFile("./txt/start.txt", "utf-8", (err, resStart) => {
//   if(err) return console.log('ERRRROOORRRR 💥');
// 	fs.readFile(`./txt/${resStart}.txt`, "utf-8", (err, resInput) => {
// 		console.log(resInput);
// 		fs.readFile(`./txt/append.txt`, "utf-8", (err, apd) => {
// 			console.log(apd);
// 			fs.writeFile("./txt/final.txt", `${resInput}\n${apd}`, 'utf-8', (err, res) => {
// 				console.log(`File written 😘`);
// 			});
// 		});
// 	});
// });
// console.log("Reading file...");

/**
 * SERVER
 */

// READ FILE
const responseData = fs.readFileSync(`${__dirname}/data.json`, 'utf-8');
const products = JSON.parse(responseData);

const slugs = products.map(product =>
	slugify(product.productName, { lower: true })
);

const tempOverview = fs.readFileSync(
	`${__dirname}/templates/overview.html`,
	'utf-8'
);
const tempProduct = fs.readFileSync(
	`${__dirname}/templates/product.html`,
	'utf-8'
);
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8');

// CREATE SERVER
const server = http.createServer((req, res) => {
	// query: { id: '0' }
	// pathname: '/products'
	const { query, pathname } = url.parse(req.url, true);
	console.log({ query, pathname });

	// OVERVIEW PATH
	if (pathname === '/' || pathname === '/overview') {
		res.writeHead(200, { 'Content-type': 'text/html' });

		const cardsHtml = products
			.map(card => replaceTemplate(tempCard, card))
			.join(' ');
		const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

		res.end(output);

		// PRODUCTS PATH
	} else if (pathname === '/products') {
		res.writeHead(200, { 'Content-type': 'text/html' });

		const productHtml = replaceTemplate(tempProduct, products[query.id]);
		res.end(productHtml);

		// API PATH
	} else if (pathname === '/api/v4') {
		res.end(responseData);

		// NOT FOUND PATH
	} else {
		res.writeHead(404, {
			'Content-type': 'text/html',
			'Custom-header': 'Hello ERRRROOORRRR'
		});
		res.end('<h1>Page not found</h1>');
	}
});

// RUN SERVER
server.listen(8000, '127.0.0.1', () => {
	console.log('Listening to requests on port 8000');
});
