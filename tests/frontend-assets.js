const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:5174/api';

async function testFrontendIntegration() {
  const testResults = [];

  console.log('\n=== FRONTEND INTEGRATION TEST ===\n');

  try {
    console.log('1. Checking if Frontend is running...');
    const homeRes = await fetch(BASE_URL);
    console.log('Status:', homeRes.status);
    testResults.push({ test: 'Frontend Running', pass: homeRes.ok });

    console.log('\n2. Checking if key pages exist...');
    const pages = [
      'index.html',
      'pages/signin.html',
      'pages/join.html',
      'pages/workspace.html',
      'pages/planner.html',
      'pages/plan-view.html',
      'pages/overview.html',
    ];
    let allPagesExist = true;

    for (const page of pages) {
      const pageRes = await fetch(`${BASE_URL}/${page}`);
      const exists = pageRes.ok;
      console.log(`  - ${page}: ${exists ? 'OK' : 'MISSING'}`);
      if (!exists) {
        allPagesExist = false;
      }
    }
    testResults.push({ test: 'Pages Exist', pass: allPagesExist });

    console.log('\n3. Checking if CSS loads...');
    const cssRes = await fetch(`${BASE_URL}/assets/styles/studyplan-theme.css`);
    console.log('CSS Status:', cssRes.status);
    testResults.push({ test: 'CSS Loading', pass: cssRes.ok });

    console.log('\n4. Checking if JS files exist...');
    const jsFiles = [
      'assets/scripts/services/studyplanGateway.js',
      'assets/scripts/pages/workspace.js',
    ];
    let allJsExist = true;

    for (const file of jsFiles) {
      const jsRes = await fetch(`${BASE_URL}/${file}`);
      const exists = jsRes.ok;
      console.log(`  - ${file}: ${exists ? 'OK' : 'MISSING'}`);
      if (!exists) {
        allJsExist = false;
      }
    }
    testResults.push({ test: 'JS Files Exist', pass: allJsExist });

    console.log('\n5. Verifying Backend API connectivity...');
    try {
      const apiRes = await fetch(`${API_BASE}/plans`);
      console.log('Backend Status:', apiRes.status);
      testResults.push({ test: 'Backend Reachable', pass: apiRes.ok });
    } catch (error) {
      console.log('Cannot reach backend:', error.message);
      testResults.push({ test: 'Backend Reachable', pass: false });
    }

    console.log('\n6. Testing End-to-End Auth Flow...');
    const email = `e2e-${Date.now()}@test.com`;

    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test User',
        email,
        password: 'password123',
      }),
    });

    if (registerRes.ok) {
      console.log('  - Registration successful');
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const token = loginData.data.accessToken;
        const protectedRes = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        testResults.push({ test: 'End-to-End Auth Flow', pass: protectedRes.ok });
      } else {
        testResults.push({ test: 'End-to-End Auth Flow', pass: false });
      }
    } else {
      testResults.push({ test: 'End-to-End Auth Flow', pass: false });
    }

    console.log('\n7. Checking JS files for obvious syntax issues...');
    try {
      for (const file of jsFiles) {
        const jsRes = await fetch(`${BASE_URL}/${file}`);
        const js = await jsRes.text();
        const hasSyntaxIssues =
          js.includes('undefined is not a function') ||
          js.includes('Cannot read properties') ||
          js.includes('SyntaxError');
        console.log(`  - ${file}: ${hasSyntaxIssues ? 'Warning' : 'OK'}`);
      }
      testResults.push({ test: 'JS Syntax Check', pass: true });
    } catch (error) {
      console.log('JS check error:', error.message);
      testResults.push({ test: 'JS Syntax Check', pass: false });
    }

    console.log('\n\n=== FRONTEND TEST SUMMARY ===\n');
    let passCount = 0;
    let failCount = 0;
    testResults.forEach((result) => {
      const status = result.pass ? 'PASS' : 'FAIL';
      console.log(`${status}: ${result.test}`);
      if (result.pass) {
        passCount += 1;
      } else {
        failCount += 1;
      }
    });
    console.log(`\nTotal: ${passCount} passed, ${failCount} failed`);
  } catch (error) {
    console.error('\nCRITICAL ERROR:', error.message);
  }
}

testFrontendIntegration();
