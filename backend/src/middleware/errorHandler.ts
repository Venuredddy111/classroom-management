import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/asyncHandler";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: `Duplicate value for ${(err.meta?.target as string[])?.join(", ") ?? "field"}` });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Resource not found" });
    }
    if (err.code === "P2003" || err.code === "P2014") {
      return res.status(409).json({ error: "Cannot delete: this record has related data" });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
