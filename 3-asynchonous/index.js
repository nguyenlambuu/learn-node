const fs = require('fs');
const superagent = require('superagent');

// Callback hell
// fs.readFile(`${__dirname}/dog.txt`, 'utf-8', (err, data) => {
// 	superagent.get(`https://dog.ceo/api/breed/${data}/images`).end((err, res) => {
// 		if (err) return console.error(err.message);
// 		const dataToSave = JSON.stringify(res.body.message);

// 		fs.writeFile(`${__dirname}/dog-images.txt`, dataToSave, err => {
// 			if (err) return console.error('Cannot write file 💥');
// 			console.log('File saved 🤝');
// 		});
// 	});
// });

// Promise
// fs.readFile(`${__dirname}/dog.txt`, 'utf-8', (err, data) => {
// 	superagent
// 		.get(`https://dog.ceo/api/breed/${data}/images`)
// 		.then(res => {
// 			const dataToSave = JSON.stringify(res.body.message);

// 			fs.writeFile(`${__dirname}/dog-images.txt`, dataToSave, err => {
// 				if (err) return console.error('Cannot save file 💥');
// 				console.log('File saved 🤝');
// 			});
// 		})
// 		.catch(err => {
// 			console.error(err.message);
// 		});
// });

// Promise v2
const readFilePromise = file => {
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'utf-8', (err, data) => {
			if (err) reject(`I could not find the file ${file} 💥`);
			resolve(data); // data in file (breed)
		});
	});
};

const writeFilePromise = (file, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, err => {
			if (err) reject('I could not save data in file 💥');
			resolve('File saved 🤝');
		});
	});
};

/*
readFilePromise(`${__dirname}/dog.txt`)
	.then(breed => {
		return superagent.get(`https://dog.ceo/api/breed/${breed}/images`);
	})
	.then(result => {
		const dataToSave = JSON.stringify(result.body.message);
		return writeFilePromise(`${__dirname}/dog-images.txt`, dataToSave);
	})
	.then(res => console.log(res))
	.catch(err => {
		console.error(err.message);
	});
*/

// Async await
getDogPicture = async () => {
	try {
		const breed = await readFilePromise(`${__dirname}/dog.txt`);
		console.log(breed);

		const result = await superagent.get(
			`https://dog.ceo/api/breed/${breed}/images`
		);
		console.log(result.body.message);

		const dataToSave = JSON.stringify(result.body.message);
		const success = await writeFilePromise(
			`${__dirname}/dog-images.txt`,
			dataToSave
		);
		console.log(success);
	} catch (error) {
		console.error(error);
	}
};
getDogPicture();
