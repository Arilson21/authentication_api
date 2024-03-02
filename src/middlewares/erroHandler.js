// not found 

const notFound = (req, res, next) => {
    const error = new Error(`Not found`);
    res.status(404);
    next(error)
};

//Error Handler

const errorHandler = (err, req, res, next) => {
    console.error(err)
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err?.message,
    })
}


module.exports = { errorHandler, notFound }