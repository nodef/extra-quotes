Quotes to share insightful moments. It has popular movie quotes included.
You can also load them from Wikiquote, or manually load them to corpora.


## console

```bash
equotes "try"
## load default quotes (movies)
## list quotes matching "try"
# Do, or do not. There is no 'try'.
# :by  Star Wars: Episode V - The Empire Strikes Back (1980)
#
# There’s nothing you can’t do if you try.
# :by  Dr Stone (2019)
# ...

equotes --load "mahatma gandhi,arnold" "success"
## load Mahatma Gandhi and Arnold... quotes from Wikiquote
# The late Middle Ages not merely has a successful middle class—it is in fact a middle-class period.
# :by  Arnold Hauser (art historian)
#
# Just remember, you can't climb the ladder of success with your hands in your pockets.
# :by  Arnold Schwarzenegger
# ...

equotes --load "mahatma gandhi,arnold," "stop try" --ref
## load Mahatma Gandhi,Arnold..., default quotes
# Stop trying to control everything and just let go! LET GO!
# :by  Fight Club (1999)
#
# When you stop trying to force the solution, it'll happen on its own.
# :by  The Flash (2012)
# ...

equotes --load "mahatma gandhi,arnold," "peace" --ref
## include references, where available
# Ideals are peaceful; history is violent.
# :by  Fury (2014)
#
# I regard myself as a soldier, though a soldier of peace.
# :by  Mahatma Gandhi
# :ref Speech at Victoria Hall, Geneva (10 December 1931)
# ...
```
<br>

### reference

```bash
equotes [options] [text]
# text: text to match in quotes
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
<br>

## javascript

```javascript
const quotes = require('extra-quotes');

await quotes.load();
/* loads local movies quotes (corpus) */
// true

quotes('try');
// [ { text: "Do, or do not. There is no 'try'.",
//     by: 'Star Wars: Episode V - The Empire Strikes Back (1980)',
//     ref: null },
//   { text: 'There’s nothing you can’t do if you try.',
//     by: 'Dr Stone (2019)',
//     ref: null },
//   ...
// ]

quotes('stop try');
// [ { text: 'Stop trying to control everything and just let go! LET GO!',
//     by: 'Fight Club (1999)',
//     ref: null },
//   { text:
//      "When you stop trying to force the solution, it'll happen on its own.",
//     by: 'The Flash (2012)',
//     ref: null },
//    ...
// ]

quotes('godfather');
// [ { text: 'Drop the gun, take the cannoli.',
//     by: 'The Godfather (1972)',
//     ref: null },
//   { text:
//      "A man who doesn't spend time with his family can never be a real man.",
//     by: 'The Godfather (1972)',
//     ref: null },
//    ...
// ]

quotes('');
// -> all quotes

await quotes.load('mahatma gandhi');
/* loads Mahatma Gandhi quotes from Wikiquote */
// true

quotes('peace');
// [ { text: 'Ideals are peaceful; history is violent.',
//     by: 'Fury (2014)',
//     ref: null },
//   { text: 'I regard myself as a soldier, though a soldier of peace.',
//     by: 'Mahatma Gandhi',
//     ref: 'Speech at Victoria Hall, Geneva (10 December 1931)' },
//   ...
// ]

quotes('mahatma gandhi');
// -> all Mahatma Gandhi quotes

quotes.corpora;
// Map {'' => movie quotes, 'Mahatma Gandhi' => Mahatma Gandhi quotes}

quotes('', 'Mahatma Gandhi');
quotes('', /mahatma gandhi/i);
quotes('', name => name==='Mahatma Gandhi');
// -> all Mahatma Gandhi quotes

quotes('', null, q => q.text.length<50);
// -> all quotes with text less than 50 characters
```
<br>

### reference

```javascript
quotes(text, from, options);
// text: text to match in quotes
// from: display quotes from corpus (null => all)
// options: {filter, random, limit}

// from: display quotes from corpus (null => all)
from = 'corpus1,corpus2,...';
from = ['corpus1', 'corpus2', ...];
from = /corpus1|corpus2|.../;
from = c => ['corpus1', 'corpus2', ...].includes(c);

// options: {filter, random, limit}
filter = q => q.text.length <= 160; // filter quotes by
random = false; // randomly shuffle quotes
limit = -1;     // limit number of quotes (-1 => all)
```
<br>

Methods:

| Name                | Action
|---------------------|-------
| [load]              | Loads quotes from Wikiquote, or local (movies).
| [set]               | Manually sets quotes, with specified name.
| [delete]            | Deletes loaded / manually set quotes (from corpora).
