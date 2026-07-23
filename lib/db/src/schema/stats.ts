import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const statsTable = pgTable("stats", {
  id: serial("id").primaryKey(),
  miniGame: text("mini_game").notNull(),
  jogadaEm: timestamp("jogada_em", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStatSchema = createInsertSchema(statsTable).omit({ id: true, jogadaEm: true });
export type InsertStat = z.infer<typeof insertStatSchema>;
export type Stat = typeof statsTable.$inferSelect;
