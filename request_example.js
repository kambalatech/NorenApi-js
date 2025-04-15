const Api = require("./lib/RestApi");

let { authparams } = require("./cred");

api = new Api({});


api.login(authparams)
.then((res) => {        
        console.log('Reply: ', res);

        if(res.stat !== 'Ok')
            return;
        //timeprice 
        let params = {
            'exchange'  : 'NSE',
            'token'     :  '22',
            'starttime' :  '1736394345',           
            'interval'  : '5',
            'endtime':"1737324034",
            'tsym':'ACC-EQ'
            
        };
        api.get_time_price_series(params).then((reply) => { console.log(reply); });

        api.get_daily_price_series(params).then((reply) => { console.log(reply); });

    //    api.forgot_passwordOTP('NIKHESHP','AAAAA1234A').then((reply) => { console.log(reply); });
    //    return;

    //     // search scrip example
    //    api.searchscrip('NFO', 'NIFTY DEC CE').then((reply) => { console.log(reply); });
        
    //     // get quote example
    //    api.get_quotes('NSE', '22').then((reply) => { console.log(reply); });

    //    api.get_orderbook().then((reply) => { console.log(reply); });

    //    api.get_tradebook().then((reply) => { console.log(reply); });

    //    api.get_holdings().then((reply) => { console.log(reply); });
        
    //    api.get_positions().then((reply) => { console.log(reply); });
        
        
    }).catch((err) => {
        console.error(err);
    });

