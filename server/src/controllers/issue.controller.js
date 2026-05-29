const prisma = require('../lib/prisma');
const { getQueue } = require('../queues/issue.queue');
const { get, set, invalidatePattern } = require('../services/redis.service');
const { emitStatusUpdate, emitHighSeverityAlert, emitNewIssue } = require('../services/socket.service');
const { uploadBuffer } = require('../services/cloudinary.service');
const { categorizeIssue } = require('../services/gemini.service');




const createIssue = async (req, res) => {
  let uploadedPhotoUrl = null;

if (req.file) {

  const uploadResult =
    await uploadBuffer(
      req.file.buffer,
      {
        folder: 'smartcity/issues',
        resource_type: 'image',
      }
    );

  uploadedPhotoUrl =
    uploadResult.secure_url;
}
  try {
    const { title, description, category, lat, lng, photoUrl, aiAnalysis } = req.body;
    const userId = req.user.id;

    // Get user's city + zone
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { cityId: true, zoneId: true, profileComplete: true },
    });

    if (!userProfile.profileComplete || !userProfile.cityId || !userProfile.zoneId) {
      return res.status(403).json({
        success: false,
        message: 'Please complete your profile (select city & zone) before reporting issues.',
        code: 'PROFILE_INCOMPLETE',
      });
    }

    // Find authority for this city+zone
    const authority = await prisma.user.findFirst({
      where: { role: 'AUTHORITY', cityId: userProfile.cityId, zoneId: userProfile.zoneId },
      select: { id: true },
    });

    if (!authority) {
      return res.status(422).json({
        success: false,
        message: 'This area is currently not onboarded. No authority assigned to your city/zone yet.',
        code: 'NO_AUTHORITY',
      });
    }

    // Parse AI analysis if passed as string
    let parsedAI = null;
    if (aiAnalysis) {
      try { parsedAI = typeof aiAnalysis === 'string' ? JSON.parse(aiAnalysis) : aiAnalysis; }
      catch { parsedAI = null; }
    }

    // Create issue with city+zone+assignedTo
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category: category || 'OTHER',
        priority: parsedAI?.priority || 'LOW',
        status: 'REPORTED',
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        userId,
        cityId: userProfile.cityId,
        zoneId: userProfile.zoneId,
        assignedToId: authority.id,
        photoUrl: uploadedPhotoUrl,
        aiAnalysis: parsedAI || undefined,
      },
      include: {
        user: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
      },
    });

    // Queue for additional AI processing if no photo AI yet
    if (!photoUrl) {
      const queue = getQueue();
      const jobData = { issueId: issue.id, userId, title, description };
      if (req.file) {
        jobData.fileBuffer = Array.from(req.file.buffer);
        jobData.fileType = req.file.mimetype;
      }
      if (queue) {
        try { await queue.add('process-issue', jobData, { priority: 1 }); }
        catch (queueErr) { console.warn('Queue add failed:', queueErr.message); }
      } else {
        processIssueInline(issue.id, userId, req.file, title, description).catch(console.error);
      }
    }

    await invalidatePattern('issues:*');
    emitNewIssue(issue);

    res.status(201).json({ success: true, data: issue, message: 'Issue submitted and routed to local authority!' });
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ success: false, message: 'Failed to create issue' });
  }
};

// Inline processing when queue is unavailable
const processIssueInline = async (issueId, userId, file, title, description) => {
  try {
    const updateData = {};

    // Upload photo to Cloudinary directly
    if (file) {
      const uploadResult = await uploadBuffer(file.buffer, {
        folder: 'smartcity/issues',
        resource_type: 'image',
      });
      updateData.photoUrl = uploadResult.secure_url;
      console.log(`📸 Photo uploaded inline for issue ${issueId}: ${uploadResult.secure_url}`);
    }

    // AI categorization
    const categoryData = await categorizeIssue(title, description);
    if (categoryData) {
      if (categoryData.category) updateData.category = categoryData.category;
      if (categoryData.priority) updateData.priority = categoryData.priority;
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await prisma.issue.update({
        where: { id: issueId },
        data: updateData,
        include: { user: { select: { id: true, name: true, area: true } } },
      });
      await invalidatePattern('issues:*');
      emitNewIssue(updated);
    }
  } catch (err) {
    console.error('Inline processing error:', err.message);
  }
};

const getIssues = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, category, priority, status,
      search, sortBy = 'createdAt', order = 'desc',
    } = req.query;

    const cacheKey = `issues:${req.user?.id || 'public'}:${JSON.stringify(req.query)}`;
    const cached = await get(cacheKey);
    if (cached) return res.json({ success: true, ...cached, cached: true });

    const where = {};

    // Authority sees only their city+zone issues
    if (req.user?.role === 'AUTHORITY') {
      where.cityId = req.user.cityId;
      where.zoneId = req.user.zoneId;
    }

    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          city: { select: { id: true, name: true } },
          zone: { select: { id: true, name: true } },
          _count: { select: { comments: true, upvotes: true } },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    const result = {
      data: issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };

    await set(cacheKey, result, 120);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Get issues error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch issues' });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);
    // console.log("hello");
    
    const issue = await prisma.issue.findUnique({
      where: { id},
      include: {
        user: { select: { id: true, name: true, avatar: true, city: true ,zone:true} },
        updates: {
          include: { authority: { select: { id: true, name: true, department: true } } },
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { upvotes: true, comments: true } },
      },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({ success: true, data: issue });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch issue' });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const authorityId = req.user.id;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const updateData = { status };
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();

    const [updatedIssue, statusUpdate] = await prisma.$transaction([
      prisma.issue.update({ where: { id }, data: updateData }),
      prisma.statusUpdate.create({
        data: { issueId: id, authorityId, status, note: note || '' },
        include: { authority: { select: { id: true, name: true, department: true } } },
      }),
    ]);

    // Invalidate cache
    await invalidatePattern('issues:*');

    // Emit real-time update
    emitStatusUpdate(updatedIssue, statusUpdate);

    res.json({ success: true, data: { issue: updatedIssue, update: statusUpdate } });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

const upvoteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.upvote.findUnique({
      where: { issueId_userId: { issueId: id, userId } },
    });

    if (existing) {
      await prisma.upvote.delete({ where: { issueId_userId: { issueId: id, userId } } });
      await prisma.issue.update({ where: { id }, data: { upvoteCount: { decrement: 1 } } });
      return res.json({ success: true, upvoted: false, message: 'Upvote removed' });
    }

    await prisma.upvote.create({ data: { issueId: id, userId } });
    await prisma.issue.update({ where: { id }, data: { upvoteCount: { increment: 1 } } });

    res.json({ success: true, upvoted: true, message: 'Issue upvoted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upvote' });
  }
};

const getHeatmap = async (req, res) => {
  try {
    const cacheKey = 'heatmap:all';
    const cached = await get(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const issues = await prisma.issue.findMany({
      select: {
        lat: true, lng: true, priority: true,
        category: true, status: true,
      },
    });

    await set(cacheKey, issues, 300); // 5 min cache
    res.json({ success: true, data: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch heatmap data' });
  }
};

const getMyIssues = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 50 } = req.query;

    const where = { userId };
    // Only add status filter if it's a valid value
    if (status && status !== 'ALL') where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true, upvotes: true } },
          updates: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      success: true,
      data: issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get my issues error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch your issues' });
  }
};

module.exports = {
  createIssue, getIssues, getIssueById,
  updateIssueStatus, upvoteIssue, getHeatmap, getMyIssues,
};
