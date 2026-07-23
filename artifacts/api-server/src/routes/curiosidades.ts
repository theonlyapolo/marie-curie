import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, curiosidadesTable } from "@workspace/db";
import {
  CreateCuriosidadeBody,
  UpdateCuriosidadeBody,
  UpdateCuriosidadeParams,
  DeleteCuriosidadeParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// Curiosidade aleatória (visitante — após jogo)
router.get("/curiosidades/aleatoria", async (_req, res): Promise<void> => {
  const [c] = await db
    .select()
    .from(curiosidadesTable)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!c) {
    res.status(404).json({ error: "Nenhuma curiosidade cadastrada" });
    return;
  }

  res.json(c);
});

// Listar todas (admin)
router.get("/curiosidades", requireAuth, async (_req, res): Promise<void> => {
  const lista = await db.select().from(curiosidadesTable);
  res.json(lista);
});

// Criar (admin)
router.post("/curiosidades", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCuriosidadeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [c] = await db.insert(curiosidadesTable).values(parsed.data).returning();
  res.status(201).json(c);
});

// Atualizar (admin)
router.patch("/curiosidades/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCuriosidadeParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateCuriosidadeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [c] = await db
    .update(curiosidadesTable)
    .set(body.data)
    .where(eq(curiosidadesTable.id, params.data.id))
    .returning();

  if (!c) {
    res.status(404).json({ error: "Curiosidade não encontrada" });
    return;
  }

  res.json(c);
});

// Excluir (admin)
router.delete("/curiosidades/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCuriosidadeParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [c] = await db
    .delete(curiosidadesTable)
    .where(eq(curiosidadesTable.id, params.data.id))
    .returning();

  if (!c) {
    res.status(404).json({ error: "Curiosidade não encontrada" });
    return;
  }

  res.sendStatus(204);
});

export default router;
