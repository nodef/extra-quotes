const lunr = require('lunr');
const https = require('https');

const WIKIQUOTE = 'https://en.wikiquote.org/w/api.php?action=opensearch&format=json&formatversion=2&search=';
const WIKIQUOTEOPT = {};
const LOADOPT = {
  all: true
};

var corpus = new Map();
var index = null;
var ready = false;



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

// Get text from html code.
function htmlText(x) {
  return unescape(x.replace(/<.*?>/g, ''));
}

// Get matched URLs.
async function searchPages(x) {
  var [,name,,url] = await getJson(WIKIQUOTE+x, WIKIQUOTEOPT), a = [];
  for(var i=0, I=name.length; i<I; i++)
    a.push({name: name[i], url: url[i]});
  return a;
}

// Get page title (excluding Wikiquote).
function pageTitle(p) {
  var i = p.indexOf('<title>');
  var j = p.indexOf('</title>', i+1);
  return p.substring(i+7, j).replace(' - Wikiquote', '');
}

// Get page quotes as {text, by, ref}.
function pageQuotes(p) {
  var by = pageTitle(p);
  var i = p.indexOf('<h2><span class="mw-headline" id="Quotes">Quotes</span></h2>');
  var I = p.indexOf('<h2>', i+1), a = [];
  for(; i<I;) {
    var s0 = p.indexOf('\n<ul><li>', i);
    if(s0<0) break;
    var s1 = p.indexOf('</li></ul>', s0+1);
    var s2 = p.indexOf('\n<ul><li>', s0+1);
    if(s1<s2) {
      var text = htmlText(p.substring(s0+9, s1));
      var ref = null;
      a.push({text, by, ref});
      i = s1+10;
    }
    else {
      var s3 = p.indexOf('</li></ul></li></ul>', s2+1);
      var text = htmlText(p.substring(s0+9, s2));
      var ref = htmlText(p.substring(s2+9, s3));
      a.push({text, by, ref});
      i = s3+20;
    }
  }
  return a;
}


function loadCorpus() {
  for(var r of require('./corpus'))
    corpus.set(r.text, r);
}

function setupIndex() {
  index = lunr(function() {
    this.ref('text');
    this.field('text', {boost: 2});
    this.field('by', {boost: 4});
    this.field('ref');
    for(var r of corpus.values())
      this.add(r);
  });
}

async function load(q=null, opt=null) {
  if(!q) { loadCorpus(); return ready = false; }
  var o = Object.assign({}, LOADOPT, opt);
  var rs = await searchPages(q);
  if(!o.all) rs.length = Math.min(1, rs.length);
  await Promise.all(rs.map(r => getBody(r.url, WIKIQUOTEOPT).then(p => {
    for(var q of pageQuotes(p))
      corpus.set(q.text, q);
  })));
  return ready = rs.length===0;
}

function setup() {
  if(!ready) setupIndex();
  return ready = true;
}

function quotes(txt) {
  setup();
  var z = [], txt = txt.replace(/\W/g, ' ');
  var mats = index.search(txt), max = 0;
  for(var mat of mats)
    max = Math.max(max, Object.keys(mat.matchData.metadata).length);
  for(var mat of mats)
    if(Object.keys(mat.matchData.metadata).length===max) z.push(corpus.get(mat.ref));
  return z;
}
quotes.load = load;
quotes.setup = setup;
quotes.corpus = corpus;
module.exports = quotes;
