const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-3.5-flash';

// Strip markdown code fences from response
const cleanJSON = (text) => text.replace(/```json\n?|\n?```|```\n?/g, '').trim();

// Auto-retry on 429 rate limit with exponential backoff
const withRetry = async (fn, retries = 3, delayMs = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('quota');
      if (is429 && i < retries - 1) {
        const wait = delayMs * (i + 1);
        console.warn(`⏳ Gemini rate limit hit. Retrying in ${wait / 1000}s... (attempt ${i + 1}/${retries})`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
};

// Fetch image URL as base64 inline data for Gemini Vision
// needed if we want to fetch the image from the cloudinary
// const fetchImageAsBase64 = async (imageUrl) => {
//   const https = require('https');
//   const http = require('http');
//   const client = imageUrl.startsWith('https') ? https : http;

//   return new Promise((resolve, reject) => {
//     client.get(imageUrl, (res) => {
//       const chunks = [];
//       res.on('data', (chunk) => chunks.push(chunk));
//       res.on('end', () => {
//         const buffer = Buffer.concat(chunks);
//         resolve({
//           inlineData: {
//             data: buffer.toString('base64'),
//             mimeType: res.headers['content-type'] || 'image/jpeg',
//           },
//         });
//       });
//       res.on('error', reject);
//     }).on('error', reject);
//   });
// };

// Analyze image with Gemini Vision
const analyzeImage = async (
  base64Image,
  mimeType = 'image/jpeg'
) => {

  try {

    const model =
      genAI.getGenerativeModel({
        model: MODEL,
      });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const prompt = `
You are a civic issue detection AI.

Analyze this image and return ONLY valid JSON:

{
  "issue_type": "e.g. Pothole, Broken Streetlight, Garbage Overflow, Waterlogging, Damaged Road",
  "category": "one of: ROAD, SANITATION, WATER, ELECTRICITY, OTHER",
  "severity": "one of: minor, moderate, critical",
  "priority": "one of: LOW, MEDIUM, HIGH, CRITICAL",
  "description": "one concise sentence describing the issue",
  "suggested_title": "short title for the issue"
}

Return ONLY the JSON object.
No markdown.
No explanation.
`;

    const result = await withRetry(() =>
      model.generateContent([
        prompt,
        imagePart,
      ])
    );

    const cleaned =
      cleanJSON(result.response.text());

    return JSON.parse(cleaned);

  } catch (err) {

    console.error(
      'Gemini Vision error:',
      err.message
    );

    return null;
  }
};
// Auto-categorize issue from text
const categorizeIssue = async (title, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are a civic issue triage AI. Analyze and return ONLY valid JSON:
{
  "category": "one of: ROAD, SANITATION, WATER, ELECTRICITY, OTHER",
  "priority": "one of: LOW, MEDIUM, HIGH, CRITICAL",
  "department": "suggested department name",
  "tags": ["relevant", "tags"]
}

Title: ${title}
Description: ${description}

Return ONLY the JSON object, no markdown, no explanation.`;

    const result = await withRetry(() => model.generateContent(prompt));
    const cleaned = cleanJSON(result.response.text());
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini categorize error:', err.message);
    return null;
  }
};

// Analyze comment sentiment
const analyzeSentiment = async (comment) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `Analyze the sentiment of this civic complaint comment. Return ONLY valid JSON:
{
  "sentiment": "one of: POSITIVE, NEUTRAL, NEGATIVE, FRUSTRATED",
  "urgency_score": 5,
  "should_escalate": false
}

Comment: "${comment}"

Return ONLY the JSON object, no markdown, no explanation.`;

    const result = await withRetry(() => model.generateContent(prompt));
    const cleaned = cleanJSON(result.response.text());
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini sentiment error:', err.message);
    return { sentiment: 'NEUTRAL', urgency_score: 5, should_escalate: false };
  }
};

// Generate formal resolution report
const generateResolutionReport = async (issue, updates) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `You are a civic authority report writer. Generate a formal resolution report:

Issue: ${issue.title}
Category: ${issue.category}
Priority: ${issue.priority}
Description: ${issue.description}
Reported: ${issue.createdAt}
Resolved: ${issue.resolvedAt || 'Pending'}
Status Updates: ${JSON.stringify(updates.map(u => ({ status: u.status, note: u.note, date: u.createdAt })))}

Write a 2-3 paragraph formal report covering: issue description, actions taken, resolution outcome, and response time. Plain text only, no markdown.`;

    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  } catch (err) {
    console.error('Gemini report error:', err.message);
    return `Issue "${issue.title}" has been resolved. The civic authority has addressed the reported problem.`;
  }
};

module.exports = { analyzeImage, categorizeIssue, analyzeSentiment, generateResolutionReport };
