import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "path";

// Carrega o .env da raiz do projeto
config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log("DATABASE_URL =", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});