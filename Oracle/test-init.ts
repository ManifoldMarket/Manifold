import * as db from "./src/db.js";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  try {
    console.log("Attempting db.initDb()...");
    await db.initDb();
    console.log("db.initDb() successful!");
  } catch (err: any) {
    console.error("db.initDb() failed!");
    console.error("Name:", err.name);
    console.error("Message:", err?.message);
    console.error("Full Error:", err);
  }
}

test();
