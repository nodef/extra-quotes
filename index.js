const https = require('https');

const WIKIQUOTE = 'https://en.wikiquote.org/w/api.php?action=opensearch&format=json&formatversion=2&search=';
const WIKIQUOTEOPT = {};



// Get text response (body) from URL.
function getBodyCb(url, opt, fn) {
  var req = https.request(url, opt||{}, res => {
    var code = res.statusCode, body = '';
    if(code>=400) { res.resume(); return fn(new Error(`Request to ${url} returned ${code}`)); }
    if(code>=300 && code<400) return getBody(res.headers.location, opt, fn);
    res.on('error', fn);
    res.on('data', b => body+=b);
    res.on('end', () => fn(null, body));
  });
  req.on('error', fn);
  req.end();
}

// Get JSON response from URL.
function getJson(url, opt) {
  return new Promise((fres, frej) => {
    getBodyCb(url, opt, (err, ans) => err? frej(err):fres(JSON.parse(ans)));
  });
}

// Get text response (body) from URL.
function getBody(url, opt) {
  return new Promise((fres, frej) => {
    getBodyCb(url, opt, (err, ans) => err? frej(err):fres(ans));
  });
}

async function search(x) {
  var [,name,,url] = await getJson(WIKIQUOTE+x, WIKIQUOTEOPT), a = [];
  for(var i=0, I=name.length; i<I; i++)
    a.push({name: name[i], url: url[i]});
  return a;
}

async function quotes(url) {
  var p = await getBody(url, WIKIQUOTEOPT);
  console.log(p);
}

async function main() {
  var a = await search('mahatma gandhi');
  await quotes(a[0].url);
}
main();

