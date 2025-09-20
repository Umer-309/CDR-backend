function coerceDate(value) {
	if (!value) return null;
	const d = new Date(value);
	return isNaN(d.getTime()) ? null : d;
}

function excelSerialToDate(serial) {
	// Excel epoch starts at Jan 1, 1900
	const utc_days = Math.floor(serial - 25569);
	const utc_value = utc_days * 86400; // seconds
	const fractional_day = serial - Math.floor(serial);
	let totalSeconds = Math.floor(86400 * fractional_day);

	const date = new Date((utc_value + totalSeconds) * 1000);
	return date;
}

function extractLatLngFromSite(site) {
	if (!site || typeof site !== 'string') return { latitude: null, longitude: null };
	const pipeParts = site.split("|");
	if (pipeParts.length >= 3) {
		const lat = parseFloat(pipeParts[pipeParts.length - 3]);
		const lng = parseFloat(pipeParts[pipeParts.length - 2]);
		if (!isNaN(lat) && !isNaN(lng)) {
			return { latitude: lat, longitude: lng };
		}
	}
	const match = site.match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
	if (match) {
		const lat = parseFloat(match[1]);
		const lng = parseFloat(match[2]);
		if (!isNaN(lat) && !isNaN(lng)) {
			return { latitude: lat, longitude: lng };
		}
	}
	return { latitude: null, longitude: null };
}

function normalizeRow(raw) {
	console.log(raw, 'raw')
	const aNumber = raw.aNumber || raw.A_Number || raw.caller || raw.msisdn || raw.A || raw.from || raw['A-Party'] || raw['A Number'];
	const bNumber = raw.bNumber || raw.B_Number || raw.callee || raw.to || raw.B || raw.Dialed || raw.DialedNumber || raw['B-Party'] || raw['B Number'];
	const callType = raw.callType || raw.CallType || raw.type || raw.event || raw.Direction || raw.direction || raw['Call Type'];
	const imei = raw.imei || raw.IMEI || raw.deviceImei;
	const imsi = raw.imsi || raw.IMSI || raw.subscriberImsi;
	const duration = Number(raw.duration || raw.Duration || raw.callDuration || raw.Seconds || 0) || 0;
	const site = raw.site || raw.Site || raw.Cell || raw.CellSite || raw.Location || raw.BTS || raw.SiteName || raw.Cell_Name;
	const latitude = Number(raw.latitude || raw.Latitude || raw.lat) || null;
	const longitude = Number(raw.longitude || raw.Longitude || raw.lng || raw.lon) || null;
	const cellId = (raw.cellId || raw.CellID || raw.CellId || raw.CGI || raw.CI || raw.ECGI || raw.EUtranCell || raw.Cell || raw['Cell Id'] || raw['Cell ID']) || null;
	const nodeId = raw.nodeId || raw.Node || raw.NodeB || raw.BSC || raw.RNC || null;
	const ip = raw.ip || raw.IP || raw.IPAddress || null;
	const port = (raw.port || raw.Port) ? String(raw.port || raw.Port) : null;
	const startTimeRaw = raw.startTime || raw.StartTime || raw.start || raw.Timestamp || raw.TimeStart || raw.CallStart || raw.DateTime || raw.Date || raw.Time || raw.Start || raw['Start Time'];
	const endTimeRaw = raw.endTime || raw.EndTime || raw.end || raw.TimeEnd || raw.CallEnd || raw.End || raw['End Time'];

	let startTime = coerceDate(startTimeRaw);
	let endTime = coerceDate(endTimeRaw);

	if (!startTime && raw.startEpoch) startTime = new Date(Number(raw.startEpoch) * 1000);
	if (!endTime && raw.endEpoch) endTime = new Date(Number(raw.endEpoch) * 1000);

	if (!startTime && raw['Date & Time']) {
		startTime = excelSerialToDate(raw['Date & Time']);
	}
	if (!endTime && startTime && duration) {
		endTime = new Date(startTime.getTime() + duration * 1000);
	}

	let coords = { latitude, longitude };
	if (!coords.latitude || !coords.longitude) {
		coords = extractLatLngFromSite(site);
	}

	let normalizedCallType = callType;
	if (typeof normalizedCallType === 'string') {
		const lc = normalizedCallType.toLowerCase();
		if (lc.includes('sms') || lc.includes('text')) normalizedCallType = 'SMS';
		else if (lc.includes('in')) normalizedCallType = 'Incoming';
		else if (lc.includes('out')) normalizedCallType = 'Outgoing';
	}

	return {
		aNumber: aNumber ? String(aNumber) : null,
		bNumber: bNumber ? String(bNumber) : null,
		callType: normalizedCallType || null,
		imei: imei ? String(imei) : null,
		imsi: imsi ? String(imsi) : null,
		duration: Number.isFinite(duration) ? duration : 0,
		site: site || null,
		latitude: coords.latitude,
		longitude: coords.longitude,
		cellId: cellId ? String(cellId) : null,
		nodeId: nodeId ? String(nodeId) : null,
		ip: ip || null,
		port: port || null,
		startTime: startTime || null,
		endTime: endTime || null,
		rawData: raw,
	};
}

function normalizeMany(rows) {
	return rows.map(normalizeRow);
}

module.exports = { normalizeRow, normalizeMany };


