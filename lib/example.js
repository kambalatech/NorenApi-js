const axios = require('axios');
var sha256 = require("crypto-js/sha256");
/* 
  pwd: '18fcbfe9458001644e773ddee2d0681928673c1315841cfc8572db3f33a62edf', 
*/


 var password = sha256('Test@123').toString();

const data = {
    uid: 'ANNAPPA',    
    pwd: password,
    factor2: '1999',
    vc: 'NOREN_API',
    appkey: '85658ba1e3cdc05314b3c7812c0c2c8380ea0d467cc226f5bc0d4fe5d0973c9b',
    apkversion: '1.0.0',
    source: 'API',
    imei: 'xyz12345'
};

const jData = 'jData=' + JSON.stringify(data);

// Sending post data to API URL
axios.post('http://rama.kambala.co.in:6002/NorenWClient/QuickAuth/', jData)
    .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data);
    }).catch((err) => {
        console.error(err);
    });
