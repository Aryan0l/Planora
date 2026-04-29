async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAPI() {
  const baseURL = 'http://localhost:5174/api';
  const email = `test-${Date.now()}@example.com`;
  const testResults = [];

  try {
    console.log('\n=== AUTH TESTS ===\n');

    console.log('1. Testing Register...');
    const registerRes = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'password123',
      }),
    });
    console.log('Status:', registerRes.status);
    const registerData = await registerRes.json();
    console.log('Response:', JSON.stringify(registerData, null, 2));
    testResults.push({ test: 'Register', status: registerRes.status, pass: registerRes.status === 201 });

    if (registerRes.status !== 201) {
      console.log('REGISTER FAILED - STOPPING TESTS');
      return;
    }

    console.log('\n2. Testing Login...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
      }),
    });
    console.log('Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Response:', JSON.stringify(loginData, null, 2));
    testResults.push({ test: 'Login', status: loginRes.status, pass: loginRes.status === 200 });

    if (loginRes.status !== 200 || !loginData.data?.accessToken) {
      console.log('LOGIN FAILED - STOPPING TESTS');
      return;
    }

    const token = loginData.data.accessToken;
    console.log('\nToken obtained');

    console.log('\n=== USER TESTS ===\n');
    console.log('3. Testing Get User Profile...');
    const profileRes = await fetch(`${baseURL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Status:', profileRes.status);
    const profileData = await profileRes.json();
    console.log('Response:', JSON.stringify(profileData, null, 2));
    testResults.push({ test: 'Get Profile', status: profileRes.status, pass: profileRes.status === 200 });

    console.log('\n=== PLAN TESTS ===\n');
    console.log('4. Testing Create Plan...');
    const createPlanRes = await fetch(`${baseURL}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Test Study Plan',
        description: 'A comprehensive test study plan',
        subject: 'Mathematics',
        durationDays: 7,
        tasks: [
          { day: 1, title: 'Algebra Basics', description: 'Learn algebra fundamentals' },
          { day: 2, title: 'Geometry', description: 'Learn geometry concepts' },
        ],
      }),
    });
    console.log('Status:', createPlanRes.status);
    const createPlanData = await createPlanRes.json();
    console.log('Response:', JSON.stringify(createPlanData, null, 2));
    testResults.push({ test: 'Create Plan', status: createPlanRes.status, pass: createPlanRes.status === 201 });

    if (createPlanRes.status !== 201 || !createPlanData.data?.id) {
      console.log('CREATE PLAN FAILED - CONTINUING WITH OTHER TESTS');
    } else {
      const planId = createPlanData.data.id;
      console.log('\nPlan created with ID:', planId);

      await sleep(1000);

      console.log('\n5. Testing Get All Plans...');
      const getPlansRes = await fetch(`${baseURL}/plans`);
      console.log('Status:', getPlansRes.status);
      const getPlansData = await getPlansRes.json();
      console.log('Response:', JSON.stringify(getPlansData, null, 2).substring(0, 200) + '...');
      testResults.push({ test: 'Get All Plans', status: getPlansRes.status, pass: getPlansRes.status === 200 });

      console.log('\n6. Testing Get Single Plan...');
      const getPlanRes = await fetch(`${baseURL}/plans/${planId}`);
      console.log('Status:', getPlanRes.status);
      const getPlanData = await getPlanRes.json();
      console.log('Response:', JSON.stringify(getPlanData, null, 2).substring(0, 200) + '...');
      testResults.push({ test: 'Get Single Plan', status: getPlanRes.status, pass: getPlanRes.status === 200 });

      await sleep(1000);

      console.log('\n7. Testing Follow Plan...');
      const followRes = await fetch(`${baseURL}/plans/${planId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Status:', followRes.status);
      const followData = await followRes.json();
      console.log('Response:', JSON.stringify(followData, null, 2));
      testResults.push({ test: 'Follow Plan', status: followRes.status, pass: followRes.status === 200 || followRes.status === 201 });

      await sleep(1000);

      console.log('\n8. Testing Update Progress...');
      const progressRes = await fetch(`${baseURL}/plans/${planId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedTaskIds: [getPlanData.data.tasks[0].id] }),
      });
      console.log('Status:', progressRes.status);
      const progressData = await progressRes.json();
      console.log('Response:', JSON.stringify(progressData, null, 2));
      testResults.push({ test: 'Update Progress', status: progressRes.status, pass: progressRes.status === 200 || progressRes.status === 201 });

      await sleep(1000);

      console.log('\n9. Testing Rate Plan...');
      const rateRes = await fetch(`${baseURL}/plans/${planId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5 }),
      });
      console.log('Status:', rateRes.status);
      const rateData = await rateRes.json();
      console.log('Response:', JSON.stringify(rateData, null, 2));
      testResults.push({ test: 'Rate Plan', status: rateRes.status, pass: rateRes.status === 200 || rateRes.status === 201 });

      await sleep(1000);

      console.log('\n10. Testing Update Plan...');
      const updateRes = await fetch(`${baseURL}/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'Updated Test Study Plan' }),
      });
      console.log('Status:', updateRes.status);
      const updateData = await updateRes.json();
      console.log('Response:', JSON.stringify(updateData, null, 2).substring(0, 200) + '...');
      testResults.push({ test: 'Update Plan', status: updateRes.status, pass: updateRes.status === 200 });

      await sleep(1000);

      console.log('\n11. Testing Delete Plan...');
      const deleteRes = await fetch(`${baseURL}/plans/${planId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Status:', deleteRes.status);
      const deleteData = deleteRes.status === 204 ? { success: true } : await deleteRes.json();
      console.log('Response:', JSON.stringify(deleteData, null, 2));
      testResults.push({ test: 'Delete Plan', status: deleteRes.status, pass: deleteRes.status === 200 || deleteRes.status === 204 });
    }

    console.log('\n\n=== TEST SUMMARY ===\n');
    let passCount = 0;
    let failCount = 0;
    testResults.forEach((result) => {
      const status = result.pass ? 'PASS' : 'FAIL';
      console.log(`${status}: ${result.test} (${result.status})`);
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

testAPI();
