const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const CallRecord = require('../models/CallRecord');
const { normalizeMany, normalizeRow } = require('../utils/normalize');

async function insertNormalized(records, meta) {
	if (!records.length) return { insertedCount: 0 };
	const docs = records.map((r) => ({ ...r, batchId: meta?.batchId }));
	const result = await CallRecord.insertMany(docs, { ordered: false });
	return { insertedCount: result.length };
}

async function uploadCsv(req, res, next) {
	try {
		if (!req.file) throw new Error('CSV file is required under field name "file"');
		const buffer = req.file.buffer; 
		const rows = [];
		await new Promise((resolve, reject) => {
            csv()
                .fromString(buffer.toString())
                .on('data', (data) => rows.push(data))
                .on('end', resolve)
                .on('error', reject);
        });
		const normalized = normalizeMany(rows);
		const batchId = `${Date.now()}-${req.file.originalname}`;
		const result = await insertNormalized(normalized, { batchId });
		return res.json({ success: true, batchId, fileName: req.file.originalname, ...result });
	} catch (err) {
		return next(err);
	}
}

async function uploadXlsx(req, res, next) {
	try {
		if (!req.file) throw new Error('XLSX file is required under field name "file"');
		const workbook = xlsx.read(req.file.buffer);
		const sheetName = workbook.SheetNames[0];
		const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
		const normalized = normalizeMany(data);
		const batchId = `${Date.now()}-${req.file.originalname}`;
		const result = await insertNormalized(normalized, { batchId });
		return res.json({ success: true, batchId, fileName: req.file.originalname, ...result });
	} catch (err) {
		return next(err);
	}
}

async function uploadJson(req, res, next) {
	try {
		const body = Array.isArray(req.body) ? req.body : [req.body];
		const normalized = normalizeMany(body);
		const batchId = `${Date.now()}-api`;
		const result = await insertNormalized(normalized, { batchId });
		return res.json({ success: true, batchId, fileName: 'api', ...result });
	} catch (err) {
		return next(err);
	}
}

module.exports = { uploadCsv, uploadXlsx, uploadJson };


