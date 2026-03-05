import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5432"),
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "oracle_db",
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
};

console.log(
  "Config (host/port/user/db):",
  DB_CONFIG.host,
  DB_CONFIG.port,
  DB_CONFIG.user,
  DB_CONFIG.database,
);

const pool = new Pool(DB_CONFIG);

async function test() {
  try {
    console.log("Connecting to pool...");
    const client = await pool.connect();
    console.log("Connected! Running version query...");
    const res = await client.query("SELECT version()");
    console.log("Version:", res.rows[0].version);
    client.release();
  } catch (err: any) {
    console.error("Connection failed!");
    console.error("Name:", err.name);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
  } finally {
    await pool.end();
  }
}

test();
