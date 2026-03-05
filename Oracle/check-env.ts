import dotenv from "dotenv";
dotenv.config();

console.log("--- Environment Variables ---");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "SET (masked)" : "NOT SET",
);
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log("DATABASE_URL Host:", url.hostname);
  } catch (e) {
    console.log("DATABASE_URL is not a valid URL");
  }
}
console.log("PGHOST:", process.env.PGHOST);
console.log("PGPORT:", process.env.PGPORT);
console.log("PGUSER:", process.env.PGUSER);
console.log("PGDATABASE:", process.env.PGDATABASE);
console.log("PGSSL:", process.env.PGSSL);
console.log("ALEO_NODE_URL:", process.env.ALEO_NODE_URL);
console.log(
  "ORACLE_PRIVATE_KEY:",
  process.env.ORACLE_PRIVATE_KEY ? "SET (masked)" : "NOT SET",
);
console.log("----------------------------");
