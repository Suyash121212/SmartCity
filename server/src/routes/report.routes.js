const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { downloadReport } = require('../controllers/report.controller');

const router = express.Router();

router.get('/issues/:id/report', authenticate, downloadReport);

module.exports = router;
