import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/sorting";

export const usersRouter = Router();

const userCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean().optional(),
  role: z.enum(["admin", "teacher", "student"]),
  image: z.string().nullable().optional(),
  imageCldPubId: z.string().nullable().optional(),
});

const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  role: z.enum(["admin", "teacher", "student"]).optional(),
  image: z.string().nullable().optional(),
  imageCldPubId: z.string().nullable().optional(),
});

// GET /api/users
usersRouter.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req);
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const createdFrom = typeof req.query.createdFrom === "string" ? new Date(req.query.createdFrom) : undefined;
    const createdTo = typeof req.query.createdTo === "string" ? new Date(req.query.createdTo) : undefined;

    const where = {
      ...(role ? { role: role as any } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...((createdFrom || createdTo)
        ? { createdAt: { ...(createdFrom ? { gte: createdFrom } : {}), ...(createdTo ? { lte: createdTo } : {}) } }
        : {}),
    };

    const { field: sortField, order } = parseSort(req);
    const allowedSort: Record<string, any> = {
      name: { name: order },
      email: { email: order },
      role: { role: order },
      createdAt: { createdAt: order },
    };
    const orderBy = (sortField && allowedSort[sortField]) || { name: "asc" };

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy }),
      prisma.user.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total), message: "Users retrieved successfully" });
  })
);

// POST /api/users
usersRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const body = userCreateSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new AppError(409, "Email already exists");

    const user = await prisma.user.create({
      data: {
        id: body.id ?? randomUUID(),
        name: body.name,
        email: body.email,
        emailVerified: body.emailVerified ?? false,
        role: body.role,
        image: body.image ?? null,
        imageCldPubId: body.imageCldPubId ?? null,
      },
    });

    res.status(201).json({ data: user, message: "User created successfully" });
  })
);

// GET /api/users/:id
usersRouter.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError(404, "User not found");
    res.json({ data: user, message: "User retrieved successfully" });
  })
);

// PUT /api/users/:id
usersRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const body = userUpdateSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "User not found");

    if (body.email && body.email !== existing.email) {
      const dupe = await prisma.user.findUnique({ where: { email: body.email } });
      if (dupe) throw new AppError(409, "Email already exists");
    }

    const user = await prisma.user.update({ where: { id: req.params.id }, data: body });
    res.json({ data: user, message: "User updated successfully" });
  })
);

// DELETE /api/users/:id
usersRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "User not found");

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ data: existing, message: "User deleted successfully" });
  })
);

// GET /api/users/:id/departments
usersRouter.get(
  "/:id/departments",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { page, limit, skip, take } = getPagination(req);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");

    const subjectIds = new Set<number>();
    if (user.role === "teacher") {
      const classes = await prisma.class.findMany({ where: { teacherId: userId }, select: { subjectId: true } });
      classes.forEach((c) => subjectIds.add(c.subjectId));
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: userId },
        select: { class: { select: { subjectId: true } } },
      });
      enrollments.forEach((e) => subjectIds.add(e.class.subjectId));
    }

    const subjects = await prisma.subject.findMany({
      where: { id: { in: Array.from(subjectIds) } },
      select: { departmentId: true },
    });
    const departmentIds = Array.from(new Set(subjects.map((s) => s.departmentId)));

    const where = { id: { in: departmentIds } };
    const [data, total] = await Promise.all([
      prisma.department.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.department.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// GET /api/users/:id/subjects
usersRouter.get(
  "/:id/subjects",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { page, limit, skip, take } = getPagination(req);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");

    const subjectIds = new Set<number>();
    if (user.role === "teacher") {
      const classes = await prisma.class.findMany({ where: { teacherId: userId }, select: { subjectId: true } });
      classes.forEach((c) => subjectIds.add(c.subjectId));
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: userId },
        select: { class: { select: { subjectId: true } } },
      });
      enrollments.forEach((e) => subjectIds.add(e.class.subjectId));
    }

    const where = { id: { in: Array.from(subjectIds) } };
    const [data, total] = await Promise.all([
      prisma.subject.findMany({ where, skip, take, orderBy: { name: "asc" }, include: { department: true } }),
      prisma.subject.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);
