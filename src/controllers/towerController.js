const CallRecord = require('../models/CallRecord');
const Tower = require('../models/Tower');

async function listTowers(req, res, next) {
	try {
		// Prefer Tower collection, fallback to distinct from CallRecord
		const towers = await Tower.find({}).limit(1000);
		if (towers.length) return res.json({ success: true, data: towers });
		const sites = await CallRecord.aggregate([
			{ $match: { site: { $ne: null } } },
			{ $group: { _id: '$site', latitude: { $first: '$latitude' }, longitude: { $first: '$longitude' }, cellId: { $first: '$cellId' } } },
			{ $project: { _id: 0, siteName: '$_id', latitude: 1, longitude: 1, cellId: 1 } },
		]);
		return res.json({ success: true, data: sites });
	} catch (err) {
		return next(err);
	}
}

module.exports = { listTowers };


