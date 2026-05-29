const express = require('express');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createIssue, getIssues, getIssueById,
  updateIssueStatus, upvoteIssue, getHeatmap, getMyIssues,
} = require('../controllers/issue.controller');

const router = express.Router();

router.get('/heatmap', getHeatmap);
router.get('/my', authenticate, getMyIssues);
router.get('/', optionalAuth, getIssues);
router.get('/:id', optionalAuth, getIssueById);

router.post('/', authenticate, upload.single('photo'), createIssue);
router.patch('/:id/status', authenticate, authorize('AUTHORITY', 'ADMIN'), updateIssueStatus);
router.post('/:id/upvote', authenticate, upvoteIssue);

module.exports = router;
