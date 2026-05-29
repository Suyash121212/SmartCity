const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { completeProfile, getProfile } = require('../controllers/profile.controller');

const router = express.Router();

router.get('/', authenticate, getProfile);
router.patch('/complete', authenticate, completeProfile);

module.exports = router;
