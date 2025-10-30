const fs = require("fs");
const readline = require("readline");
const { spawn } = require("child_process");
const NorenRestApi = require("./lib/RestApi");
const cred = require("./cred");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const api = new NorenRestApi(cred);

// Generate OAuth login URL
const oauthLoginURL = api.getOAuthURL(cred.oauth_url, cred.client_id);
console.log("\nOpening browser for OAuth login...");
console.log("If it doesn't open automatically, visit this URL manually:\n", oauthLoginURL);

spawn("google-chrome", [
  "--disable-crash-reporter",
  "--no-default-browser-check",
  "--no-first-run",
  "--disable-logging",
  oauthLoginURL,
], {
  stdio: "ignore",
  detached: true,
}).unref(); 

// Continue asking for auth code
rl.question("\nEnter your auth code here: ", async (authCode) => {
  try {
    const [accessToken, userId, refreshToken, accountId] = await api.getAccessToken(
      authCode,
      cred.Secret_Code,
      cred.client_id,
      cred.UID
    );

    console.log("\n Authentication Successful!");
    console.log(`\nAccess Token  : ${accessToken}`);
    console.log(`Refresh Token : ${refreshToken}`);
    console.log(`User ID       : ${userId}`);
    console.log(`Account ID    : ${accountId}`);

    // Update cred.js
    const updatedCreds = {
      ...cred,
      Access_token: accessToken,
      Refresh_token: refreshToken,
      Account_ID: accountId,
    };

    fs.writeFileSync(
      "cred.js",
      `module.exports = ${JSON.stringify(updatedCreds, null, 2)};\n`
    );

    console.log("\n Credentials updated in cred.js");
  } catch (err) {
    console.error("\n Error:", err.message || err);
  } finally {
    rl.close();
  }
});
