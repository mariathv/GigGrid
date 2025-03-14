const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;

mongoose.connection.once("open", () => {
    bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "newBucket"
    });
    console.log("GridFS Bucket initialized");
});

const getBucket = () => {
    if (!bucket) throw new Error("GridFSBucket not initialized yet");
    return bucket;
};

module.exports = { getBucket };
