const prisma = require('../lib/prisma');
const { generateResolutionPDF } = require('../services/pdf.service');
const { generateResolutionReport } = require('../services/gemini.service');

const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        updates: {
          include: { authority: { select: { name: true, department: true } } },
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Check access: only reporter or authority/admin
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (userRole === 'CITIZEN' && issue.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Generate AI report text
    const reportText = await generateResolutionReport(issue, issue.updates, issue.comments);

    // Generate PDF
    const pdfBuffer = await generateResolutionPDF(issue, issue.updates, reportText);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="issue-${id.substring(0, 8)}-report.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};

module.exports = { downloadReport };
