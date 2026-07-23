import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, quizPerguntasTable } from "@workspace/db";
import {
  CreateQuizPerguntaBody,
  UpdateQuizPerguntaBody,
  UpdateQuizPerguntaParams,
  DeleteQuizPerguntaParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function parsePerguntas(rows: typeof quizPerguntasTable.$inferSelect[]) {
  return rows.map(p => ({
    ...p,
    alternativas: JSON.parse(p.alternativas) as string[],
  }));
}

// 5 perguntas aleatórias (visitante)
router.get("/quiz/perguntas", async (_req, res): Promise<void> => {
  const perguntas = await db
    .select()
    .from(quizPerguntasTable)
    .orderBy(sql`RANDOM()`)
    .limit(5);
  res.json(parsePerguntas(perguntas));
});

// Todas as perguntas (admin)
router.get("/quiz/perguntas/todas", requireAuth, async (_req, res): Promise<void> => {
  const perguntas = await db.select().from(quizPerguntasTable);
  res.json(parsePerguntas(perguntas));
});

// Criar pergunta (admin)
router.post("/quiz/perguntas/todas", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateQuizPerguntaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [pergunta] = await db
    .insert(quizPerguntasTable)
    .values({
      pergunta: parsed.data.pergunta,
      alternativas: JSON.stringify(parsed.data.alternativas),
      respostaCorreta: parsed.data.respostaCorreta,
    })
    .returning();

  res.status(201).json({ ...pergunta, alternativas: JSON.parse(pergunta.alternativas) });
});

// Atualizar pergunta (admin)
router.patch("/quiz/perguntas/todas/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateQuizPerguntaParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateQuizPerguntaBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.pergunta != null) updateData.pergunta = body.data.pergunta;
  if (body.data.alternativas != null) updateData.alternativas = JSON.stringify(body.data.alternativas);
  if (body.data.respostaCorreta != null) updateData.respostaCorreta = body.data.respostaCorreta;

  const [pergunta] = await db
    .update(quizPerguntasTable)
    .set(updateData)
    .where(eq(quizPerguntasTable.id, params.data.id))
    .returning();

  if (!pergunta) {
    res.status(404).json({ error: "Pergunta não encontrada" });
    return;
  }

  res.json({ ...pergunta, alternativas: JSON.parse(pergunta.alternativas) });
});

// Excluir pergunta (admin)
router.delete("/quiz/perguntas/todas/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteQuizPerguntaParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [p] = await db
    .delete(quizPerguntasTable)
    .where(eq(quizPerguntasTable.id, params.data.id))
    .returning();

  if (!p) {
    res.status(404).json({ error: "Pergunta não encontrada" });
    return;
  }

  res.sendStatus(204);
});

export default router;
