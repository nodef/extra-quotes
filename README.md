Quotes to share insightful moments. I have added popular movie quotes here.
You can also load them from Wikiquote, or manually load them to corpora.

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


// quotes.load(query, options): loads quotes from Wikiquote / local (movies)
// quotes.setup(): setup index for a corpus if you manually loaded them
// quotes.corpora : Map {name_of_source => quotes}
// quotes(text, from, options): [{text, by, ref}]

```
