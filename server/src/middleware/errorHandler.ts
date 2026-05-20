import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/asyncHandler";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados invalidos.",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error("[erro nao tratado]", err);
  return res.status(500).json({ error: "Erro interno do servidor." });
}
