const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getCities, getZonesByCity,
  createCity, createZone, deleteCity, deleteZone,
} = require('../controllers/city.controller');

const router = express.Router();

// Public — anyone can read cities/zones for dropdowns
router.get('/', getCities);
router.get('/:cityId/zones', getZonesByCity);

// Admin only — manage cities/zones
router.post('/', authenticate, authorize('ADMIN'), createCity);
router.post('/:cityId/zones', authenticate, authorize('ADMIN'), createZone);
router.delete('/:cityId', authenticate, authorize('ADMIN'), deleteCity);
router.delete('/zones/:zoneId', authenticate, authorize('ADMIN'), deleteZone);

module.exports = router;
