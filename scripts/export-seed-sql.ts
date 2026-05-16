import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildSeedSql, getSeedSummary } from "../src/lib/seed-data";

const outPath = resolve("db/seed/0001_mock_seed.sql");
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, buildSeedSql(), "utf8");

const summary = getSeedSummary();
console.log(`Wrote ${summary.records} seed records across ${summary.tables} tables to ${outPath}`);
