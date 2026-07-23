import { Router, type IRouter } from "express";
import { db, cacaPalavrasTable } from "@workspace/db";
import { UpdateCacaPalavrasBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/cacapalavras", async (_req, res): Promise<void> => {
  const [config] = await db.select().from(cacaPalavrasTable).limit(1);
  if (!config) {
    res.json({ palavras: [] });
    return;
  }
  res.json({ palavras: JSON.parse(config.palavras) as string[] });
});

router.put("/cacapalavras", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateCacaPalavrasBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(cacaPalavrasTable).limit(1);

  if (existing) {
    const [updated] = await db
      .update(cacaPalavrasTable)
      .set({ palavras: JSON.stringify(parsed.data.palavras) })
      .returning();
    res.json({ palavras: JSON.parse(updated.palavras) });
  } else {
    const [created] = await db
      .insert(cacaPalavrasTable)
      .values({ palavras: JSON.stringify(parsed.data.palavras) })
      .returning();
    res.json({ palavras: JSON.parse(created.palavras) });
  }
});

export default router;
