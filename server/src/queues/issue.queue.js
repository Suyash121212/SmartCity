const { Queue } = require('bullmq');

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: false,
};

let issueQueue = null;
let queueAvailable = false;

const getQueue = () => {
  if (!queueAvailable || !issueQueue) return null;
  return issueQueue;
};

const initQueue = async () => {
  try {
    issueQueue = new Queue('issue-processing', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    });

    // BullMQ v5: use waitUntilReady() to confirm connection
    await issueQueue.waitUntilReady();
    queueAvailable = true;
    console.log('✅ BullMQ queue connected to Redis');

    issueQueue.on('error', (err) => {
      console.warn('⚠️  Queue error:', err.message);
      queueAvailable = false;
    });

  } catch (err) {
    console.warn('⚠️  Queue unavailable (Redis not running):', err.message);
    queueAvailable = false;
    issueQueue = null;
  }
};

module.exports = { getQueue, initQueue, redisConnection };
