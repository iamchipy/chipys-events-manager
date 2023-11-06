// invalid route (something not in our controllwer)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
}

// known errors and responses
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode
    let message = err.message

    // If you look for an Object by ID that doesn't exist
    if (err.name === "CastError" && err.kind === 'ObjectId') {
        statusCode = 404
        message = 'Resource not found (src:Middleware)'
    }

    // IF ? Then : Else
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

export {notFound, errorHandler}