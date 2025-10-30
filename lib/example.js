const axios = require('axios');
const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const cred = require('../cred'); 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ------------------ GENERATE OAUTH URL ------------------
const oauthURL = `${cred.oauth_url}?client_id=${cred.client_id}`;

console.log("\nOpening Chrome for OAuth login...");
console.log("If it doesn't open automatically, visit this URL manually:\n", oauthURL);

//  Automatically open Browser
spawn("google-chrome", [
  "--disable-crash-reporter",
  "--no-default-browser-check",
  "--no-first-run",
  "--disable-logging",
  oauthURL,
], {
  stdio: "ignore",
  detached: true,
}).unref();

// ------------------ ASK FOR AUTH CODE ------------------
rl.question("\nEnter your auth code here: ", async (authCode) => {
  try {
    // Generate checksum
    const dataToHash = cred.client_id + cred.Secret_Code + authCode;
    const checksum = crypto.createHash('sha256').update(dataToHash, 'utf-8').digest('hex');

    // Prepare payload
    const payload = 'jData=' + JSON.stringify({
      code: authCode,
      checksum: checksum,
      uid: cred.UID
    });

    // Post to GenAcsTok endpoint
    const url = 'http://rama.kambala.co.in:6008/NorenWClient/GenAcsTok';
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // Print status and body
    console.log('\nStatus:', response.status);
    console.log('Body:', response.data);

    // ------------------ UPDATE CRED FILE ------------------
    if (response.data && response.data.access_token) {
      const updatedCred = {
        ...cred,
        Access_token: response.data.access_token,
        Account_ID: response.data.actid,
        Refresh_token: response.data.refresh_token
      };

      const credPath = path.join(__dirname, '..', 'cred.js');
      fs.writeFileSync(credPath, `module.exports = ${JSON.stringify(updatedCred, null, 2)};\n`);

      console.log("\n cred.js updated successfully!");
    } else {
      console.log("\n No access token found in response. cred.js not updated.");
    }

  } catch (err) {
    console.error('\nError:', err.response?.data || err.message || err);
  } finally {
    rl.close();
  }
});
