import {assertEquals} from "@std/assert";
import {quotes, loadQuotes, setupQuotesIndex} from "./index.ts";


Deno.test("Main", async () => {
  const lib = {corpus: new Map(), index: null};
  await loadQuotes(lib);
  setupQuotesIndex(lib);
  const a = quotes(lib, "success");
  assertEquals(a[0].text, "Success is not final, failure is not fatal: it is the courage to continue that counts.");
});
