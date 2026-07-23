import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Stores words as JSON array in a single config row
export const cacaPalavrasTable = pgTable("caca_palavras", {
  id: serial("id").primaryKey(),
  palavras: text("palavras").notNull(), // JSON array of strings
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCacaPalavrasSchema = createInsertSchema(cacaPalavrasTable).omit({ id: true, atualizadoEm: true });
export type InsertCacaPalavras = z.infer<typeof insertCacaPalavrasSchema>;
export type CacaPalavras = typeof cacaPalavrasTable.$inferSelect;
