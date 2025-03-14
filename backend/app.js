const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const globalErrorController = require("./controllers/errorController");

const userRouter = require("./routes/userRoutes");
const gigRouter = require("./routes/gigRoutes");

const app = express();

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use(express.json())

app.use((req , res , next) => {
    console.log("App Running in -->" , process.env.NODE_ENV)
    console.log(req.headers)
    req.requestTime = new Date().toISOString();
    next()
})

//Routes
app.use("/api", userRouter);
app.use("/api/gigs", gigRouter);

app.all("*" , (req , res , next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server` , 404));
})

app.use(globalErrorController)


module.exports = app;