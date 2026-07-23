import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizPerguntasTable = pgTable("quiz_perguntas", {
  id: serial("id").primaryKey(),
  pergunta: text("pergunta").notNull(),
  alternativas: text("alternativas").notNull(), // JSON array string
  respostaCorreta: integer("resposta_correta").notNull(),
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuizPerguntaSchema = createInsertSchema(quizPerguntasTable).omit({ id: true, criadaEm: true });
export type InsertQuizPergunta = z.infer<typeof insertQuizPerguntaSchema>;
export type QuizPergunta = typeof quizPerguntasTable.$inferSelect;
