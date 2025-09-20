const mongoose = require('mongoose');

const CallRecordSchema = new mongoose.Schema(
	{
		batchId: { type: String, index: true },
		aNumber: { type: String, index: true },
		bNumber: { type: String, index: true },
		callType: { type: String, enum: ['Incoming', 'Outgoing', 'SMS'], index: true },
		imei: String,
		imsi: String,
		duration: Number,
		site: String,
		latitude: Number,
		longitude: Number,
		cellId: { type: String, index: true },
		nodeId: String,
		ip: String,
		port: String,
		startTime: { type: Date, index: true },
		endTime: Date,
		rawData: { type: Object },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('CallRecord', CallRecordSchema);


