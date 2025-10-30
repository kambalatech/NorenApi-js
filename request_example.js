const Api = require("./lib/RestApi");
const cred = require("./cred");

const api = new Api({});

// Check token & UID
if (!cred.Access_token || !cred.Account_ID) {
  console.error("Access token or UID not found! Run app.js to login first.");
  process.exit(1);
}

// Set token & username for API calls
api.__access_token = cred.Access_token;
api.__username = cred.Account_ID;
api.__accountid = cred.Account_ID;

(async () => {
  try {


    // Get Quotes
    const quoteReply = await api.get_quotes("NSE", "22"); 
    console.log("\nQuotes:", quoteReply);

    // ------------------ OTHER API TESTS ------------------

    // Forgot Password OTP
    // api.forgot_passwordOTP('NANDAN','ABCDE1234N').then((reply) => {
    //   console.log("\nForgot Password OTP:", reply);
    // });


    //Search Scrip
    api.searchscrip('NFO', 'NIFTY DEC CE').then((reply) => {
      console.log("\nSearch Scrip:", reply);
    });

    // Order Book
    // api.get_orderbook().then((reply) => {
    //   console.log("\nOrder Book:", reply);
    // });

    // Trade Book
    // api.get_tradebook().then((reply) => {
    //   console.log("\nTrade Book:", reply);
    // });

    // Holdings
    // api.get_holdings().then((reply) => {
    //   console.log("\nHoldings:", reply);
    // });

    // Positions
    // api.get_positions().then((reply) => {
    //   console.log("\nPositions:", reply);
    // });

    // ------------------ TIME PRICE SERIES ------------------
    // const tpParams = {
    //   exchange: "NSE",
    //   token: "22",
    //   starttime: "1736394345",
    //   endtime: "1737324034",
    //   interval: "5"
    // };
    // api.get_time_price_series(tpParams).then((reply) => {
    //   console.log("\nTime Price Series:", reply);
    // });

  } catch (err) {
    console.error("\nAPI Error:", err.response?.data || err.message || err);
  }
})();
