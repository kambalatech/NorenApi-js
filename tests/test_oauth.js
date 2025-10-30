const fs = require('fs');
const path = require('path');
const NorenRestApi = require('../lib/RestApi');
const readline = require('readline');
const { spawn } = require('child_process'); 

// ------------------ LOAD CREDENTIALS ------------------
const credPath = path.join(__dirname, '..', 'cred.js');
delete require.cache[require.resolve(credPath)];
const cred = require(credPath);

// ------------------ INITIALIZE OAUTH ------------------
const oauth = new NorenRestApi({ Access_token: cred.Access_token });

// Generate OAuth login URL
const oauthURL = oauth.getOAuthURL(cred.oauth_url, cred.client_id);
console.log("\nOpening Chrome for OAuth login...");
console.log("If it doesn't open automatically, visit this URL manually:\n", oauthURL);

// Automatically open User Browser for login
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

// ------------------ READ AUTH CODE ------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nEnter your auth code: ', async (code) => {
  try {
    // Get access token
    const [accessToken, userId, refreshToken, accountId] = await oauth.getAccessToken(
      code,
      cred.Secret_Code,
      cred.client_id,
      cred.UID
    );

    console.log("\n Authentication Successful!");
    console.log(` User ID:        ${userId}`);
    console.log(` Account ID:     ${accountId}`);
    console.log(` Access Token:   ${accessToken}`);
    console.log(`  Refresh Token:  ${refreshToken}`);

    // ------------------ UPDATE CREDENTIALS ------------------
    let currentCreds = {};
    try {
      delete require.cache[require.resolve(credPath)];
      currentCreds = require(credPath);
    } catch {
      currentCreds = {
        client_id: cred.client_id,
        Secret_Code: cred.Secret_Code,
        UID: cred.UID,
        Access_token: "",
        Account_ID: ""
      };
    }

    currentCreds.Access_token = accessToken;
    currentCreds.Account_ID = accountId;
    currentCreds.Refresh_token = refreshToken;

    fs.writeFileSync(credPath, `module.exports = ${JSON.stringify(currentCreds, null, 2)};\n`);

    oauth.__access_token = accessToken;

    // ------------------ PLACE ORDER TEST ------------------
    const orderParams = {
      buy_or_sell: 'B',
      product_type: 'C',
      exchange: 'NSE',
      tradingsymbol: 'TCS-EQ',
      quantity: 1,
      discloseqty: 0,
      price_type: 'LMT',
      price: 175.0,
      uid: userId,
      actid: accountId
    };

    try {
      const reply = await oauth.place_order(orderParams);
      console.log("\n Place Order Reply:", reply);
    } catch (orderError) {
      console.error("\n Place Order Error:", orderError.message || orderError);
    }

  } catch (error) {
    console.error(`\n Authentication failed: ${error.message || error}`);
  } finally {
    rl.close();
  }
});
