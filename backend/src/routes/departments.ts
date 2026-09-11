import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/sorting";

export const departmentsRouter = Router();

const departmentCreateSchema = z.object({
  code: z.string().max(50),
  name: z.string().max(255),
  description: z.string().nullable().optional(),
});

const departmentUpdateSchema = departmentCreateSchema.partial();

// GET /api/departments
departmentsRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const { field: sortField, order } = parseSort(req);
    const allowedSort: Record<string, any> = {
      code: { code: order },
      name: { name: order },
      createdAt: { createdAt: order },
      totalSubjects: { subjects: { _count: order } },
    };
    const orderBy = (sortField && allowedSort[sortField]) || { name: "asc" };

    const [rows, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { _count: { select: { subjects: true } } },
      }),
      prisma.department.count({ where }),
    ]);

    const data = rows.map(({ _count, ...dept }) => ({ ...dept, totalSubjects: _count.subjects }));

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// POST /api/departments
departmentsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const body = departmentCreateSchema.parse(req.body);
    const department = await prisma.department.create({ data: body });
    res.status(201).json({ data: department });
  })
);

// GET /api/departments/:id
departmentsRouter.get(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) throw new AppError(404, "Department not found");

    const [subjects, classes, enrolledStudents] = await Promise.all([
      prisma.subject.count({ where: { departmentId: id } }),
      prisma.class.count({ where: { subject: { departmentId: id } } }),
      prisma.enrollment
        .findMany({
          where: { class: { subject: { departmentId: id } } },
          select: { studentId: true },
          distinct: ["studentId"],
        })
        .then((rows) => rows.length),
    ]);

    res.json({
      data: {
        department,
        totals: { subjects, classes, enrolledStudents },
      },
    });
  })
);

// PUT /api/departments/:id
departmentsRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const body = departmentUpdateSchema.parse(req.body);

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Department not found");

    const department = await prisma.department.update({ where: { id }, data: body });
    res.json({ data: department });
  })
);

// DELETE /api/departments/:id
departmentsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Department not found");

    await prisma.department.delete({ where: { id } });
    res.json({ message: "Department deleted" });
  })
);

// GET /api/departments/:id/classes
departmentsRouter.get(
  "/:id/classes",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page, limit, skip, take } = getPagination(req);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const where = { subject: { departmentId: id }, ...(status ? { status: status as any } : {}) };

    const [data, total] = await Promise.all([
      prisma.class.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.class.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// GET /api/departments/:id/subjects
departmentsRouter.get(
  "/:id/subjects",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page, limit, skip, take } = getPagination(req);

    const where = { departmentId: id };
    const [data, total] = await Promise.all([
      prisma.subject.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.subject.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// GET /api/departments/:id/users
departmentsRouter.get(
  "/:id/users",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page, limit, skip, take } = getPagination(req);
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const teacherClause = { role: "teacher" as const, classes: { some: { subject: { departmentId: id } } } };
    const studentClause = { role: "student" as const, enrollments: { some: { class: { subject: { departmentId: id } } } } };

    const roleWhere = role === "teacher" ? teacherClause : role === "student" ? studentClause : { OR: [teacherClause, studentClause] };

    const where = search ? { AND: [roleWhere, { name: { contains: search, mode: "insensitive" as const } }] } : roleWhere;

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { name: "asc" } }),
      prisma.user.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);
