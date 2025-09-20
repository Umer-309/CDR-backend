const express = require('express');
const { listCalls, getCall, createCall, updateCall, deleteCall, mapPoints } = require('../controllers/callController');

const router = express.Router();

router.get('/', listCalls);
router.get('/map', mapPoints);
router.get('/:id', getCall);
router.post('/', createCall);
router.put('/:id', updateCall);
router.delete('/:id', deleteCall);

module.exports = router;


