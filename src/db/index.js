require("dotenv/config");
const { drizzle } = require("drizzle-orm/node-postgres");
const pg = require("pg");

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool });

module.exports = { db };
