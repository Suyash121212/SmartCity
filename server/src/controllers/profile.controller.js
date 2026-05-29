const prisma = require('../lib/prisma');

// PATCH /api/profile/complete — set city + zone
const completeProfile = async (req, res) => {
  try {
    const { cityId, zoneId } = req.body;
    const userId = req.user.id;

    if (!cityId || !zoneId) {
      return res.status(400).json({ success: false, message: 'City and zone are required' });
    }

    // Validate city exists
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    // Validate zone belongs to city
    const zone = await prisma.zone.findFirst({ where: { id: zoneId, cityId } });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found in this city' });

    // Check authority exists for this city+zone (warn but don't block)
    const authority = await prisma.user.findFirst({
      where: { role: 'AUTHORITY', cityId, zoneId },
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { cityId, zoneId, profileComplete: true },
      select: {
        id: true, name: true, email: true, role: true,
        profileComplete: true,
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: user,
      warning: !authority ? 'No authority assigned to this area yet. Your issues will be queued.' : null,
    });
  } catch (err) {
    console.error('Complete profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// GET /api/profile — get full profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        profileComplete: true, department: true, avatar: true, createdAt: true,
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        _count: { select: { issues: true, comments: true } },
      },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = { completeProfile, getProfile };
