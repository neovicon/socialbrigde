// Global async error handler — catches errors thrown from controllers
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

    console.error(`[Error] ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// Wrap async route handlers to avoid try/catch boilerplate
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
