"use strict";

const axios = require("axios");
const crypto = require("crypto");
var sha256 = require("crypto-js/sha256");

let { API } = require("./config");
const WS = require("./WebSocket");
const cred = require("../cred"); 


var NorenRestApi = function (params = {}) {
  var self = this;
  self.__susertoken = "";
  self.__access_token = params.Access_token || "";
  self.__username = params.UID || "";  
  self.__accountid = params.AID || ""; 

  var endpoint = API.endpoint;
  var debug = API.debug;
  var oauth_url = cred.oauth_url;

  var routes = {
    //authorize: "/QuickAuth",
    logout: "/Logout",
    forgot_password: "/ForgotPassword",
    watchlist_names: "/MWList",
    watchlist: "/MarketWatch",
    watchlist_add: "/AddMultiScripsToMW",
    watchlist_delete: "/DeleteMultiMWScrips",
    placeorder: "/PlaceOrder",
    modifyorder: "/ModifyOrder",
    cancelorder: "/CancelOrder",
    exitorder: "/ExitSNOOrder",
    orderbook: "/OrderBook",
    tradebook: "/TradeBook",
    singleorderhistory: "/SingleOrdHist",
    searchscrip: "/SearchScrip",
    TPSeries: "/TPSeries",
    optionchain: "/GetOptionChain",
    holdings: "/Holdings",
    limits: "/Limits",
    positions: "/PositionBook",
    scripinfo: "/GetSecurityInfo",
    getquotes: "/GetQuotes",
    fgtPwdOTP: "/FgtPwdOTP",
    EODChartData: "/EODChartData",
    gen_acs_tok: "/GenAcsTok",
  };

function post_request(route, params, headers = null) {
    const url = endpoint + routes[route];

     const payload = "jData=" + JSON.stringify(params);

    const finalHeaders = headers || {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${self.__access_token}`
    };


    if (debug) {
      console.log("\n===== POST REQUEST =====");
      console.log("Route:", route);
      console.log("URL:", url);
      console.log("Params:", params);
      console.log("Payload (encoded):", payload);
      console.log("Headers:", finalHeaders);
    }

    return axios.post(url, payload, {
        headers: finalHeaders,
        transformRequest: [(data) => data]
    })
    .then((response) => {
      if (debug) {
        console.log("===== RESPONSE =====");
        console.log("Route:", route);
        console.log("Response data:", response.data);
      }
      return response.data;
    })
    .catch((error) => {
      console.error("===== REQUEST ERROR =====");
      console.error("Route:", route);
      console.error("Error message:", error.message);
      console.error("Response:", error.response?.data || "No response");
      return Promise.reject(error);
    });
}

// ##################### OAuth CHANGES #####################

self.getOAuthURL = function (oauth_url, client_id) {
  if (debug) console.log("OAuth URL:", `${oauth_url}?client_id=${client_id}`);
  return `${oauth_url}?client_id=${client_id}`;
};

self.getAccessToken = function (authcode, secretCode, appKey, uid) {
  const genAcsTokUrl = `${endpoint}${routes["gen_acs_tok"]}`;

  // SHA256 hash of APP_KEY + SECRET_CODE + authcode
  const dataToHash = appKey + secretCode + authcode;
  const checksum = crypto.createHash("sha256").update(dataToHash, "utf-8").digest("hex");

  const values = {
    code: authcode,
    checksum: checksum,
    uid: uid
  };

  const payload = "jData=" + JSON.stringify(values);

  if (debug) {
    console.log("\n===== GET ACCESS TOKEN =====");
    console.log("Payload:", payload);
    console.log("URL:", genAcsTokUrl);
    console.log("Data to hash:", dataToHash);
    console.log("Checksum:", checksum);
    console.log("Client ID (client_id):", appKey);
    console.log("Secret Code (Secret_Code):", secretKey);
    console.log("Code:", authcode);
    console.log("UID:", uid);
  }

  return axios
    .post(genAcsTokUrl, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then((response) => {
      const res = response?.data || response;

      if (debug) {
        console.log("\n===== ACCESS TOKEN RESPONSE =====");
        console.log(res);
      }

      if (res && res.access_token) {
        self.__access_token = res.access_token;
        self.__username = res.USERID;
        self.__accountid = res.actid;
        self.__susertoken = res.susertoken;

        const injectedHeaders = self.injectOAuthHeader(res.access_token);

        return [res.access_token, res.USERID, res.refresh_token, res.actid, injectedHeaders];
      } else {
        throw new Error("access_token not found in response");
      }
    })
    .catch((error) => {
      const errorObj = {
        message: error.message || "Unknown error",
        status: error.response?.status || 500,
        data: error.response?.data || null
      };

      console.error("===== ACCESS TOKEN ERROR =====");
      console.error(errorObj);

      return Promise.reject(errorObj);
    });
};

self.injectOAuthHeader = function (accessToken, UID, AID) {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json; charset=utf-8"
  };
  self.__access_token = accessToken;
  self.__username = UID || self.__username;
  self.__accountid = AID || self.__accountid;

  if (debug) {
    console.log("\n===== INJECT OAUTH HEADER =====");
    console.log("Access Token:", accessToken);
    console.log("UID:", self.__username);
    console.log("AID:", self.__accountid);
    console.log("Headers:", headers);
  }

  return headers;
};

//############OAUTH CHANGES####################

  self.setSessionDetails = function (response) {
    self.__susertoken = response.susertoken;
    self.__username = response.actid;
    self.__accountid = response.actid;
  };

  //   /**
  //    * Description
  //    * @method login
  //    * @param {string} userid
  //    * @param {string} password
  //    * @param {string} twoFA
  //    * @param {string} vendor_code
  //    * @param {string} api_secret
  //    * @param {string} imei
  //    */

  //   self.login = function(params) {
  //     let pwd = sha256(params.password).toString();
  //     let u_app_key = `${params.userid}|${params.api_secret}`;
  //     let app_key = sha256(u_app_key).toString();

  //     let authparams = {
  //       "source": "API",
  //       "apkversion": "js:1.0.0",
  //       "uid": params.userid,
  //       "pwd": pwd,
  //       "factor2": params.twoFA,
  //       "vc": params.vendor_code,
  //       "appkey": app_key,
  //       "imei": params.imei
  //     };

  //     console.log(authparams);
  //     let auth_data = post_request("authorize", authparams);

  //     auth_data.then(response => {
  //       if (response.stat == 'Ok') {
  //         self.setSessionDetails(response);
  //       }
  //     }).catch(function(err) {
  //       throw err;
  //     });

  //     return auth_data;
  //   };



  /**
   * Description
   * @method searchscrip
   * @param {string} exchange
   * @param {string} searchtext
   */

  self.searchscrip = function (exchange, searchtext) {
    let values = {};
    values["uid"] = self.__username;
    values["exch"] = exchange;
    values["stext"] = searchtext;

    // let reply = post_request("searchscrip", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    let reply = post_request("searchscrip", values, headers);


    reply
      .then((response) => {
        if (response.stat == "Ok") {
        }
      })
      .catch(function (err) {
        throw err;
      });

    return reply;
  };



  /**
   * Description
   * @method forgot_passwordOTP
   * @param {string} userid
   * @param {string} pan
   */

  self.forgot_passwordOTP = function (userid, pan) {
    let values = {};
    values["uid"] = userid;
    values["pan"] = pan;

    // let reply = post_request("fgtPwdOTP", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    let reply = post_request("fgtPwdOTP", values, headers);


    reply
      .then((response) => {
        if (response.stat == "Ok") {
        }
      })
      .catch(function (err) {
        throw err;
      });

    return reply;
  };



  /**
   * Description
   * @method get_quotes
   * @param {string} exchange
   * @param {string} token
   */

  self.get_quotes = function (exchange, token) {
    let values = {};
    values["uid"] = self.__username;
    values["exch"] = exchange;
    values["token"] = token;

    // let reply = post_request("getquotes", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("getquotes", values, headers);
  };



  /**
   * Description
   * @method get_time_price_series
   * @param {string} exchange
   * @param {string} token
   * @param {string} starttime
   * @param {string} endtime
   * @param {string} interval
   */

  self.get_time_price_series = function (params) {
    let values = {};
    values["uid"] = self.__username;
    values["exch"] = params.exchange;
    values["token"] = params.token;
    values["st"] = params.starttime;
    if (params.endtime !== undefined) values["et"] = params.endtime;
    if (params.interval !== undefined) values["intrv"] = params.interval;

    // let reply = post_request("TPSeries", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    let reply = post_request("TPSeries", values, headers);

    return reply;
  };


  /**
   * Description
   * @method place_order
   * @param {string} buy_or_sell
   * @param {string} product_type
   */
  self.place_order = function (order) {
    let values = { ordersource: "API" };
    values["uid"] = self.__username;
    values["actid"] = self.__accountid;
    values["trantype"] = order.buy_or_sell;
    values["prd"] = order.product_type;
    values["exch"] = order.exchange;
    values["tsym"] = order.tradingsymbol;
    values["qty"] = order.quantity.toString();
    values["dscqty"] = order.discloseqty.toString();
    values["prctyp"] = order.price_type;
    values["prc"] = order.price.toString();
    values["remarks"] = order.remarks;

    if (order.amo !== undefined) values["ret"] = order.retention;
    else values["ret"] = "DAY";

    if (order.trigger_price !== undefined)
      values["trgprc"] = order.trigger_price.toString();

    if (order.amo !== undefined) values["amo"] = order.amo;

    //if cover order or high leverage order
    if (order.product_type == "H") {
      values["blprc"] = order.bookloss_price.toString();
      //trailing price
      if (order.trail_price != 0.0) {
        values["trailprc"] = order.trail_price.toString();
      }
    }
    //bracket order
    if (order.product_type == "B") {
      values["blprc"] = order.bookloss_price.toString();
      values["bpprc"] = order.bookprofit_price.toString();
      //trailing price
      if (order.trail_price != 0.0) {
        values["trailprc"] = order.trail_price.toString();
      }
    }

    //  let reply = post_request("placeorder", values);
    //  return reply;

    // **Use injected OAuth headers**
      const headers = self.injectOAuthHeader(self.__access_token);
      return post_request("placeorder", values, headers);
  };


  /**
   * Description
   * @method modify_order
   * @param {string} orderno
   * @param {string} exchange
   * @param {string} tradingsymbol
   * @param {integer} newquantity
   * @param {string} newprice_type
   * @param {integer} newprice
   * @param {integer} newtrigger_price
   * @param {integer} bookloss_price
   * @param {integer} bookprofit_price
   * @param {integer} trail_price
   */

  self.modify_order = function (modifyparams) {
    let values = { ordersource: "API" };
    values["uid"] = self.__username;
    values["actid"] = self.__accountid;
    values["norenordno"] = modifyparams.orderno;
    values["exch"] = modifyparams.exchange;
    values["tsym"] = modifyparams.tradingsymbol;
    values["qty"] = modifyparams.newquantity.toString();
    values["prctyp"] = modifyparams.newprice_type;
    values["prc"] = modifyparams.newprice.toString();

    if (
      modifyparams.newprice_type == "SL-LMT" ||
      modifyparams.newprice_type == "SL-MKT"
    ) {
      values["trgprc"] = modifyparams.newtrigger_price.toString();
    }

    //#if cover order or high leverage order
    if (modifyparams.bookloss_price !== undefined) {
      values["blprc"] = modifyparams.bookloss_price.toString();
    }
    //#trailing price
    if (modifyparams.trail_price !== undefined) {
      values["trailprc"] = modifyparams.trail_price.toString();
    }
    //#book profit of bracket order
    if (modifyparams.bookprofit_price !== undefined) {
      values["bpprc"] = modifyparams.bookprofit_price.toString();
    }

    // let reply = post_request("modifyorder", values, self.__susertoken);
    // return reply;

    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("modifyorder", values, headers);
  };


  /**
   * Description
   * @method cancel_order
   * @param {string} orderno
   */

  self.cancel_order = function (orderno) {
    let values = { ordersource: "API" };
    values["uid"] = self.__username;
    values["norenordno"] = orderno;

    // let reply = post_request("cancelorder", values, self.__susertoken);
    // return reply;

      const headers = self.injectOAuthHeader(self.__access_token);
      return post_request("cancelorder", values, headers);
  };
  

  /**
   * Description
   * @method exit_order
   * @param {string} orderno
   * @param {string} product_type
   */

  self.exit_order = function (orderno, product_type) {
    let values = {};
    values["uid"] = self.__username;
    values["norenordno"] = orderno;
    values["prd"] = product_type;

    // let reply = post_request("exitorder", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("exitorder", values, headers);
  };


  /**
   * Description
   * @method get_orderbook
   * @param no params
   */

  self.get_orderbook = function () {
    let values = {};
    values["uid"] = self.__username;

    // let reply = post_request("orderbook", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("orderbook", values, headers);
  };


  /**
   * Description
   * @method get_tradebook
   * @param no params
   */

  self.get_tradebook = function () {
    let values = {};
    values["uid"] = self.__username;
    values["actid"] = self.__accountid;

  // let reply = post_request("tradebook", values, self.__susertoken); 
  // return reply;
  
  const headers = self.injectOAuthHeader(self.__access_token);
  return post_request("tradebook", values, headers);

  };



  /**
   * Description
   * @method get_holdings
   * @param product_type
   */

  self.get_holdings = function (product_type = "C") {
    let values = {};
    values["uid"] = self.__username;
    values["actid"] = self.__accountid;
    values["prd"] = product_type;

    // let reply = post_request("holdings", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("holdings", values, headers);
  };



  /**
   * Description
   * @method get_positions
   * @param no params
   */

  self.get_positions = function () {
    let values = {};
    values["uid"] = self.__username;
    values["actid"] = self.__accountid;

    // let reply = post_request("positions", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("positions", values, headers);
  };



  /**
   * Description
   * @method get_watch_list_names
   * @returns list of all watchlist names
   */

  self.get_watch_list_names = function () {
    let values = { ordersource: "API" };
    values["uid"] = self.__username;

    // let reply = post_request("watchlist_names", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("watchlist_names", values, headers);
  };



  /**
   * Description
   * @method get_watch_list
   * @param {string} wlname - name of the watchlist
   * @returns items inside the watchlist
   */

  self.get_watch_list = function (wlname) {
    let values = { ordersource: "API" };
    values["uid"] = self.__username;
    values["wlname"] = wlname;

    // let reply = post_request("watchlist", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("watchlist", values, headers);
  };



  /**
   * Description
   * @method get_limits
   * @param optional params
   */

  self.get_limits = function (product_type = "", segment = "", exchange = "") {
    let values = {};
    values["uid"] = self.__username;
    values["actid"] = self.__accountid;

    if (product_type != "") values["prd"] = product_type;

    if (product_type != "") values["seg"] = segment;

    if (exchange != "") values["exch"] = exchange;

    // let reply = post_request("limits", values, self.__susertoken);
    // return reply;

    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("limits", values, headers);
  };



  /**
   * Description
   * @method get_daily_price_series
   * @param {string} exchange
   * @param {string} tsym
   * @param {string} starttime
   * @param {string} endtime
   */

  self.get_daily_price_series = function (params) {
    let values = {};
    values["uid"] = self.__username;
    values["sym"] = `${params.exchange} : ${params.tsym}`;
    values["st"] = params.starttime;
    if (params.endtime !== undefined) values["et"] = params.endtime;

    // let reply = post_request("EODChartData", values, self.__susertoken);
    const headers = self.injectOAuthHeader(self.__access_token);
    return post_request("EODChartData", values, headers);
  };



  /**
   * Description
   * @method start_websocket
   * @param no params
   */


  self.start_websocket = function (callbacks) {
    let web_socket = new WS({ url: API.websocket});

    self.web_socket = web_socket;

    let params = {
      uid: self.__username,        // from getAccessToken()
      actid: self.__accountid,     // from getAccessToken()
      apikey: self.__access_token  // OAuth access token
    };

     web_socket.connect(params, callbacks)
    .then(() => {
      console.log("WebSocket is connected");
    })
    .catch(err => {
      console.error("WebSocket connection error:", err);
    });
  };

  self.subscribe = function (instrument, feedtype) {
    let values = {};
    values["t"] = "t";
    values["k"] = instrument;
    self.web_socket.send(JSON.stringify(values));
  };
};



module.exports = NorenRestApi;
