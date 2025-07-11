const { default: mongoose } = require("mongoose")
const app = require("./app.js")
const dotenv = require("dotenv")
const http = require('http')
const setupSocketIO = require('./socket')

dotenv.config({
  path: "./config.env"
})


process.on('unhandledRejection', err => {
  console.log("UNCAUGHT REJECTION ....... ");
  console.error(err.name, err.message);
})


const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
)


mongoose.connect(DB, {
}).then(() => {
  console.log("DB connection successful !")
})

let bucket;
mongoose.connection.on("connected", () => {
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "newBucket"
  });
});



app.get('/', (req, res) => {
  res.send('GG - Server Running')
})


const port = 3000 || process.env.PORT;
const server = http.createServer(app);

// Initialize Socket.IO
const io = setupSocketIO(server);

// Make io accessible throughout the app
app.set('socketio', io);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});