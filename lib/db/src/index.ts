import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

(async () => {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        current_database() AS banco,
        current_user AS usuario,
        current_schema() AS schema;
    `);

    console.log("BANCO CONECTADO:");
    console.table(result.rows);

    client.release();
  } catch (err) {
    console.error("ERRO AO CONECTAR:");
    console.error(err);
  }
})();

export * from "./schema";
