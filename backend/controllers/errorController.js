const AppError = require('./../utils/appError')


const sendErrorDev = (err ,res ) => {
    res.status(err.statusCode).json({
        status : err.status,
        error : err,
        message : err.message,
        stack : err.stack
    })
}

const sendErrorProd = (err , res) => {
    if(err.isOpertional) {
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message
        })
    } else {
        res.status(500).json({
            status : 'error',
            message : 'Something went wrong on the server'
        })
    }
}


module.exports = (err , req , res , next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";


    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err , res);
    } else if (process.env.NODE_ENV === 'production ') {
        let error = Object.assign({} , err);
        error.message = err.message;
        error.name = err.name;

        sendErrorProd(error , res)
    }
}