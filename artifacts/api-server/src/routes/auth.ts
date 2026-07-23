import { Router, type IRouter } from "express";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_SENHA = process.env.ADMIN_SENHA ?? "marie2024";

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { usuario, senha } = parsed.data;

  if (usuario !== ADMIN_USER || senha !== ADMIN_SENHA) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  (req.session as any).usuario = usuario;
  req.log.info({ usuario }, "Login realizado");
  res.json({ usuario });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const usuario = (req.session as any)?.usuario;
  if (!usuario) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  res.json({ usuario });
});

export default router;
