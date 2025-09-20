const express = require('express');
const { frequency, timeline, topNumbers } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/frequency', frequency);
router.get('/timeline', timeline);
router.get('/top-numbers', topNumbers);

module.exports = router;


