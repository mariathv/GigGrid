class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["sort", "page", "limit", "fields"];
        excludedFields.forEach(el => delete queryObj[el]);

        // Handle price filter
        let priceOrQuery = [];
        if (queryObj.price) {
            const [minPrice, maxPrice] = queryObj.price.split("-");
            priceOrQuery = [
                { "basic.price": { $gte: +minPrice, $lte: +maxPrice } },
                { "standard.price": { $gte: +minPrice, $lte: +maxPrice } },
                { "premium.price": { $gte: +minPrice, $lte: +maxPrice } }
            ];
            delete queryObj.price;
        }

        // Handle category filter
        if (queryObj.category) {
            const categories = queryObj.category.split(",");
            queryObj.category = { $in: categories };
        }

        // Handle search
        let searchOrQuery = [];
        if (queryObj.s) {
            const searchKeyword = queryObj.s;
            searchOrQuery = [
                { title: { $regex: searchKeyword, $options: "i" } },
                { tags: { $regex: searchKeyword, $options: "i" } },
                { "basic.featuresIncluded": { $regex: searchKeyword, $options: "i" } },
                { "standard.featuresIncluded": { $regex: searchKeyword, $options: "i" } },
                { "premium.featuresIncluded": { $regex: searchKeyword, $options: "i" } }
            ];
            delete queryObj.s;
        }

        // Combine all `$or` queries
        if (priceOrQuery.length > 0 || searchOrQuery.length > 0) {
            queryObj.$and = [];
            if (priceOrQuery.length > 0) {
                queryObj.$and.push({ $or: priceOrQuery });
            }
            if (searchOrQuery.length > 0) {
                queryObj.$and.push({ $or: searchOrQuery });
            }
        }

        this.query = this.query.find(queryObj);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort
                .split(',')
                .map(field => field === 'price' ? 'minPrice' : field)
                .join(' ');
            console.log("Final sortBy:", sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    limit() {
        if (this.queryString.limit) {
            const limit = parseInt(this.queryString.limit, 10);
            this.query = this.query.limit(limit);
        }
        return this;
    }

}


module.exports = APIFeatures