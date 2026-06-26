const check = async (url) => {
  try {
    console.log('Checking', url);
    const start = Date.now();
    const res = await fetch(url);
    console.log(url, 'Status:', res.status, 'Time:', Date.now() - start, 'ms');
  } catch (err) {
    console.error(url, 'Error:', err.message);
  }
}

async function run() {
  await check('https://fra.cloud.appwrite.io/v1/health');
  await check('https://cloud.appwrite.io/v1/health');
  process.exit(0);
}
run();
