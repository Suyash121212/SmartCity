const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { addComment, getComments } = require('../controllers/comment.controller');

const router = express.Router();

router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, addComment);

module.exports = router;
