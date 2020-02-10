Quotes to share insightful moments. It has popular movie quotes [included].
You can also load them from [Wikiquote], or manually load them to corpora.


## console

```bash
equotes "try"
# Do, or do not. There is no 'try'.
# :by  Star Wars: Episode V - The Empire Strikes Back (1980)
#
# There’s nothing you can’t do if you try.
# :by  Dr Stone (2019)
# ...

equotes --load "mahatma gandhi,arnold" "success"
# The late Middle Ages not merely has a successful middle class—it is in fact a middle-class period.
# :by  Arnold Hauser (art historian)
#
# Just remember, you can't climb the ladder of success with your hands in your pockets.
# :by  Arnold Schwarzenegger
# ...

equotes --load "mahatma gandhi,arnold," "stop try"
## NOTE: last empty load => load default quotes (movies)
# Stop trying to control everything and just let go! LET GO!
# :by  Fight Club (1999)
#
# When you stop trying to force the solution, it'll happen on its own.
# :by  The Flash (2012)
# ...

equotes --load "mahatma gandhi,arnold," "peace" --ref
# Ideals are peaceful; history is violent.
# :by  Fury (2014)
#
# I regard myself as a soldier, though a soldier of peace.
# :by  Mahatma Gandhi
# :ref Speech at Victoria Hall, Geneva (10 December 1931)
# ...

EQUOTES_LOAD="mahatma gandhi,arnold,"
equotes "peace" --random --limit 1
## lists a random quote
```

### reference

```bash
equotes [options] [query]
# query: text to match in quotes
# Options:
# --help:   show this help
# --silent: hide error messages (0/1)
# --by:   display "by" field (0/1)
# --ref:  display "ref" field (0/1)
# --load: load quotes from wikiquote ('query,query,...')
# -a | --all: load all matching search results (0/1)
# --from: display quotes from corpus ('name,name,...', null => all)
# -f | --filter: filter quotes by ('js function')
# -r | --random: randomly shuffle quotes (0/1)
# -l | --limit:  limit number of quotes (integer, -1 => all)

# Environment variables:
$EQUOTES_SILENT # hide error messages (0)
$EQUOTES_BY     # display "by" field (1)
$EQUOTES_REF    # display "ref" field (0)
$EQUOTES_LOAD   # load quotes from wikiquote ('')
$EQUOTES_ALL    # load all matching search results (1)
$EQUOTES_FROM   # choose from a subset of corpora (null)
$EQUOTES_FILTER # filter quotes by ('q => q.text.length<=160')
$EQUOTES_RANDOM # randomly shuffle quotes (0)
$EQUOTES_LIMIT  # limit number of quotes (-1)
```
<br>


## javascript

```javascript
const quotes = require('extra-quotes');

async function main() {
await quotes.load();
/* loads local movies quotes (corpus) */
// true

quotes('try');
// [ { text: "Do, or do not. There is no 'try'.",
//     by: 'Star Wars: Episode V - The Empire Strikes Back (1980)',
//     ref: null },
//   { text: 'There’s nothing you can’t do if you try.',
//     by: 'Dr Stone (2019)',
//     ref: null }, ...
// ]

await quotes.load('mahatma gandhi');
/* loads Mahatma Gandhi quotes from Wikiquote */
// true

await quotes.load('arnold');
/* loads Arnold... quotes from Wikiquote */
// true

quotes('stop try');
// [ { text: 'Stop trying to control everything and just let go! LET GO!',
//     by: 'Fight Club (1999)',
//     ref: null },
//   { text:
//      "When you stop trying to force the solution, it'll happen on its own.",
//     by: 'The Flash (2012)',
//     ref: null }, ...
// ]

quotes('', null, {random: true, limit: 1});
// -> 1 random quote
}
main();
```

### reference

| Method              | Action
|---------------------|-------
| [quotes]            | Lists matching quotes.
| [load]              | Loads quotes from Wikiquote, or local (movies).
| [set]               | Manually sets quotes, with specified name.
| [delete]            | Deletes loaded / manually set quotes (from corpora).

<br>
<br>

[![Powered by Wikidata][powered_by_wikidata_img]][powered_by_wikidata_url]

[![nodef](https://merferry.glitch.me/card/extra-quotes.svg)](https://nodef.github.io)


[Wikiquote]: https://en.wikiquote.org/wiki/Main_Page
[included]: https://github.com/nodef/extra-quotes/blob/master/index.csv
[load]: https://github.com/nodef/extra-quotes/wiki/load
[set]: https://github.com/nodef/extra-quotes/wiki/set
[delete]: https://github.com/nodef/extra-quotes/wiki/delete
[powered_by_wikidata_img]: https://upload.wikimedia.org/wikipedia/commons/a/ae/Wikidata_Stamp_Rec_Dark.svg
[powered_by_wikidata_url]: https://www.wikidata.org/wiki/Wikidata:Data_access#Best_practices_to_follow
