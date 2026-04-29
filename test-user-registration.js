async function testUserRegistrationAndLogin() {
  const API_BASE = 'http://localhost:5174/api';
  const timestamp = Date.now();
  const credentials = {
    name: 'Integration Test User',
    email: `integration-user-${timestamp}@example.com`,
    password: `SafePass!${timestamp}`,
  };

  console.log('\n' + '='.repeat(60));
  console.log('USER REGISTRATION & LOGIN TEST');
  console.log('='.repeat(60) + '\n');

  try {
    console.log('Step 1: REGISTRATION');
    console.log('-'.repeat(60));
    console.log(`Name:     ${credentials.name}`);
    console.log(`Email:    ${credentials.email}`);
    console.log(`Password: ${credentials.password}`);
    console.log('');

    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const registerData = await registerRes.json();

    if (registerRes.status === 201) {
      console.log('REGISTRATION SUCCESSFUL');
      console.log(JSON.stringify(registerData.data, null, 2));
      const userId = registerData.data.id;

      console.log('\n' + '='.repeat(60));
      console.log('Step 2: LOGIN');
      console.log('-'.repeat(60));

      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.status === 200) {
        console.log('LOGIN SUCCESSFUL');
        console.log(JSON.stringify(loginData.data, null, 2));

        const accessToken = loginData.data.accessToken;

        console.log('\n' + '='.repeat(60));
        console.log('Step 3: VERIFY PROTECTED ROUTE');
        console.log('-'.repeat(60));

        const profileRes = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const profileData = await profileRes.json();

        if (profileRes.status === 200) {
          console.log('PROTECTED ROUTE ACCESSIBLE');
          console.log(JSON.stringify(profileData.data, null, 2));

          console.log('\n' + '='.repeat(60));
          console.log('ALL TESTS PASSED');
          console.log('='.repeat(60));
          console.log(`\nRegistration: SUCCESS (User ID: ${userId})`);
          console.log('Login: SUCCESS');
          console.log('Access Control: SUCCESS');
        } else {
          console.log('PROTECTED ROUTE FAILED');
          console.log('Status:', profileRes.status);
          console.log('Response:', profileData);
        }
      } else {
        console.log('LOGIN FAILED');
        console.log('Status:', loginRes.status);
        console.log('Response:', loginData);
      }
    } else {
      console.log('REGISTRATION FAILED');
      console.log('Status:', registerRes.status);
      console.log('Response:', registerData);
    }
  } catch (error) {
    console.error('\nERROR:', error.message);
  }
}

testUserRegistrationAndLogin();
