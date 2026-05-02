const qr = require('qrcode-terminal');
const url = 'exp://172.20.10.4:8084';
qr.generate(url, { small: true });
console.log('\n' + url);
