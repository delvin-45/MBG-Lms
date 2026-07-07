const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 1. Register to get token
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test Upload', email: 'testupload@mbg.com', password: 'password', role: 'teacher' })
    });
    const loginData = await loginRes.json();
    console.log('Register Response:', loginData);
    if (loginData.status !== 'success') return;
    const token = loginData.data.accessToken;

    // 2. Create dummy file
    const dummyPath = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(dummyPath, 'test file content');

    // 3. Test Course Upload
    const formData = new FormData();
    formData.append('title', 'Test Course');
    formData.append('category', 'Tech');
    formData.append('thumbnail', new Blob([fs.readFileSync(dummyPath)]), 'dummy.txt');

    const courseRes = await fetch('http://localhost:5000/api/v1/courses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const courseData = await courseRes.json();
    console.log('Course Upload Response:', courseData);

    // 4. Test Profile Upload
    const profileData = new FormData();
    profileData.append('fullName', 'Test Teacher');
    profileData.append('avatar', new Blob([fs.readFileSync(dummyPath)]), 'dummy.txt');

    const profileRes = await fetch('http://localhost:5000/api/v1/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: profileData
    });
    const profileResData = await profileRes.json();
    console.log('Profile Upload Response:', profileResData);

  } catch (error) {
    console.error('Error:', error);
  }
}

testUpload();
