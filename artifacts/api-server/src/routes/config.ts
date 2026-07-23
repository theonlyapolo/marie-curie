import { Router, type IRouter } from "express";
import { db, sistemaConfigTable } from "@workspace/db";
import { UpdateConfigBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/config", async (_req, res): Promise<void> => {
  const [config] = await db.select().from(sistemaConfigTable).limit(1);
  if (!config) {
    res.json({ intervaloCarrossel: 5, aprovacaoAutomatica: false });
    return;
  }
  res.json({ intervaloCarrossel: config.intervaloCarrossel, aprovacaoAutomatica: config.aprovacaoAutomatica });
});

router.put("/config", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(sistemaConfigTable).limit(1);

  if (existing) {
    const [updated] = await db
      .update(sistemaConfigTable)
      .set({ ...parsed.data, atualizadoEm: new Date() })
      .returning();
    res.json({ intervaloCarrossel: updated.intervaloCarrossel, aprovacaoAutomatica: updated.aprovacaoAutomatica });
  } else {
    const [created] = await db
      .insert(sistemaConfigTable)
      .values({
        intervaloCarrossel: parsed.data.intervaloCarrossel ?? 5,
        aprovacaoAutomatica: parsed.data.aprovacaoAutomatica ?? false,
      })
      .returning();
    res.json({ intervaloCarrossel: created.intervaloCarrossel, aprovacaoAutomatica: created.aprovacaoAutomatica });
  }
});

export default router;
