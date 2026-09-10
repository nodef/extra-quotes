import {CsvParseStream} from "@std/csv";


interface CorpusRow {
  text: string;
  by: string;
  ref: string | null;
}


const rows: CorpusRow[] = [];
const EOL = Deno.build.os === "windows" ? "\r\n" : "\n";


// Create index.csv
await Deno.writeTextFile("index.csv", "text,by,ref\n");

// Read all CSV files from assets/
for (const entry of Deno.readDirSync("assets")) {
  if (!entry.isFile || !entry.name.endsWith(".csv")) continue;
  const path  = `assets/${entry.name}`;
  let content = await Deno.readTextFile(path);
  // Remove the first line (the CSV header)
  const newline = content.indexOf("\n");
  if (newline !== -1) content = content.slice(newline + 1);
  // Append to index.csv
  await Deno.writeTextFile("index.csv", content, {append: true});
}

// Open index.csv as a stream
const file = await Deno.open("index.csv", {read: true});
try {
  const stream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(
      new CsvParseStream({
        skipFirstRow: true,
        comment: "#",
      }),
    );

  for await (const row of stream) {
    const r = row as Record<string, string>;
    rows.push({
      text: r.text,
      by:   r.by,
      ref:  r.ref ? r.ref : null,
    });
  }
} finally { /* file.close(); */ }

// Generate corpus.js
let output = `const CORPUS = [${EOL}`;
for (const row of rows)
  output += `  ${JSON.stringify(row)},${EOL}`;
output += `];${EOL}`;
output += `export default CORPUS;${EOL}`;
await Deno.writeTextFile("corpus.js", output);
