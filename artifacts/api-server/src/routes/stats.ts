import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, statsTable, fotosTable } from "@workspace/db";
import { RegistrarStatBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/stats", requireAuth, async (_req, res): Promise<void> => {
  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(statsTable);

  const porGame = await db
    .select({ miniGame: statsTable.miniGame, total: sql<number>`count(*)::int` })
    .from(statsTable)
    .groupBy(statsTable.miniGame);

  const [{ fotosTotal }] = await db.select({ fotosTotal: sql<number>`count(*)::int` }).from(fotosTable);
  const [{ fotosPendentes }] = await db
    .select({ fotosPendentes: sql<number>`count(*)::int` })
    .from(fotosTable)
    .where(eq(fotosTable.status, "pendente"));
  const [{ fotosAprovadas }] = await db
    .select({ fotosAprovadas: sql<number>`count(*)::int` })
    .from(fotosTable)
    .where(eq(fotosTable.status, "aprovada"));

  res.json({ totalJogadas: total, porGame, fotosTotal, fotosPendentes, fotosAprovadas });
});

router.post("/stats", async (req, res): Promise<void> => {
  const parsed = RegistrarStatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [s] = await db.insert(statsTable).values(parsed.data).returning();
  res.status(201).json({ ...s, jogadaEm: s.jogadaEm.toISOString() });
});

export default router;
