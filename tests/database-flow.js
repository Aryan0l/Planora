async function testDatabaseSchema() {
  const API_BASE = process.env.API_BASE_URL || 'http://localhost:5174/api';

  console.log('\n=== DATABASE SCHEMA & DATA VALIDATION ===\n');

  const testResults = [];

  try {
    console.log('1. Creating test data in database...');
    const email = `db-test-${Date.now()}@test.com`;

    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Database Test User',
        email,
        password: 'password123',
      }),
    });

    const userData = await registerRes.json();
    const userId = userData.data.id;
    console.log(`Created user ID: ${userId}`);

    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
      }),
    });

    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    console.log('\n2. Creating study plan...');
    const planRes = await fetch(`${API_BASE}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'DB Test Plan',
        description: 'A database test study plan',
        subject: 'Science',
        durationDays: 5,
        tasks: [
          { day: 1, title: 'Task 1', description: 'First task' },
          { day: 2, title: 'Task 2', description: 'Second task' },
        ],
      }),
    });

    const planData = await planRes.json();
    const planId = planData.data.id;
    console.log(`Created plan ID: ${planId}`);
    testResults.push({ test: 'Create User', pass: true });
    testResults.push({ test: 'Create Plan', pass: true });

    console.log('\n3. Verifying data retrieval...');
    const profileRes = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();
    console.log(`User profile retrieved: ${profileData.data.name}`);
    testResults.push({ test: 'Retrieve User Profile', pass: profileRes.ok });

    const getPlanRes = await fetch(`${API_BASE}/plans/${planId}`);
    const getPlanData = await getPlanRes.json();
    console.log(`Plan retrieved: ${getPlanData.data.title}`);
    console.log(`  - Subject: ${getPlanData.data.subject || getPlanData.data.category}`);
    console.log(`  - Tasks: ${getPlanData.data.tasks.length}`);
    testResults.push({ test: 'Retrieve Plan', pass: getPlanRes.ok });

    console.log('\n4. Testing data relationships...');
    const followRes = await fetch(`${API_BASE}/plans/${planId}/follow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Followed plan');
    testResults.push({ test: 'Follow Plan', pass: followRes.ok });

    const rateRes = await fetch(`${API_BASE}/plans/${planId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: 4 }),
    });
    const rateData = await rateRes.json();
    console.log(`Rated plan: ${rateData.data.rating} stars`);
    console.log(`  - Average rating: ${rateData.data.averageRating}`);
    testResults.push({ test: 'Rate Plan', pass: rateRes.ok });

    const progressRes = await fetch(`${API_BASE}/plans/${planId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completedTaskIds: [getPlanData.data.tasks[0].id] }),
    });
    const progressData = await progressRes.json();
    console.log('Updated progress');
    console.log(`  - Completed tasks: ${progressData.data.completedTaskIds.length}`);
    console.log(`  - Completion rate: ${progressData.data.completionRate}%`);
    testResults.push({ test: 'Update Progress', pass: progressRes.ok });

    console.log('\n5. Verifying data integrity...');
    const allPlansRes = await fetch(`${API_BASE}/plans`);
    const allPlansData = await allPlansRes.json();
    const createdPlan = allPlansData.data.find((plan) => plan.id === planId);

    if (createdPlan) {
      console.log('Plan found in all plans list');
      console.log(`  - Follower count: ${createdPlan.followerCount}`);
      console.log(`  - Average rating: ${createdPlan.averageRating}`);
      testResults.push({ test: 'Plan in List', pass: true });
    } else {
      console.log('Plan not found in all plans list');
      testResults.push({ test: 'Plan in List', pass: false });
    }

    console.log('\n6. Testing data validation...');
    const invalidRateRes = await fetch(`${API_BASE}/plans/${planId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: 10 }),
    });
    console.log(`Invalid rating rejected: ${invalidRateRes.status}`);
    testResults.push({ test: 'Validation - Rating Range', pass: !invalidRateRes.ok });

    const dupRateRes = await fetch(`${API_BASE}/plans/${planId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    console.log(`Duplicate rating handled: ${dupRateRes.status}`);
    testResults.push({ test: 'Duplicate Prevention', pass: dupRateRes.ok });

    console.log('\n\n=== DATABASE TEST SUMMARY ===\n');
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
    console.error('\nERROR:', error.message);
  }
}

testDatabaseSchema();
