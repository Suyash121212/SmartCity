const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const getAnalytics = async (req, res) => {
  try {
    const [
      totalIssues, resolvedIssues, pendingIssues, criticalIssues,
      byCategory, byStatus, byPriority, recentIssues, totalUsers,
    ] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'RESOLVED' } }),
      prisma.issue.count({ where: { status: { in: ['REPORTED', 'IN_REVIEW', 'IN_PROGRESS'] } } }),
      prisma.issue.count({ where: { priority: 'CRITICAL' } }),
      prisma.issue.groupBy({ by: ['category'], _count: { id: true } }),
      prisma.issue.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.issue.groupBy({ by: ['priority'], _count: { id: true } }),
      prisma.issue.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.user.count({ where: { role: 'CITIZEN' } }),
    ]);

    // Resolution rate
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    // Average resolution time (hours)
    const resolvedWithTime = await prisma.issue.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });
    const avgResolutionHours = resolvedWithTime.length > 0
      ? Math.round(resolvedWithTime.reduce((acc, i) =>
          acc + (new Date(i.resolvedAt) - new Date(i.createdAt)) / 3600000, 0
        ) / resolvedWithTime.length)
      : 0;

    // Issues over last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await prisma.issue.count({
        where: { createdAt: { gte: start, lte: end } },
      });
      last7Days.push({ date: start.toISOString().split('T')[0], count });
    }

    res.json({
      success: true,
      data: {
        overview: { totalIssues, resolvedIssues, pendingIssues, criticalIssues, resolutionRate, avgResolutionHours, totalUsers },
        byCategory: byCategory.map(c => ({ name: c.category, value: c._count.id })),
        byStatus: byStatus.map(s => ({ name: s.status, value: s._count.id })),
        byPriority: byPriority.map(p => ({ name: p.priority, value: p._count.id })),
        recentIssues,
        trend: last7Days,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

const createAuthority = async (req, res) => {
  try {
    const { name, email, password, department, cityId, zoneId } = req.body;

    if (!cityId || !zoneId) {
      return res.status(400).json({ success: false, message: 'City and zone are required for authority accounts' });
    }

    // Validate city + zone
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) return res.status(404).json({ success: false, message: 'City not found' });

    const zone = await prisma.zone.findFirst({ where: { id: zoneId, cityId } });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found in this city' });

    // Check if authority already exists for this city+zone
    const existing = await prisma.user.findFirst({
      where: { role: 'AUTHORITY', cityId, zoneId },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An authority already exists for ${city.name} → ${zone.name}`,
      });
    }

    const existing_email = await prisma.user.findUnique({ where: { email } });
    if (existing_email) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const authority = await prisma.user.create({
      data: {
        name, email, password: hashedPassword,
        role: 'AUTHORITY', department,
        cityId, zoneId,
        profileComplete: true,
        mustChangePassword : true
      },
      select: {
        id: true, name: true, email: true, role: true,
        department: true, profileComplete: true, createdAt: true,
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, data: authority });
  } catch (err) {
    console.error('Create authority error:', err);
    res.status(500).json({ success: false, message: 'Failed to create authority account' });
  }
};

const getAuthorities = async (req, res) => {
  try {
    const authorities = await prisma.user.findMany({
      where: { role: 'AUTHORITY' },
      select: {
        id: true, name: true, email: true, department: true, createdAt: true,
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        _count: { select: { statusUpdates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: authorities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch authorities' });
  }
};

const getEscalatedIssues = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      where: {
        status: { in: ['REPORTED', 'IN_REVIEW', 'IN_PROGRESS'] },
        priority: { in: ['HIGH', 'CRITICAL'] },
      },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { comments: true, upvotes: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
    res.json({ success: true, data: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch escalated issues' });
  }
};

const getSentimentTrends = async (req, res) => {
  try {
    const trends = await prisma.comment.groupBy({
      by: ['sentiment'],
      _count: { id: true },
      where: { sentiment: { not: null } },
    });
    res.json({ success: true, data: trends.map(t => ({ sentiment: t.sentiment, count: t._count.id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch sentiment trends' });
  }
};

module.exports = { getAnalytics, createAuthority, getAuthorities, getEscalatedIssues, getSentimentTrends };
