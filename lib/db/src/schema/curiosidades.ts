import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const curiosidadesTable = pgTable("curiosidades", {
  id: serial("id").primaryKey(),
  texto: text("texto").notNull(),
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCuriosidadeSchema = createInsertSchema(curiosidadesTable).omit({ id: true, criadaEm: true });
export type InsertCuriosidade = z.infer<typeof insertCuriosidadeSchema>;
export type Curiosidade = typeof curiosidadesTable.$inferSelect;
