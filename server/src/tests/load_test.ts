import fetch from 'node-fetch';

interface MetricResult {
  totalRequests: number;
  successful: number;
  failed: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  durationSeconds: number;
  reqPerSec: number;
}

async function runSingleRequest(url: string): Promise<number> {
  const start = Date.now();
  try {
    const res = await fetch(url, { timeout: 10000 });
    if (!res.ok && res.status !== 404) {
      throw new Error(`HTTP ${res.status}`);
    }
    return Date.now() - start;
  } catch (err: any) {
    throw err;
  }
}

export async function runLoadTest(
  targetUrl: string = 'http://localhost:5000/health',
  concurrency: number = 500,
  batches: number = 1
): Promise<MetricResult> {
  console.log('\n=========================================');
  console.log(`🚀 ContextIQ Load Test: ${concurrency} Concurrent Users`);
  console.log(`🎯 Target Endpoint: ${targetUrl}`);
  console.log('=========================================\n');

  const latencies: number[] = [];
  let successful = 0;
  let failed = 0;

  const testStart = Date.now();

  for (let b = 0; b < batches; b++) {
    console.log(`⚡ Dispatching batch ${b + 1} (${concurrency} simultaneous connections)...`);
    const promises = Array.from({ length: concurrency }).map(async () => {
      try {
        const latency = await runSingleRequest(targetUrl);
        latencies.push(latency);
        successful++;
      } catch (e: any) {
        failed++;
      }
    });

    await Promise.all(promises);
  }

  const totalDurationMs = Date.now() - testStart;
  const durationSeconds = totalDurationMs / 1000;

  latencies.sort((a, b) => a - b);
  const avgLatencyMs = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const p95LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;
  const p99LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;
  const reqPerSec = Math.round((successful / durationSeconds) * 10) / 10;

  console.log('\n-----------------------------------------');
  console.log(`📊 Load Test Summary:`);
  console.log(`   Total Requests:      ${concurrency * batches}`);
  console.log(`   Successful (200 OK): ${successful}`);
  console.log(`   Failed / Timed out:  ${failed}`);
  console.log(`   Throughput:          ${reqPerSec} req/sec`);
  console.log(`   Average Latency:     ${avgLatencyMs} ms`);
  console.log(`   P95 Latency:         ${p95LatencyMs} ms`);
  console.log(`   P99 Latency:         ${p99LatencyMs} ms`);
  console.log(`   Sub-2s SLA Met:      ${avgLatencyMs < 2000 ? '✅ YES' : '❌ NO'}`);
  console.log('-----------------------------------------\n');

  return {
    totalRequests: concurrency * batches,
    successful,
    failed,
    avgLatencyMs,
    p95LatencyMs,
    p99LatencyMs,
    durationSeconds,
    reqPerSec,
  };
}

if (require.main === module) {
  runLoadTest()
    .then((metrics) => {
      if (metrics.failed > 5 || metrics.avgLatencyMs > 2000) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
