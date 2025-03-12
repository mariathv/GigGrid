const express = require("express");
const morgan = require("morgan")


const userRouter = require("./routes/userRoutes")

const app = express();

if (process.env.NODE_ENV="development") {
    app.use(morgan("dev"));
}

app.use(express.json())

app.use((req , res , next) => {
    req.requestTime = new Date().toISOString();
    next()
})

//Routes
app.use("/api", userRouter);


app.all("*" , (req , res , next) => {
    next()
})


module.exports = app;