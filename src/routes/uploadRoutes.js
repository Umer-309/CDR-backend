const path = require('path');
const express = require('express');
const multer = require('multer');
const { uploadCsv, uploadXlsx, uploadJson } = require('../controllers/uploadController');

const router = express.Router();

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
// 	filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post('/csv', upload.single('file'), uploadCsv);
router.post('/xlsx', upload.single('file'), uploadXlsx);
router.post('/json', uploadJson);

// Upload history via aggregation on saved batches
const CallRecord = require('../models/CallRecord');
router.get('/history', async (req, res, next) => {
	try {
		const agg = await CallRecord.aggregate([
			{ $match: { batchId: { $ne: null } } },
			{ $group: { _id: '$batchId', fileName: { $first: { $ifNull: ['$rawData.__fileName', '$batchId'] } }, firstAt: { $min: '$createdAt' }, lastAt: { $max: '$createdAt' }, count: { $sum: 1 } } },
			{ $project: { _id: 0, batchId: '$_id', fileName: 1, importedAt: '$firstAt', count: 1 } },
			{ $sort: { importedAt: -1 } },
		]);
		return res.json({ success: true, data: agg });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;


