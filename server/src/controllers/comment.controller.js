const prisma = require('../lib/prisma');
const { analyzeSentiment } = require('../services/gemini.service');
const { emitEscalation } = require('../services/socket.service');

const addComment = async (req, res) => {
  try {
    const { id: issueId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Create comment first
    const comment = await prisma.comment.create({
      data: { issueId, userId, content, sentiment: 'NEUTRAL' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Async sentiment analysis (don't block response)
    analyzeSentiment(content).then(async (sentimentData) => {
      if (!sentimentData) return;

      await prisma.comment.update({
        where: { id: comment.id },
        data: { sentiment: sentimentData.sentiment },
      });

      // Auto-escalate if frustrated and issue unresolved
      if (
        sentimentData.should_escalate &&
        issue.status !== 'RESOLVED' &&
        issue.status !== 'REJECTED'
      ) {
        emitEscalation(issue, { ...comment, sentiment: sentimentData.sentiment });
      }
    }).catch(console.error);

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

const getComments = async (req, res) => {
  try {
    const { id: issueId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { issueId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

module.exports = { addComment, getComments };
