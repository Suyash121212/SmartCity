const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getAnalytics, createAuthority, getAuthorities,
  getEscalatedIssues, getSentimentTrends,
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/analytics', getAnalytics);
router.post('/authorities', createAuthority);
router.get('/authorities', getAuthorities);
router.get('/issues/escalated', getEscalatedIssues);
router.get('/sentiment', getSentimentTrends);

module.exports = router;
