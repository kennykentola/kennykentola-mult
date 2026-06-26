const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  // Fetch a sample image
  const imageRes = await fetch('https://res.cloudinary.com/demo/image/upload/sample.jpg');
  const blob = await imageRes.blob();
  formData.append('file', blob, 'sample.jpg');
  formData.append('upload_preset', 'ml_default');

  console.log("Testing upload with preset ml_default...");
  const res = await fetch(`https://api.cloudinary.com/v1_1/dlf0th3fx/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

testUpload().catch(console.error);
