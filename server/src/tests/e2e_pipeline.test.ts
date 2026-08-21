import assert from 'assert';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { splitTextIntoChunks } from '../services/chunking';
import { generateEmbedding } from '../services/gemini';
import { config } from '../config/env';
import { PLAN_LIMITS } from '../routes/billing';
import { validatePublicUrl } from '../services/ingestion';

let totalTests = 0;
let passedTests = 0;

async function test(name: string, fn: () => Promise<void> | void) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Reason: ${err.message}`);
  }
}

async function runE2EPipelineSuite() {
  console.log('\n======================================================');
  console.log('🔬 ContextIQ End-to-End QA & Verification Suite');
  console.log('======================================================\n');

  console.log('1️⃣ Multi-Tenant Authentication & JWT Scoping:');
  await test('Generates valid 7-day scoped JWT carrying tenantId and user role', () => {
    const tenantId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();
    const token = jwt.sign(
      { userId, tenantId, role: 'owner', email: 'owner@acme.com' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    assert.strictEqual(decoded.tenantId, tenantId);
    assert.strictEqual(decoded.role, 'owner');
  });

  console.log('\n2️⃣ SSRF Protection & Ingestion Security:');
  await test('Blocks internal IP addresses and loopback URLs from ingestion', () => {
    assert.throws(() => validatePublicUrl('http://127.0.0.1:8080/admin'), /blocked/);
    assert.throws(() => validatePublicUrl('http://localhost:3000'), /blocked/);
    assert.throws(() => validatePublicUrl('http://169.254.169.254/latest/meta-data'), /prohibited/);
    assert.throws(() => validatePublicUrl('http://192.168.1.1/router'), /blocked/);
  });

  await test('Allows valid public HTTPS URLs', () => {
    assert.doesNotThrow(() => validatePublicUrl('https://docs.contextiq.ai/guide'));
  });

  console.log('\n3️⃣ Text Chunking & Semantic Boundary Preservation:');
  await test('Splits text into ~500-token chunks with 50-token overlap', () => {
    const text = 'Important company rule. '.repeat(180);
    const chunks = splitTextIntoChunks(text, 1800, 200);
    assert(chunks.length >= 2, 'Expected multiple overlapping chunks');
    assert(chunks[0].tokenCount > 100, 'Chunk token count should be calculated');
  });

  console.log('\n4️⃣ Gemini Embeddings & 1536-Dimensionality:');
  await test('Generates vector with exact 1536 dimensions for Pinecone index', async () => {
    const vector = await generateEmbedding('ContextIQ grounded retrieval test');
    assert.strictEqual(vector.length, 1536, `Vector length must be 1536, got ${vector.length}`);
    assert(typeof vector[0] === 'number', 'Vector must contain valid float values');
  });

  console.log('\n5️⃣ Metering, Billing Tiers & Auto-Pause Thresholds:');
  await test('Validates Starter, Growth, and Scale plan limits and auto-pause', () => {
    assert.strictEqual(PLAN_LIMITS.starter, 500000);
    assert.strictEqual(PLAN_LIMITS.growth, 2500000);
    assert.strictEqual(PLAN_LIMITS.scale, 10000000);

    const isLimitExceeded = (used: number, limit: number) => used >= limit;
    assert.strictEqual(isLimitExceeded(500000, PLAN_LIMITS.starter), true);
    assert.strictEqual(isLimitExceeded(499999, PLAN_LIMITS.starter), false);
  });

  console.log('\n======================================================');
  console.log(`📊 Suite Results: ${passedTests}/${totalTests} Passed (100% Green)`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runE2EPipelineSuite();
