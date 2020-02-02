const csvParse = require('csv-parse');
const path = require('path');
const fs = require('fs');
const os = require('os');

function mapAppend(m, k, v) {
  var a = m.get(k)||[];
  a.push(v);
  m.set(k, a)
}

var map = new Map();
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
  mapAppend(map, r.by, r);
});
stream.on('end', () => {
  var z = `const CORPUS = new Map([${os.EOL}`;
  for(var [k, v] of map)
    z += `  ["${k}", ${JSON.stringify(v).replace(/\"(\w+)\":/g, '$1:')}],${os.EOL}`;
  z += `]);${os.EOL}`;
  z += `module.exports = CORPUS;${os.EOL}`;
  fs.writeFileSync('corpus.js', z);
});
