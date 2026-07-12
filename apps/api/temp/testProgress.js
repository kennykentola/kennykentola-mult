require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testMeProgressApi() {
  const token = jwt.sign(
    { id: '123', email: 'test@example.com', role: 'Student' },
    process.env.JWT_SECRET || 'secret'
  );

  try {
    const res = await axios.get('http://localhost:5000/api/v1/academy/me/progress', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data);
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
}

testMeProgressApi();
