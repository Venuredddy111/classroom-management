import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/sorting";

export const subjectsRouter = Router();

const subjectCreateSchema = z.object({
  departmentId: z.number().int(),
  name: z.string().max(255),
  code: z.string().max(50),
  description: z.string().nullable().optional(),
});

const subjectUpdateSchema = subjectCreateSchema.partial();

async function assertDepartmentExists(departmentId: number) {
  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) throw new AppError(404, "Department not found");
}

// GET /api/subjects
subjectsRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const departmentName = typeof req.query.department === "string" ? req.query.department : undefined;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(departmentName ? { department: { name: { contains: departmentName, mode: "insensitive" as const } } } : {}),
    };

    const { field: sortField, order } = parseSort(req);
    const allowedSort: Record<string, any> = {
      code: { code: order },
      name: { name: order },
      createdAt: { createdAt: order },
      department: { department: { name: order } },
    };
    const orderBy = (sortField && allowedSort[sortField]) || { name: "asc" };

    const [data, total] = await Promise.all([
      prisma.subject.findMany({ where, skip, take, orderBy, include: { department: true } }),
      prisma.subject.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// POST /api/subjects
subjectsRouter.post(
  "/",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const body = subjectCreateSchema.parse(req.body);
    await assertDepartmentExists(body.departmentId);

    const subject = await prisma.subject.create({ data: body, include: { department: true } });
    res.status(201).json({ data: subject });
  })
);

// GET /api/subjects/:id
subjectsRouter.get(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const subject = await prisma.subject.findUnique({ where: { id }, include: { department: true } });
    if (!subject) throw new AppError(404, "Subject not found");
    res.json({ data: subject });
  })
);

// PUT /api/subjects/:id
subjectsRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const body = subjectUpdateSchema.parse(req.body);

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Subject not found");
    if (body.departmentId !== undefined) await assertDepartmentExists(body.departmentId);

    const subject = await prisma.subject.update({ where: { id }, data: body, include: { department: true } });
    res.json({ data: subject });
  })
);

// DELETE /api/subjects/:id
subjectsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Subject not found");

    await prisma.subject.delete({ where: { id } });
    res.json({ message: "Subject deleted" });
  })
);

// GET /api/subjects/:id/classes
subjectsRouter.get(
  "/:id/classes",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page, limit, skip, take } = getPagination(req);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const where = { subjectId: id, ...(status ? { status: status as any } : {}) };
    const [data, total] = await Promise.all([
      prisma.class.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.class.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// GET /api/subjects/:id/users
subjectsRouter.get(
  "/:id/users",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page, limit, skip, take } = getPagination(req);
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const teacherClause = { role: "teacher" as const, classes: { some: { subjectId: id } } };
    const studentClause = { role: "student" as const, enrollments: { some: { class: { subjectId: id } } } };

    const roleWhere = role === "teacher" ? teacherClause : role === "student" ? studentClause : { OR: [teacherClause, studentClause] };
    const where = search ? { AND: [roleWhere, { name: { contains: search, mode: "insensitive" as const } }] } : roleWhere;

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.user.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);
