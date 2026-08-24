#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
const path = new URL('../content/canonical/species.jsonl', import.meta.url);
const rows = readFileSync(path, 'utf8').trim().split('\n').map(JSON.parse);
for (const row of rows) {
  delete row.flavor;
  delete row.genus;
}
writeFileSync(path, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`, { mode: 0o600 });
console.log(`removed copied presentation fields from ${rows.length} factual metadata rows`);
