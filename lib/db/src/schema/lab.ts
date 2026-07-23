import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labCombinacoesTable = pgTable("lab_combinacoes", {
  id: serial("id").primaryKey(),
  elemento1: text("elemento1").notNull(),
  elemento2: text("elemento2").notNull(),
  resultado: text("resultado").notNull(),
  tipo: text("tipo").notNull(), // correta | nenhuma | explosao
  explicacao: text("explicacao").notNull(),
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLabCombinacaoSchema = createInsertSchema(labCombinacoesTable).omit({ id: true, criadaEm: true });
export type InsertLabCombinacao = z.infer<typeof insertLabCombinacaoSchema>;
export type LabCombinacao = typeof labCombinacoesTable.$inferSelect;
