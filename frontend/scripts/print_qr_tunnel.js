const qr = require('qrcode-terminal');
const url = 'exp://4jwdacw-anonymous-8083.exp.direct';
qr.generate(url, { small: true });
console.log('\n' + url);
