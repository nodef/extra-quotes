const quotes = require('./');

// Parse text to boolean.
function boolean(str) {
  var fal = str.search(/(negati|never|refus|wrong|fal|off)|\b(f|n|0)\b/gi)<0? 0:1;
  var not = (str.match(/\b(nay|nah|no|dis|un|in)/gi)||[]).length & 1;
  return !(fal^not);
}

function minusOneToMax(n) {
  return n<0? Number.MAX_SAFE_INTEGER:n;
}

const E = process.env;
const OPTIONS = {
  help: false,
  silent: boolean(E['EQUOTES_SILENT']||'0'),
  by: boolean(E['EQUOTES_BY']||'1'),
  ref: boolean(E['EQUOTES_REF']||'0'),
  load: E['EQUOTES_LOAD']||'',
  all: boolean(E['EQUOTES_ALL']||'1'),
  from: E['EQUOTES_FROM']||null,
  filter: eval(E['EQUOTES_FILTER']||'q => q.text.length<=160'),
  random: boolean(E['EQUOTES_RANDOM']||'0'),
  limit: parseInt(E['EQUOTES_LIMIT']||'-1', 10),
  text: '',
};
const STDIO = [0, 1, 2];
const ISTTY = process.stdout.isTTY;
const CRESET = ISTTY? '\x1b[0m':'';
const CFLIGHTGRAY = ISTTY? '\x1b[0;33m':'';
const CFDARKGRAY = ISTTY? '\x1b[0;34m':'';
const CFMAGENTA = ISTTY? '\x1b[35m':'';



async function main(a) {
  var o = Object.assign({}, OPTIONS);
  for(var i=2, I=a.length; i<I;)
    i = options(o, a[i], a, i);
  if(o.help) return cp.execSync('less README.md', {cwd: process.cwd(), stdio: STDIO});
  try { await Promise.all(o.load.split(',').map(q => quotes.load(q, o))); }
  catch(e) { return error(e, o); }
  var qs = quotes(o.text, o.from, o);
  if(qs.length===0) return error(new Error('No such quotes'), o);
  for(var q of qs) {
    console.log(q.text);
    if(o.by && q.by) console.log(CFLIGHTGRAY+':by  '+q.by+CRESET);
    if(o.ref && q.ref) console.log(CFDARKGRAY+':ref '+q.ref+CRESET);
    console.log();
  }
}

function options(o, k, a, i) {
  if(k==='--help') o.help = true;
  else if(k==='--silent') o.silent = true;
  else if(/^--by/.test(k)) o.by = k.includes('=')? boolean(k.split('=')[1]):true;
  else if(/^--ref/.test(k)) o.ref = k.includes('=')? boolean(k.split('=')[1]):true;
  else if(k==='--load') o.load = a[++i];
  else if(/^-a|^--all/.test(k)) o.all = k.includes('=')? boolean(k.split('=')[1]):true;
  else if(k==='--from') o.from = from(a[++i]);
  else if(k==='-f' || k==='--filter') o.filter = eval(a[++i]);
  else if(/^-r|^--random/.test(k)) o.random = k.includes('=')? boolean(k.split('=')[1]):true;
  else if(k==='-l' || k==='--limit') o.limit = parseInt(a[++i], 10);
  else o.text = a[i];
  return i+1;
}

function error(err, o) {
  if(o.silent) return console.log(-1);
  console.error(`${CFMAGENTA}error:${CRESET}`, err.message);
}

function from(x) {
  var re = /^\/(.*?)\/([igmuys]*)$/;
  if(re.test(x)) return regexp(x);
  if(/=>|{/.test(x)) return eval(x);
  return x;
}

function regexp(x) {
  var [pattern, flags] = x.replace(/^\/(.*?)\/([igmuys]*)$|(.*)/, '$1$3:$2').split(':');
  return new RegExp(pattern, flags);
}
if(require.main===module) main(process.argv);
