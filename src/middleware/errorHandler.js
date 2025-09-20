function notFoundHandler(req, res, next) {
	res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
	console.error('Error:', err);
	const status = err.status || 500;
	res.status(status).json({ success: false, message: err.message || 'Server Error' });
}

module.exports = { notFoundHandler, errorHandler };


