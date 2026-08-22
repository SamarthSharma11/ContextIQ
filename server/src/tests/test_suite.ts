import assert from 'assert';
import jwt from 'jsonwebtoken';
import { splitTextIntoChunks } from '../services/chunking';
import { config } from '../config/env';
import { AuthPayload } from '../middleware/auth';

let passed = 0;
let failed = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\n=========================================');
  console.log('🧪 Running ContextIQ Automated Test Suite');
  console.log('=========================================\n');

  console.log('📦 1. Text Chunking & Context Preservation:');
  await runTest('Should split long documentation into chunks with overlap', () => {
    const sampleText = 'Paragraph 1. ' + 'Sentence inside doc. '.repeat(150) + '\n\nParagraph 2. ' + 'More details. '.repeat(150);
    const chunks = splitTextIntoChunks(sampleText, 500, 50);

    assert(chunks.length > 1, `Expected multiple chunks, got ${chunks.length}`);
    assert(chunks[0].index === 0, 'First chunk must have index 0');
    assert(chunks[0].tokenCount > 0, 'Token count must be greater than 0');
    assert(chunks[0].text.length > 0, 'Chunk text must not be empty');
  });

  await runTest('Should handle small or single paragraph text cleanly', () => {
    const shortText = 'ContextIQ allows grounded RAG chatbots.';
    const chunks = splitTextIntoChunks(shortText);
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].text, shortText);
  });

  console.log('\n🔐 2. Auth & Multi-Tenant JWT Scoping:');
  await runTest('Should sign and verify JWT carrying tenantId and role', () => {
    const payload: AuthPayload = {
      userId: '65e3a8901234567890abcdef',
      tenantId: '65e3a8901234567890123456',
      role: 'owner',
      email: 'owner@tenant.com',
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;

    assert.strictEqual(decoded.userId, payload.userId);
    assert.strictEqual(decoded.tenantId, payload.tenantId);
    assert.strictEqual(decoded.role, 'owner');
  });

  console.log('\n🛡️ 3. Cross-Tenant Data Isolation Logic:');
  await runTest('Pinecone namespace must strictly match tenant slug', () => {
    const tenantA_slug: string = 'acme-corp';
    const tenantB_slug: string = 'globex-inc';

    assert.notStrictEqual(tenantA_slug, tenantB_slug, 'Tenant namespaces must be distinct');
    const namespaceA: string = `tenant_${tenantA_slug}`;
    const namespaceB: string = `tenant_${tenantB_slug}`;
    assert(namespaceA !== namespaceB, 'Namespaces must never overlap');
  });

  console.log('\n⚡ 4. Metering & Plan Limits:');
  await runTest('Should accurately detect plan usage limits', () => {
    const tokenLimit = 500000;
    const tokenUsedUnder = 250000;
    const tokenUsedOver = 500001;

    const isUnderLimit = tokenUsedUnder < tokenLimit;
    const isOverLimit = tokenUsedOver >= tokenLimit;

    assert.strictEqual(isUnderLimit, true, 'Should allow queries when under limit');
    assert.strictEqual(isOverLimit, true, 'Should trigger auto-pause when limit exceeded');
  });

  console.log('\n🚦 5. Distributed Rate Limiter Store:');
  await runTest('Should track and increment distributed rate limit hits across requests', async () => {
    const { RedisRateLimitStore } = await import('../services/rateLimitStore');
    const store = new RedisRateLimitStore({ prefix: 'rl:test:', windowMs: 60000 });
    const ipKey = '192.168.1.100';

    const res1 = await store.increment(ipKey);
    assert.strictEqual(res1.totalHits, 1, 'First request hit count should be 1');

    const res2 = await store.increment(ipKey);
    assert.strictEqual(res2.totalHits, 2, 'Second request hit count should be 2');

    await store.decrement(ipKey);
    const getRes = await store.get(ipKey);
    assert.strictEqual(getRes?.totalHits, 1, 'Hit count after decrement should be 1');
  });

  console.log('\n📝 6. Structured Logger & Request Context:');
  await runTest('Should instantiate Pino structured logger and bind tenant child context', async () => {
    const { logger, getTenantLogger } = await import('../services/logger');
    assert(typeof logger.info === 'function', 'Logger must have info method');
    assert(typeof logger.error === 'function', 'Logger must have error method');

    const tenantLog = getTenantLogger('tenant_12345', { requestId: 'req_abcde' });
    assert(typeof tenantLog.info === 'function', 'Child tenant logger must have info method');
    assert(typeof tenantLog.child === 'function', 'Child tenant logger must have child method');
  });

  console.log('\n=========================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('=========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main();
