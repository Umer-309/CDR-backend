const CallRecord = require('../models/CallRecord');

async function listCalls(req, res, next) {
	try {
		const {
			number,
			aNumber,
			bNumber,
			from,
			to,
			cellId,
			site,
			callType,
			batchId,
			limit = 100,
			skip = 0,
		} = req.query;

		const query = {};
		if (number) query.$or = [{ aNumber: number }, { bNumber: number }];
		if (aNumber) query.aNumber = aNumber;
		if (bNumber) query.bNumber = bNumber;
		if (cellId) query.cellId = cellId;
		if (site) query.site = site;
		if (callType) query.callType = callType;
		if (batchId) query.batchId = batchId;
		if (from || to) {
			query.startTime = {};
			if (from) query.startTime.$gte = new Date(from);
			if (to) query.startTime.$lte = new Date(to);
		}

		const docs = await CallRecord.find(query)
			.sort({ startTime: -1 })
			.skip(parseInt(skip))
			.limit(parseInt(limit));
		const count = await CallRecord.countDocuments(query);
		return res.json({ success: true, count, data: docs });
	} catch (err) {
		return next(err);
	}
}

async function getCall(req, res, next) {
	try {
		const doc = await CallRecord.findById(req.params.id);
		if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
		return res.json({ success: true, data: doc });
	} catch (err) {
		return next(err);
	}
}

async function createCall(req, res, next) {
	try {
		const doc = await CallRecord.create({ ...req.body, rawData: req.body.rawData || req.body });
		return res.status(201).json({ success: true, data: doc });
	} catch (err) {
		return next(err);
	}
}

async function updateCall(req, res, next) {
	try {
		const doc = await CallRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
		return res.json({ success: true, data: doc });
	} catch (err) {
		return next(err);
	}
}

async function deleteCall(req, res, next) {
	try {
		const doc = await CallRecord.findByIdAndDelete(req.params.id);
		if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
		return res.json({ success: true });
	} catch (err) {
		return next(err);
	}
}

async function mapPoints(req, res, next) {
	try {
		const { batchId } = req.query;
		const query = {};
		if (batchId) query.batchId = batchId;
		// Only records with valid coordinates
		query.latitude = { $ne: null };
		query.longitude = { $ne: null };

		const docs = await CallRecord.find(query, {
			latitude: 1,
			longitude: 1,
			site: 1,
			aNumber: 1,
			bNumber: 1,
			callType: 1,
		})
			.limit(10000);

		return res.json({ success: true, data: docs });
	} catch (err) {
		return next(err);
	}
}

module.exports = { listCalls, getCall, createCall, updateCall, deleteCall, mapPoints };


