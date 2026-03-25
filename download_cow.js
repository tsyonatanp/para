const https = require('https');
const fs = require('fs');

const req = https.get('https://upload.wikimedia.org/wikipedia/commons/e/ea/Cow_silhouette.svg', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    fs.writeFileSync('cow_real.svg', data);
    console.log('SVG downloaded successfully!');
  });
});
req.on('error', console.error);
