require('dotenv').config();
const { categorizeIssue, analyzeSentiment } = require('./src/services/gemini.service');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function test() {
  console.log('🤖 Testing Gemini AI (gemini-2.0-flash)...\n');

  // Test 1: Categorize issue
  console.log('1️⃣  Testing categorization...');
  const category = await categorizeIssue(
    'Large pothole on MG Road',
    'There is a massive pothole near the bus stop causing accidents'
  );
  console.log('✅ Category result:', JSON.stringify(category, null, 2));

  // Wait 5s between calls to avoid rate limit
  await sleep(5000);

  // Test 2: Sentiment analysis
  console.log('\n2️⃣  Testing sentiment...');
  const sentiment = await analyzeSentiment(
    'This pothole has been here for 3 months and nobody is fixing it! Very frustrated!'
  );
  console.log('✅ Sentiment result:', JSON.stringify(sentiment, null, 2));

  console.log('\n🎉 Gemini AI is working!');
}

test().catch(console.error);
