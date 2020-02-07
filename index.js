const lunr = require('lunr');
const https = require('https');

const WIKIQUOTE = 'https://en.wikiquote.org/w/api.php?action=opensearch&format=json&formatversion=2&search=';
const WIKIQUOTEOPT = {};
const LOADOPT = {
  all: true
};
const OPTIONS = {
  filter: q => q.text.length<=160,
  limit: -1,
};

var corpora = new Map();
var indexes = new Map();


// 1. HTTPS REQUEST
// Gets text response (body) from URL (callback).
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

// Gets JSON response from URL.
function getJson(url, opt) {
  return new Promise((fres, frej) => {
    getBodyCb(url, opt, (err, ans) => err? frej(err):fres(JSON.parse(ans)));
  });
}

// Gets text response (body) from URL.
function getBody(url, opt) {
  return new Promise((fres, frej) => {
    getBodyCb(url, opt, (err, ans) => err? frej(err):fres(ans));
  });
}


// 2. HTML DECODING
// Gets text from html code.
function htmlText(x) {
  return unescape(x.replace(/<.*?>/g, '')).replace(/&amp;/, '&');
}

// Gets matched URLs from Wikiquote.
async function wikiquoteSearch(x) {
  var [,name,,url] = await getJson(WIKIQUOTE+x, WIKIQUOTEOPT), a = [];
  for(var i=0, I=name.length; i<I; i++)
    a.push({name: name[i], url: url[i]});
  return a;
}

// Gets page title from page HTML.
function wikiquoteTitle(p) {
  var i = p.indexOf('<title>');
  var j = p.indexOf('</title>', i+1);
  return p.substring(i+7, j).replace(' - Wikiquote', '');
}

// Gets page quotes as {text, by, ref} from page HTML.
function wikiquoteQuotes(p) {
  var by = wikiquoteTitle(p);
  var i = p.indexOf('<h2><span class="mw-headline" id="Quotes">Quotes</span>');
  var I = p.indexOf('<h2>', i+1), a = [];
  for(; i<I;) {
    var s0 = p.indexOf('\n<ul><li>', i);
    if(s0<0 || s0>=I) break;
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


// 3. LOAD AND SETUP
// Loads corpus (quotes) for a given page.
async function loadCorpus(url) {
  var corpus = new Map();
  var quotes = url? wikiquoteQuotes(await getBody(url)):require('./corpus');
  for(var q of quotes)
    corpus.set(q.text, q);
  return corpus;
}

// Sets up index for a given corpus (quotes).
function setupIndex(corpus) {
  return lunr(function() {
    this.ref('text');
    this.field('text', {boost: 2});
    this.field('by', {boost: 4});
    this.field('ref');
    for(var r of corpus.values())
      this.add(r);
  });
}

/**
 * Manually sets quotes, with specified name.
 * @param {string} nam name of quote group (corpus)
 * @param {Array<object>} val array of quotes [{text, by, ref}]
 * @returns {function} quotes function
 */
function set(nam, val) {
  corpora.set(nam, val);
  indexes.set(nam, setupIndex(corpora.get(nam)));
  return quotes;
}

/**
 * Deletes loaded / manually set quotes (from corpora).
 * @param {string} nam name of quote group (corpus)
 * @returns {boolean} true, if removed
 */
function _delete(nam) {
  indexes.delete(nam);
  return corpora.delete(nam);
}

// Loads a corpus and sets up index.
async function loadOne(nam, url) {
  if(corpora.has(nam)) return true;
  set(nam, await loadCorpus(url));
  return true;
}

/**
 * Loads quotes into corpora, before it can be used.
 * @param {string} q query text (e.g., author name)
 * @param {object?} opt options {all: true}
 * @returns {Promise<boolean>} true when done
 */
async function load(q=null, opt=null) {
  if(!q) return loadOne('', null);
  var o = Object.assign({}, LOADOPT, opt);
  var results = await wikiquoteSearch(q);
  if(!o.all) results.length = Math.min(1, results.length);
  return Promise.all(results.map(r => loadOne(r.name, r.url))).then(() => true);
}


// 4. MAIN
function quotesFrom(from) {
  var names = Array.from(corpora.keys());
  if(from==null) return names;
  if(Array.isArray(from)) return from;
  if(typeof from==='string') return from.split(',');
  if(typeof from==='function') return names.filter(from);
  return names.filter(nam => from.test(nam));
}

function quotesOne(txt, nam, filter, ans) {
  var corpus = corpora.get(nam);
  var index = indexes.get(nam);
  var matches = index.search(txt), max = 0;
  for(var m of matches)
    max = Math.max(max, Object.keys(m.matchData.metadata).length);
  for(var m of matches) {
    if(Object.keys(m.matchData.metadata).length!==max) continue;
    var q = corpus.get(m.ref);
    if(filter && filter(q)) ans.push(q);
  }
}

/**
 * Gets array of matching quotes.
 * @param {string} txt quote query text
 * @param {string|array|RegExp|function} from source corpora (default: all)
 * @param {object?} opt options {filter: function (quote)} (default: quote.text.length <= 80)
 * @returns {Array<object>} [{text, by, ref}, ...]
 */
function quotes(txt, from=null, opt=null) {
  var ans = [], txt = txt.replace(/\W/g, ' ');
  var o = Object.assign({}, OPTIONS, opt);
  for(var nam of quotesFrom(from))
    quotesOne(txt, nam, o.filter, ans);
  if(o.limit>=0 && ans.length>o.limit) ans.length = o.limit;
  return ans;
}
quotes.set = set;
quotes.delete = _delete;
quotes.load = load;
quotes.corpora = corpora;
module.exports = quotes;

async function main() {
  await quotes.load('mahatma gandhi');
  await quotes.load('arnold', {all: false});
  await quotes.load();
  console.log(quotes('success'));
}
main();
