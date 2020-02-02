const https = require('https');

const WIKIQUOTE = 'https://en.wikiquote.org/w/api.php?action=opensearch&format=json&formatversion=2&search=';
const WIKIQUOTEOPT = {};



function htmlText(x) {
  return unescape(x.replace(/<.*?>/g, ''));
}

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
  var q0 = p.indexOf('<h2><span class="mw-headline" id="Quotes">Quotes</span></h2>');
  var q1 = p.indexOf('<h2>', q0+1);
  var q = p.substring(q0, q1), a = [];
  for(var i=0;;) {
    var s0 = q.indexOf('\n<ul><li>', i);
    if(s0<0) break;
    var s1 = q.indexOf('</li></ul>', s0+1);
    var s2 = q.indexOf('\n<ul><li>', s0+1);
    if(s1<s2) { console.log('Z: '+htmlText(q.substring(s0+9, s1))); i = s1+10; continue; }
    var s3 = q.indexOf('</li></ul></li></ul>', s2+1);
    console.log('a: '+htmlText(q.substring(s0+9, s2)));
    console.log('b: '+htmlText(q.substring(s2+9, s3)));
    i = s3+20;
  }
}

async function main() {
  var a = await search('mahatma gandhi');
  await quotes(a[0].url);
}
main();

