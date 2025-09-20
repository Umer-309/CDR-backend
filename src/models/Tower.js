const mongoose = require('mongoose');

const TowerSchema = new mongoose.Schema(
	{
		siteName: { type: String, index: true },
		latitude: Number,
		longitude: Number,
		cellId: { type: String, index: true },
		metadata: { type: Object },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Tower', TowerSchema);


