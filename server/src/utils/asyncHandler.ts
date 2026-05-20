import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Envolve um handler async para que erros caiam no middleware de erro
 * sem precisar de try/catch em toda rota.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Erro com status HTTP definido, usado nas validacoes das rotas. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
