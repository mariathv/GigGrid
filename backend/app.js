const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorController = require("./controllers/errorController");

const userRouter = require("./routes/userRoutes");
const gigRouter = require("./routes/gigRoutes");
const orderRouter = require("./routes/orderRoutes")
const reviewRouter = require("./routes/reviewRoutes")
const chatRouter = require("./routes/chatRoutes");

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use(express.json())

app.use((req , res , next) => {
    console.log("App Running in -->" , process.env.NODE_ENV)
    req.requestTime = new Date().toISOString();
    next()
})

//Routes
app.use("/api", userRouter);
app.use("/api/gigs", gigRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews" , reviewRouter);
app.use("/api/chats", chatRouter);

app.all("*" , (req , res , next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server` , 404));
})

app.use(globalErrorController)


module.exports = app;