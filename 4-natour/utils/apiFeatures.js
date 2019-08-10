class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		// BUILD A QUERY
		// Filtering
		const queryObject = { ...this.queryString };
		const excludedFields = ['page', 'sort', 'limit', 'fields'];
		excludedFields.forEach(element => delete queryObject[element]);

		// Advanced Filtering
		let queryString = JSON.stringify(queryObject);
		queryString = queryString.replace(
			/\b(gt|gte|lt|lte)\b/g,
			match => `$${match}`
		);

		// let query = Tour.find(JSON.parse(queryString));
		this.query.find(JSON.parse(queryString));
		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		}
		return this;
	}

	limitFields() {
		// // Field limit => Bandwidth
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v'); // Minus means exclude the __v field
		}
		return this;
	}

	paginate() {
		// Pagination
		// // { page: '2', limit: '10' } => 1-10 belongs to page 1, 11-20 belongs to page 2
		const page = this.queryString.page * 1 || 1; // Default is 1
		const limit = this.queryString.limit * 1 || 50; // Default are 50
		const skip = (page - 1) * limit; // Page 1 have 50 tours => Page 3 means skip 100 tours, and start at tour 101
		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}
module.exports = APIFeatures;
