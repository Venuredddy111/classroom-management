import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const searchRouter = Router();

const LIMIT = 5;

// GET /api/search?q=...
searchRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length < 2) return res.json({ data: {} });

    const role = req.user!.role;
    const contains = { contains: q, mode: "insensitive" as const };
    const tasks: Record<string, Promise<any>> = {};

    tasks.departments = prisma.department.findMany({
      where: { OR: [{ name: contains }, { code: contains }] },
      take: LIMIT,
      select: { id: true, name: true, code: true },
    });
    tasks.subjects = prisma.subject.findMany({
      where: { OR: [{ name: contains }, { code: contains }] },
      take: LIMIT,
      select: { id: true, name: true, code: true },
    });
    tasks.classes = prisma.class.findMany({
      where: { OR: [{ name: contains }, { inviteCode: contains }] },
      take: LIMIT,
      select: { id: true, name: true, inviteCode: true },
    });

    if (role === "admin") {
      tasks.users = prisma.user.findMany({
        where: { OR: [{ name: contains }, { email: contains }] },
        take: LIMIT,
        select: { id: true, name: true, email: true },
      });
    }

    const keys = Object.keys(tasks);
    const values = await Promise.all(Object.values(tasks));
    const data = Object.fromEntries(keys.map((k, i) => [k, values[i]]));

    res.json({ data });
  })
);
