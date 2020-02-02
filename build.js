const csvParse = require('csv-parse');
const path = require('path');
const fs = require('fs');
const os = require('os');

var rows = [];
fs.writeFileSync('index.csv', 'text,by,ref'+os.EOL);
for(var f of fs.readdirSync('assets')) {
  var p = path.join('assets', f);
  var x = fs.readFileSync(p, 'utf8');
  x = x.substring(x.indexOf(os.EOL)+os.EOL.length);
  fs.appendFileSync('index.csv', x);
}
var stream = fs.createReadStream('index.csv').pipe(csvParse({columns: true, comment: '#'}));
stream.on('error', console.log);
stream.on('data', (r) => {
  r.ref = r.ref? r.ref:null;
  rows.push(r);
});
stream.on('end', () => {
  var z = `const CORPUS = [${os.EOL}`;
  for(var r of rows)
    z += `  ${JSON.stringify(r)},${os.EOL}`;
  z += `];${os.EOL}`;
  z += `module.exports = CORPUS;${os.EOL}`;
  fs.writeFileSync('corpus.js', z);
});
