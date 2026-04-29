async function testAPI() {
  const baseURL = 'http://localhost:5174/api';
  const email = `test-${Date.now()}@example.com`;

  try {
    console.log('Testing Register...');
    const registerRes = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password: 'password123',
      }),
    });
    console.log('Register status:', registerRes.status);
    console.log('Register response:', await registerRes.json());

    console.log('Testing Login...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
      }),
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);

    if (!loginData.data?.accessToken) {
      return;
    }

    const token = loginData.data.accessToken;

    console.log('Testing Get User Profile...');
    const profileRes = await fetch(`${baseURL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Profile status:', profileRes.status);
    console.log('Profile response:', await profileRes.json());

    console.log('Testing Create Plan...');
    const createPlanRes = await fetch(`${baseURL}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Test Plan',
        description: 'A test study plan',
        subject: 'Math',
        durationDays: 7,
        tasks: [{ day: 1, title: 'Task 1', description: 'Do something' }],
      }),
    });
    console.log('Create Plan status:', createPlanRes.status);
    const createPlanData = await createPlanRes.json();
    console.log('Create Plan response:', createPlanData);

    if (!createPlanData.data?.id) {
      return;
    }

    const planId = createPlanData.data.id;

    console.log('Testing Get Plans...');
    const getPlansRes = await fetch(`${baseURL}/plans`);
    console.log('Get Plans status:', getPlansRes.status);
    console.log('Get Plans response:', await getPlansRes.json());

    console.log('Testing Get Single Plan...');
    const getPlanRes = await fetch(`${baseURL}/plans/${planId}`);
    console.log('Get Plan status:', getPlanRes.status);
    const getPlanData = await getPlanRes.json();
    console.log('Get Plan response:', getPlanData);

    console.log('Testing Follow Plan...');
    const followRes = await fetch(`${baseURL}/plans/${planId}/follow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Follow status:', followRes.status);
    console.log('Follow response:', await followRes.json());

    console.log('Testing Update Progress...');
    const progressRes = await fetch(`${baseURL}/plans/${planId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        completedTaskIds: [getPlanData.data.tasks[0].id],
      }),
    });
    console.log('Progress status:', progressRes.status);
    console.log('Progress response:', await progressRes.json());

    console.log('Testing Rate Plan...');
    const rateRes = await fetch(`${baseURL}/plans/${planId}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    console.log('Rate status:', rateRes.status);
    console.log('Rate response:', await rateRes.json());

    console.log('Testing Update Plan...');
    const updateRes = await fetch(`${baseURL}/plans/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Updated Test Plan' }),
    });
    console.log('Update status:', updateRes.status);
    console.log('Update response:', await updateRes.json());

    console.log('Testing Delete Plan...');
    const deleteRes = await fetch(`${baseURL}/plans/${planId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Delete status:', deleteRes.status);
    console.log(
      'Delete response:',
      deleteRes.status === 204 ? { success: true } : await deleteRes.json(),
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
