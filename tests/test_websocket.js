const WebSocketClient = require("../lib/WebSocket");
const cred = require("../cred"); 

const wsClient = new WebSocketClient();

wsClient.connect(
  {
    apikey: cred.Access_token,
    uid: cred.UID,
    actid: cred.Account_ID
  },
  {
    socket_open: () => console.log("WebSocket connected!"),
    quote: (data) => console.log("Quote received:", data),
    order: (data) => console.log("Order received:", data),
    socket_close: () => console.log("WebSocket closed"),
    socket_error: (err) => console.log("WebSocket error:", err)
  }
).then(() => {
  console.log("WebSocket connect promise resolved");
}).catch(err => console.error("WebSocket failed:", err));
