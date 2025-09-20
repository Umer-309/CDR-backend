const express = require('express');
const { listTowers } = require('../controllers/towerController');

const router = express.Router();

router.get('/', listTowers);

module.exports = router;


