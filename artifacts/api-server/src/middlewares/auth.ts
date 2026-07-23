import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const usuario = (req.session as any)?.usuario;
  if (!usuario) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  next();
}
