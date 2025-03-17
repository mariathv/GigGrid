class APIFeatures {
    constructor(query , queryString) {
        this.query = query;
        this.queryString = queryString
    }

    filter() {
        const queryObj = {...this.queryString};
        const excludedFields = ["sort"]

        if (queryObj.price) {
            const [minPrice, maxPrice] = queryObj.price.split("-");
            queryObj.$or = [
                { "basic.price": { gte: minPrice, lte: maxPrice } },
                { "standard.price": { gte: minPrice, lte: maxPrice } },
                { "premium.price": { gte: minPrice, lte: maxPrice } }
            ];
            delete queryObj.price; // Remove the original price field to avoid conflicts
        }

        if (queryObj.category) {
            const categories = queryObj.category.split(","); // Split the categories by comma
            queryObj.category = { $in: categories }; // Use MongoDB's $in operator
        }

        if (queryObj.s) {
            const searchKeyword = queryObj.s;
            queryObj.$or = [
                { title: { $regex: searchKeyword, $options: "i" } }, // Search in title (case-insensitive)
                { tags: { $regex: searchKeyword, $options: "i" } }, // Search in tags array
                { "basic.featuresIncluded": { $regex: searchKeyword, $options: "i" } }, // Search in basic package features
                { "standard.featuresIncluded": { $regex: searchKeyword, $options: "i" } }, // Search in standard package features
                { "premium.featuresIncluded": { $regex: searchKeyword, $options: "i" } } // Search in premium package features
            ];
            delete queryObj.s; // Remove the original `s` field to avoid conflicts
        }

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr))

        return this
    }

    sort() {   //not working need to see later
        if (this.queryString.sort) {
            console.log("Sort Query:", this.queryString.sort); 
            const sortBy = this.queryString.sort.replace("price", "minPrice");
            console.log("Sort By:", sortBy); 
            this.query = this.query.sort(sortBy);
            console.log(this.query)
        } 
        return this;
    }
}

module.exports = APIFeatures