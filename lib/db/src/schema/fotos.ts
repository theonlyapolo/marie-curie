import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fotosTable = pgTable("fotos", {
  id: serial("id").primaryKey(),
  urlImagem: text("url_imagem").notNull(),
  miniGame: text("mini_game").notNull(),
  nomeVisitante: text("nome_visitante"),
  status: text("status").notNull().default("pendente"), // pendente | aprovada | rejeitada
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFotoSchema = createInsertSchema(fotosTable).omit({ id: true, criadaEm: true });
export type InsertFoto = z.infer<typeof insertFotoSchema>;
export type Foto = typeof fotosTable.$inferSelect;
