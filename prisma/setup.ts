import "dotenv/config";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(here, "dev.db"));
const sql = readFileSync(join(here, "init.sql"), "utf8");
db.exec(sql);
db.close();
console.log("Local SQLite schema is ready.");
