// Automated End-to-End Verification Test Script
const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n--- Starting E2E Verification Suite ---\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  try {
    // 1. Check Disconnected Live Vitals
    console.log('1. Testing Disconnected State...');
    const resDisc = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wearable/live/TEST_DISCONNECTED_USER',
      method: 'GET'
    });
    assert(resDisc.status === 200, 'GET /api/wearable/live returned 200');
    assert(resDisc.body.isHardwareActive === false, 'isHardwareActive is false when disconnected');
    assert(resDisc.body.temperature === 'Not Applicable', 'temperature shows Not Applicable when disconnected');
    assert(resDisc.body.sleepHours === 'Not Applicable', 'sleepHours shows Not Applicable when disconnected');
    assert(resDisc.body.heartRate === 'Not Applicable', 'heartRate shows Not Applicable when disconnected');
    assert(resDisc.body.spo2 === 'Not Applicable', 'spo2 shows Not Applicable when disconnected');

    // 2. Check Disconnected History (Flatline)
    console.log('\n2. Testing Disconnected History (Flatline)...');
    const resDiscHist = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wearable/history/TEST_DISCONNECTED_USER',
      method: 'GET'
    });
    assert(resDiscHist.status === 200, 'GET /api/wearable/history returned 200');
    assert(resDiscHist.body.isHardwareActive === false, 'History reports isHardwareActive false');
    assert(Array.isArray(resDiscHist.body.history) && resDiscHist.body.history.length > 0, 'History returns baseline flatline points');

    // 3. Post Live Simulated ESP32 Telemetry
    console.log('\n3. Testing ESP32 Telemetry Ingestion...');
    const testUserId = 'NT1001';
    const packet = {
      userId: testUserId,
      heartRate: 78,
      spo2: 98,
      temperature: 36.7,
      sleepHours: 7.5,
      sleepQuality: 'Good (88%)',
      motion: 'Resting',
      battery: 92
    };
    const resPost = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wearable/data',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, packet);
    assert(resPost.status === 200, 'POST /api/wearable/data returned 200');
    assert(resPost.body.success === true, 'POST /api/wearable/data success is true');

    // 4. Verify Active Live Telemetry
    console.log('\n4. Testing Active Live Telemetry Retrieval...');
    const resActive = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/wearable/live/${testUserId}`,
      method: 'GET'
    });
    assert(resActive.status === 200, 'GET /api/wearable/live returned 200 for active user');
    assert(resActive.body.isHardwareActive === true, 'isHardwareActive is true');
    assert(resActive.body.heartRate === 78, 'heartRate matches telemetry (78)');
    assert(resActive.body.spo2 === 98, 'spo2 matches telemetry (98)');
    assert(resActive.body.temperature === 36.7, 'temperature matches telemetry (36.7)');
    assert(resActive.body.sleepHours === 7.5, 'sleepHours matches telemetry (7.5)');

    // 5. Submit Assessment Session with Synchronized Vitals
    console.log('\n5. Testing Assessment Submission with Telemetry Coupling...');
    const sessionPayload = {
      userId: testUserId,
      answers: [
        { questionNumber: 1, selectedOption: 'Sometimes', score: 1 },
        { questionNumber: 8, selectedOption: '7-8 hours', score: 0 }
      ],
      rawScore: 12,
      score: 20,
      riskLevel: 'LOW',
      explanation: 'Responses indicate healthy autonomic and emotional baseline.'
    };
    const resSession = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/session/submit',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, sessionPayload);
    assert(resSession.status === 200, 'POST /api/session/submit returned 200');
    assert(resSession.body.success === true, 'Session submission success is true');

    // 6. Verify Latest Session Retains Synchronized Vitals
    console.log('\n6. Testing Session History & Result Retrieval...');
    const resLatest = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/session/latest/${testUserId}`,
      method: 'GET'
    });
    assert(resLatest.status === 200, 'GET /api/session/latest returned 200');
    const latest = resLatest.body.latest;
    assert(latest && latest.vitals, 'Latest session contains vitals snapshot');
    assert(latest.vitals.isHardwareActive === true, 'Session vitals isHardwareActive is true');
    assert(latest.vitals.temperature === 36.7, 'Session vitals temperature is 36.7');
    assert(latest.vitals.heartRate === 78, 'Session vitals heartRate is 78');
    assert(latest.vitals.sleepHours === 7.5, 'Session vitals sleepHours is 7.5');

    console.log(`\n========================================`);
    console.log(`Verification Complete: ${passed}/${total} assertions passed.`);
    console.log(`========================================\n`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Verification Error:', err);
    process.exit(1);
  }
}

// Give server 1 second before running
setTimeout(runTests, 1000);
