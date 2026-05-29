const { Worker } = require('bullmq');
const prisma = require('../lib/prisma');
const { uploadBuffer } = require('../services/cloudinary.service');
const { analyzeImage, categorizeIssue } = require('../services/gemini.service');
const { invalidatePattern } = require('../services/redis.service');
const { emitNewIssue, emitHighSeverityAlert, emitJobProgress } = require('../services/socket.service');
const { redisConnection } = require('./issue.queue');

let worker = null;

const startWorker = () => {
  try {
    worker = new Worker(
      'issue-processing',
      async (job) => {
        const { issueId, userId, fileBuffer, fileType, title, description } = job.data;

        try {
          await job.updateProgress(10);
          emitJobProgress(userId, { issueId, step: 'Uploading image...', progress: 10 });

          let photoUrl = null;
          let aiAnalysis = null;

          if (fileBuffer) {
            const buffer = Buffer.from(fileBuffer);
            const uploadResult = await uploadBuffer(buffer, {
              folder: 'smartcity/issues',
              resource_type: 'image',
            });
            photoUrl = uploadResult.secure_url;

            await job.updateProgress(40);
            emitJobProgress(userId, { issueId, step: 'Analyzing image with AI...', progress: 40 });
            aiAnalysis = await analyzeImage(photoUrl);
          }

          await job.updateProgress(60);
          emitJobProgress(userId, { issueId, step: 'Categorizing issue...', progress: 60 });

          let categoryData = null;
          if (!aiAnalysis) {
            categoryData = await categorizeIssue(title, description);
          }

          await job.updateProgress(80);
          emitJobProgress(userId, { issueId, step: 'Saving results...', progress: 80 });

          const updateData = {};
          if (photoUrl) updateData.photoUrl = photoUrl;

          if (aiAnalysis) {
            updateData.aiAnalysis = aiAnalysis;
            if (aiAnalysis.category) updateData.category = aiAnalysis.category;
            if (aiAnalysis.priority) updateData.priority = aiAnalysis.priority;
          } else if (categoryData) {
            if (categoryData.category) updateData.category = categoryData.category;
            if (categoryData.priority) updateData.priority = categoryData.priority;
          }

          const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: updateData,
            include: { user: { select: { id: true, name: true, area: true } } },
          });

          await invalidatePattern('issues:*');
          await invalidatePattern('heatmap:*');

          emitNewIssue(updatedIssue);
          if (['HIGH', 'CRITICAL'].includes(updatedIssue.priority)) {
            emitHighSeverityAlert(updatedIssue);
          }

          await job.updateProgress(100);
          emitJobProgress(userId, { issueId, step: 'Done!', progress: 100, issue: updatedIssue });

          return { success: true, issueId };
        } catch (err) {
          console.error('Worker job error:', err.message);
          throw err;
        }
      },
      {
        connection: redisConnection,
        concurrency: 3,
      }
    );

    worker.on('completed', (job) => console.log(`✅ Job ${job.id} completed`));
    worker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));

    // Only log worker connection errors once, not on every retry
    let workerErrorLogged = false;
    worker.on('error', (err) => {
      if (!workerErrorLogged) {
        console.warn('⚠️  Worker: Redis unavailable — queue processing disabled until Redis connects');
        workerErrorLogged = true;
      }
    });

    console.log('🔧 Issue worker started (waiting for Redis...)');
    return worker;
  } catch (err) {
    console.warn('⚠️  Worker could not start:', err.message);
    return null;
  }
};

module.exports = { startWorker };
