const WebSocket = require("ws");
let { API } = require("./config");
const cred = require('../cred'); 

let WebSocketClient = function () {
  let self = this;
  let ws = null;
  let timeout = API.heartbeat || 3000;

  // make triggers instance-specific
  let triggers = {
    open: [],
    quote: [],
    order: [],
    error: [],
    close: []
  };

  this.connect = function (params, callbacks) {
    return new Promise((resolve, reject) => {
      if (!cred.client_id || !API.websocket) {
        return reject("Client ID or WebSocket URL is missing");
      }

      // Set callbacks
      this.set_callbacks(callbacks);

      ws = new WebSocket(API.websocket, null, { rejectUnauthorized: false });

      ws.onopen = function () {
        // Heartbeat
        setInterval(() => {
          ws.send(JSON.stringify({ t: "h" }));
        }, timeout);

        // Send authentication payload using OAuth
        let authPayload = {
          t: "a",
          uid: params.uid,
          actid: params.actid,
          accesstoken: params.apikey,
          source: "API"
        };
        console.log("WS Auth Payload:", JSON.stringify(authPayload));
        ws.send(JSON.stringify(authPayload));

        resolve();
      };

      ws.onmessage = function (evt) {
        let result = JSON.parse(evt.data);
        switch (result.t) {
          case "ak":
            trigger("open", [result]);
            break;
          case "tk":
          case "tf":
          case "dk":
          case "df":
            trigger("quote", [result]);
            break;
          case "om":
            trigger("order", [result]);
            break;
        }
      };

      ws.onerror = function (evt) {
        console.error("WS Error:", evt);
        trigger("error", [JSON.stringify(evt)]);

        // retry connection after 2 seconds
        setTimeout(() => {
          self.connect(params, callbacks).catch(err => console.error("Reconnect failed:", err));
        }, 2000);

        reject(evt);
      };

      ws.onclose = function (evt) {
        console.log("WS Closed");
        trigger("close", [JSON.stringify(evt)]);
      };
    });
  };

  this.set_callbacks = function (callbacks) {
    if (callbacks.socket_open) this.on("open", callbacks.socket_open);
    if (callbacks.socket_close) this.on("close", callbacks.socket_close);
    if (callbacks.socket_error) this.on("error", callbacks.socket_error);
    if (callbacks.quote) this.on("quote", callbacks.quote);
    if (callbacks.order) this.on("order", callbacks.order);
  };

  this.send = function (data) {
    ws.send(data);
  };

  this.on = function (event, callback) {
    if (triggers[event]) triggers[event].push(callback);
  };

  this.close = function () {
    ws.close();
  };

  function trigger(event, args) {
    if (!triggers[event]) return;
    for (let i = 0; i < triggers[event].length; i++) {
      triggers[event][i].apply(triggers[event][i], args ? args : []);
    }
  }
};

module.exports = WebSocketClient;
