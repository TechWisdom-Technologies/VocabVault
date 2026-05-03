const http = require('http');

// Configuration - Change this ID to your ID if it's not the one below
const USER_ID = "b8046bf3-ade8-483d-965b-df671a3928e8"; // Mujahid Raj
const PORT = 3000;

const data = JSON.stringify({
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_simulated_" + Date.now(),
      customer: "cus_simulated_dev",
      payment_intent: "pi_simulated_dev",
      client_reference_id: USER_ID,
      metadata: {
        userId: USER_ID
      }
    }
  }
});

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/stripe/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'x-dev-bypass': 'true'
  }
};

console.log(`📡 Sending simulated PRO upgrade for User ID: ${USER_ID}...`);

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log("✅ SUCCESS! Your account has been upgraded to PRO.");
      console.log("👉 Now refresh your browser at http://localhost:3000/dashboard");
    } else {
      console.error(`❌ FAILED with status ${res.statusCode}: ${body}`);
    }
  });
});

req.on('error', (error) => {
  console.error("❌ ERROR connecting to server. Is your dev server running on port 3000?");
  console.error(error.message);
});

req.write(data);
req.end();
