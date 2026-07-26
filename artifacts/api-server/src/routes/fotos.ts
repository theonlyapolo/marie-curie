import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, fotosTable, sistemaConfigTable } from "@workspace/db";
import {
  UploadFotoBody,
  UpdateFotoBody,
  UpdateFotoParams,
  DeleteFotoParams,
  ListFotosQueryParams,
  UploadArquivoBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Fotos aprovadas (público — para carrossel/telão)
router.get("/fotos/aprovadas", async (_req, res): Promise<void> => {
  const fotos = await db
    .select()
    .from(fotosTable)
    .where(eq(fotosTable.status, "aprovada"))
    .orderBy(sql`${fotosTable.criadaEm} DESC`);
  res.json(fotos.map(f => ({ ...f, criadaEm: f.criadaEm.toISOString() })));
});

// Listar todas (admin)
router.get("/fotos", requireAuth, async (req, res): Promise<void> => {
  const params = ListFotosQueryParams.safeParse(req.query);
  let query = db.select().from(fotosTable).$dynamic();

  if (params.success && params.data.status) {
    query = query.where(eq(fotosTable.status, params.data.status));
  }

  const fotos = await query.orderBy(sql`${fotosTable.criadaEm} DESC`);
  res.json(fotos.map(f => ({ ...f, criadaEm: f.criadaEm.toISOString() })));
});

// Upload de foto (visitante)
router.post("/fotos", async (req, res): Promise<void> => {
  const parsed = UploadFotoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Verificar aprovação automática
  const [config] = await db.select().from(sistemaConfigTable).limit(1);
  const status = config?.aprovacaoAutomatica ? "aprovada" : "pendente";

  const [foto] = await db
    .insert(fotosTable)
    .values({ ...parsed.data, status })
    .returning();

  res.status(201).json({ ...foto, criadaEm: foto.criadaEm.toISOString() });
});

// Atualizar status (admin)
router.patch("/fotos/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateFotoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateFotoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [foto] = await db
    .update(fotosTable)
    .set(body.data)
    .where(eq(fotosTable.id, params.data.id))
    .returning();

  if (!foto) {
    res.status(404).json({ error: "Foto não encontrada" });
    return;
  }

  res.json({ ...foto, criadaEm: foto.criadaEm.toISOString() });
});

// Excluir (admin)
router.delete("/fotos/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteFotoParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [foto] = await db
    .delete(fotosTable)
    .where(eq(fotosTable.id, params.data.id))
    .returning();

  if (!foto) {
    res.status(404).json({ error: "Foto não encontrada" });
    return;
  }

  res.sendStatus(204);
});

// Upload de arquivo base64
router.post("/upload", async (req, res): Promise<void> => {
  const parsed = UploadArquivoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dados, mimeType } = parsed.data;
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const filename = `foto_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  console.log(dados.substring(0, 50));
  const buffer = Buffer.from(dados, "base64");
  if (buffer.length > 10 * 1024 * 1024) {
    res.status(400).json({ error: "Imagem muito grande (máx 10MB)" });
    return;
  }

  fs.writeFileSync(filepath, buffer);
  req.log.info({ filename }, "Upload salvo");

  res.json({ url: `/uploads/${filename}` });
});

// Servir arquivos de upload
router.get("/uploads/:filename", (req, res): void => {
  const rawFilename = Array.isArray(req.params.filename)
    ? req.params.filename[0]
    : req.params.filename;
  const safe = path.basename(rawFilename);
  const filepath = path.join(UPLOADS_DIR, safe);
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: "Arquivo não encontrado" });
    return;
  }
  res.sendFile(filepath);
});

export default router;
