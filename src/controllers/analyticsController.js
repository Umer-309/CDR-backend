const CallRecord = require('../models/CallRecord');

async function frequency(req, res, next) {
	try {
		const { number, from, to, bucket = 'day', batchId } = req.query;
		const match = {};
		if (number) match.$or = [{ aNumber: number }, { bNumber: number }];
		if (batchId) match.batchId = batchId;
		if (from || to) {
			match.startTime = {};
			if (from) match.startTime.$gte = new Date(from);
			if (to) match.startTime.$lte = new Date(to);
		}
		console.log(match);
		const dateFormat = bucket === 'hour' ? '%Y-%m-%d %H:00' : bucket === 'month' ? '%Y-%m' : '%Y-%m-%d';
		const agg = await CallRecord.aggregate([
			{ $match: match },
			{
				$group: {
					_id: { $dateToString: { format: dateFormat, date: "$startTime" } },
					calls: {
						$sum: {
							$cond: [
								{ $in: ["$callType", ["Incoming", "Outgoing"]] },
								1,
								0
							]
						}
					},
					sms: {
						$sum: {
							$cond: [{ $eq: ["$callType", "SMS"] }, 1, 0]
						}
					}
				}
			},
			{ $sort: { _id: 1 } },
		]);
		return res.json({ success: true, data: agg });
	} catch (err) {
		return next(err);
	}
}

async function timeline(req, res, next) {
	try {
		const { from, to, bucket = 'day', batchId } = req.query;
		const match = {};
		if (batchId) match.batchId = batchId;
		if (from || to) {
			match.startTime = {};
			if (from) match.startTime.$gte = new Date(from);
			if (to) match.startTime.$lte = new Date(to);
		}
		const dateFormat = bucket === 'hour' ? '%Y-%m-%d %H:00' : bucket === 'month' ? '%Y-%m' : '%Y-%m-%d';
		const agg = await CallRecord.aggregate([
			{ $match: match },
			{ $group: { _id: { $dateToString: { format: dateFormat, date: '$startTime' } }, calls: { $sum: { $cond: [{ $eq: ['$callType', 'SMS'] }, 0, 1] } }, sms: { $sum: { $cond: [{ $eq: ['$callType', 'SMS'] }, 1, 0] } } } },
			{ $project: { date: '$_id', calls: 1, sms: 1, total: { $add: ['$calls', '$sms'] }, _id: 0 } },
			{ $sort: { date: 1 } },
		]);
		return res.json({ success: true, data: agg });
	} catch (err) {
		return next(err);
	}
}

async function topNumbers(req, res, next) {
	try {
		const { limit = 10, batchId } = req.query;
		const match = {};
		if (batchId) match.batchId = batchId;

		const agg = await CallRecord.aggregate([
			{ $match: match },

			// Keep both participants & callType
			{
				$project: {
					participants: ['$aNumber', '$bNumber'],
					callType: 1,
				},
			},

			// Explode participants array
			{ $unwind: '$participants' },

			// Group by number + callType
			{
				$group: {
					_id: { number: '$participants', callType: '$callType' },
					count: { $sum: 1 },
					uniquePartners: { $addToSet: '$participants' }, // temp
				},
			},

			// Flatten structure → number-based with call/sms split
			{
				$group: {
					_id: '$_id.number',
					counts: {
						$push: {
							callType: '$_id.callType',
							count: '$count',
						},
					},
					total: { $sum: '$count' },
					uniquePartners: { $first: '$uniquePartners' }, // dedupe later
				},
			},

			// Sort by total activity
			{ $sort: { total: -1 } },

			// Apply limit
			{ $limit: parseInt(limit) },
		]);

		// Reshape counts → { calls, sms }
		const result = agg.map((entry) => {
			let calls = 0;
			let sms = 0;

			entry.counts.forEach((c) => {
				if (c.callType === 'Incoming' || c.callType === 'Outgoing') {
					calls += c.count;
				} else if (c.callType === 'SMS') {
					sms += c.count;
				}
			});

			return {
				number: entry._id,
				calls,
				sms,
				total: entry.total,
				uniqueContacts: [...new Set(entry.uniquePartners)].length, // count distinct partners
			};
		});

		return res.json({ success: true, data: result });
	} catch (err) {
		return next(err);
	}
}

module.exports = { frequency, timeline, topNumbers };


