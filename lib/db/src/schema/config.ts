import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sistemaConfigTable = pgTable("sistema_config", {
  id: serial("id").primaryKey(),
  intervaloCarrossel: integer("intervalo_carrossel").notNull().default(5),
  aprovacaoAutomatica: boolean("aprovacao_automatica").notNull().default(false),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSistemaConfigSchema = createInsertSchema(sistemaConfigTable).omit({ id: true, atualizadoEm: true });
export type InsertSistemaConfig = z.infer<typeof insertSistemaConfigSchema>;
export type SistemaConfig = typeof sistemaConfigTable.$inferSelect;
