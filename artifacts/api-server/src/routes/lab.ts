import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, labCombinacoesTable } from "@workspace/db";
import {
  CreateLabCombinacaoBody,
  UpdateLabCombinacaoBody,
  UpdateLabCombinacaoParams,
  DeleteLabCombinacaoParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/lab/combinacoes", async (_req, res): Promise<void> => {
  const lista = await db.select().from(labCombinacoesTable);
  res.json(lista);
});

router.post("/lab/combinacoes", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateLabCombinacaoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [c] = await db.insert(labCombinacoesTable).values(parsed.data).returning();
  res.status(201).json(c);
});

router.patch("/lab/combinacoes/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateLabCombinacaoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateLabCombinacaoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [c] = await db
    .update(labCombinacoesTable)
    .set(body.data)
    .where(eq(labCombinacoesTable.id, params.data.id))
    .returning();

  if (!c) {
    res.status(404).json({ error: "Combinação não encontrada" });
    return;
  }

  res.json(c);
});

router.delete("/lab/combinacoes/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteLabCombinacaoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [c] = await db
    .delete(labCombinacoesTable)
    .where(eq(labCombinacoesTable.id, params.data.id))
    .returning();

  if (!c) {
    res.status(404).json({ error: "Combinação não encontrada" });
    return;
  }

  res.sendStatus(204);
});

export default router;
