import {unescape} from "@std/html";
import lunr from "lunr";




//#region TYPES
interface Quote {
  text: string;
  by:   string;
}

interface Library {
  corpus: Map<string, string[]>;
  index:  lunr.Index;
}
//#endregion




//#region CONSTANTS
// const WIKIQUOTE = "https://en.wikiquote.org/w/api.php?action=opensearch&format=json&formatversion=2&search=";
//#endregion




//#region HTTP REQUEST
// Get text response (body) from URL.
async function getBody(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request to ${url} returned ${res.status}`);
  return await res.text();
}


// Get JSON response from URL.
// async function getJson(url: string) {
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`Request to ${url} returned ${res.status}`);
//   return await res.json();
// }
//#endregion




//#region HTML DECODING
// Get text from html code.
function htmlText(x: string) {
  return unescape(x.replace(/<.*?>/g, "")).replace(/&amp;/, "&");
}


// Get matched URLs from Wikiquote.
// async function wikiquoteSearch(x: string) {
//   const [,name,,url] = await getJson(WIKIQUOTE + x), a = [];
//   for (let i=0, I=name.length; i<I; i++)
//     a.push({name: name[i], url: url[i]});
//   return a;
// }

// Get page title from page HTML.
function wikiquoteTitle(p: string) {
  const i = p.indexOf("<title>");
  const j = p.indexOf("</title>", i+1);
  return p.substring(i+7, j).replace(" - Wikiquote", "");
}

// Get page quotes as {text, by, ref} from page HTML.
function wikiquoteQuotes(p: string) {
  const by = wikiquoteTitle(p);
  let   i = p.indexOf(`<h2><span class="mw-headline" id="Quotes">Quotes</span>`);
  const I = p.indexOf("<h2>", i+1), a = [];
  for (; i<I;) {
    const s0 = p.indexOf("\n<ul><li>", i);
    if (s0 < 0 || s0 >= I) break;
    const s1 = p.indexOf("</li></ul>", s0 + 1);
    const s2 = p.indexOf("\n<ul><li>", s0 + 1);
    if (s1 < s2) {
      const text = htmlText(p.substring(s0 + 9, s1));
      const ref  = null;
      a.push({text, by, ref});
      i = s1 + 10;
    }
    else {
      const s3   = p.indexOf("</li></ul></li></ul>", s2 + 1);
      const text = htmlText(p.substring(s0 + 9, s2));
      const ref  = htmlText(p.substring(s2 + 9, s3));
      a.push({text, by, ref});
      i = s3 + 20;
    }
  }
  return a;
}
//#endregion




//#region LOAD AND SETUP
/**
 * Add quotes to the quote library.
 * @param lib quote library
 * @param quotes quotes to add [{text, by}]
 */
export function addQuotes(lib: Library, quotes: Quote[]) {
  for (const quote of quotes) {
    const {by} = quote;
    if (!lib.corpus.has(by)) lib.corpus.set(by, []);
    lib.corpus.get(by)!.push(quote.text);
  }
}

/**
 * Remove quotes from the quote library.
 * @param lib quote library
 * @param quotes quotes to remove [{text, by}]
 */
export function removeQuotes(lib: Library, quotes: Quote[]) {
  for (const quote of quotes) {
    const {by} = quote;
    if (!lib.corpus.has(by)) continue;
    const group = lib.corpus.get(by)!;
    const i = group.indexOf(quote.text);
    if (i >= 0) group.splice(i, 1);
  }
}


/**
 * Remove all quotes by a given author from the quote library.
 * @param lib quote library
 * @param by author name
 */
export function removeQuotesBy(lib: Library, by: string) {
  if (!lib.corpus.has(by)) return;
  lib.corpus.delete(by);
}


/**
 * Load quotes into the quote library from a given URL.
 * @param lib quote library
 * @param url URL of the page to load quotes from (e.g., Wikiquote page)
 */
export async function loadQuotes(lib: Library, url?: string) {
  const quotes = url? wikiquoteQuotes(await getBody(url)) : (await import("./corpus.js")).default;
  addQuotes(lib, quotes);
}


/**
 * Set up index for the given quote library.
 * @param lib quote library
 */
export function setupQuotesIndex(lib: Library) {
  lib.index = lunr(function(this: lunr.Builder) {
    this.ref("ref");
    this.field("text", {boost: 2});
    this.field("by",   {boost: 4});
    for (const [by, texts] of lib.corpus.entries()) {
      for (const text of texts) {
        const ref = `${by}"${text}`;
        this.add({ref, text, by});
      }
    }
  });
}


/**
 * Get all quotes by a given author from the quote library.
 * @param lib quote library
 * @param by author name
 * @returns array of quotes [{text, by}]
 */
export function quotesBy(lib: Library, by: string): Quote[] {
  if (!lib.corpus.has(by)) return [];
  const texts = lib.corpus.get(by)!;
  return texts.map(text => ({text, by}));
}


/**
 * Get array of matching quotes.
 * @param lib quote library
 * @param search search term
 * @returns array of quotes [{text, by}]
 */
export function quotes(lib: Library, search: string): Quote[] {
  const ans: Quote[] = [];
  const matches = lib.index.search(search);
  let   max = 0;
  for (const m of matches)
    max = Math.max(max, Object.keys(m.matchData.metadata).length);
  for (const m of matches) {
    if (Object.keys(m.matchData.metadata).length!==max) continue;
    const ref = m.ref, x = ref.indexOf('"');
    const by  = ref.substring(0, x), text = ref.substring(x+1);
    ans.push({text, by});
  }
  return ans;
}
//#endregion
