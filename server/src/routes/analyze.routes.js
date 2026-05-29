const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { analyzeImage } = require('../services/gemini.service');

const router = express.Router();

router.post(
  '/image',
  authenticate,
  upload.single('photo'),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image provided',
        });
      }

      // Convert image buffer to base64
      const base64Image =
        req.file.buffer.toString('base64');

      // Analyze directly with Gemini
      const analysis =
        await analyzeImage(base64Image);

      if (!analysis) {

        return res.json({
          success: true,
          analysis: null,
          message:
            'AI analysis unavailable',
        });
      }

      res.json({
        success: true,
        analysis,
      });

    } catch (err) {

      console.error(
        'Analyze image error:',
        err.message
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to analyze image',
      });
    }
  }
);

module.exports = router;