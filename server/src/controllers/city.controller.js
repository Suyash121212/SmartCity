const prisma = require('../lib/prisma');

// GET /api/cities — list all cities
const getCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { zones: true } } },
    });
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

// GET /api/cities/:cityId/zones — list zones for a city
const getZonesByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const zones = await prisma.zone.findMany({
      where: { cityId },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: zones });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch zones' });
  }
};

// POST /api/admin/cities — create city (admin only)
const createCity = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'City name required' });

    const city = await prisma.city.create({ data: { name: name.trim() } });
    res.status(201).json({ success: true, data: city });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'City already exists' });
    res.status(500).json({ success: false, message: 'Failed to create city' });
  }
};

// POST /api/admin/cities/:cityId/zones — create zone (admin only)
const createZone = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Zone name required' });

    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    const zone = await prisma.zone.create({ data: { name: name.trim(), cityId } });
    res.status(201).json({ success: true, data: zone });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'Zone already exists in this city' });
    res.status(500).json({ success: false, message: 'Failed to create zone' });
  }
};

// DELETE /api/admin/cities/:cityId — delete city
const deleteCity = async (req, res) => {
  try {
    await prisma.city.delete({ where: { id: req.params.cityId } });
    res.json({ success: true, message: 'City deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete city' });
  }
};

// DELETE /api/admin/zones/:zoneId — delete zone
const deleteZone = async (req, res) => {
  try {
    await prisma.zone.delete({ where: { id: req.params.zoneId } });
    res.json({ success: true, message: 'Zone deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete zone' });
  }
};

module.exports = { getCities, getZonesByCity, createCity, createZone, deleteCity, deleteZone };
