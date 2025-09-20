const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
const { requestLogger } = require('./src/middleware/logger');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Static file serving removed - using memory storage for uploads

// DB connect
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cdr-analytics';
mongoose
	.connect(mongoUri)
	.then(() => {
		console.log('Connected to MongoDB');
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	});

// Routes
const uploadRoutes = require('./src/routes/uploadRoutes');
const callRoutes = require('./src/routes/callRoutes');
const towerRoutes = require('./src/routes/towerRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

app.use('/api/upload', uploadRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/towers', towerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


