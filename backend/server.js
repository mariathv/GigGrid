const { default: mongoose } = require("mongoose")
const app = require("./app.js")
const dotenv = require("dotenv")

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


const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});