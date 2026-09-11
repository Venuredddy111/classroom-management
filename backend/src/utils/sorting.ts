import { Request } from "express";

export function parseSort(req: Request): { field?: string; order: "asc" | "desc" } {
  const field = typeof req.query.sort === "string" ? req.query.sort : undefined;
  const order = req.query.order === "desc" ? "desc" : "asc";
  return { field, order };
}
