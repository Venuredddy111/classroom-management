import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/sorting";

export const enrollmentsRouter = Router();

const enrollmentCreateSchema = z.object({ classId: z.number().int() });
const enrollmentJoinSchema = z.object({ inviteCode: z.string() });
const enrollmentUpdateSchema = z.object({
  classId: z.number().int().optional(),
  studentId: z.string().optional(),
});

async function createEnrollment(studentId: string, classId: number) {
  const [student, cls] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.class.findUnique({ where: { id: classId } }),
  ]);
  if (!student) throw new AppError(404, "Student not found");
  if (!cls) throw new AppError(404, "Class not found");

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId, classId } },
  });
  if (existing) throw new AppError(409, "Student already enrolled in class");

  return prisma.enrollment.create({ data: { studentId, classId } });
}

// GET /api/enrollments
enrollmentsRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req);
    const classId = req.query.classId ? Number(req.query.classId) : undefined;
    const studentId = typeof req.query.studentId === "string" ? req.query.studentId : undefined;
    const enrolledFrom = typeof req.query.enrolledFrom === "string" ? new Date(req.query.enrolledFrom) : undefined;
    const enrolledTo = typeof req.query.enrolledTo === "string" ? new Date(req.query.enrolledTo) : undefined;

    const where = {
      ...(classId ? { classId } : {}),
      ...(studentId ? { studentId } : {}),
      ...((enrolledFrom || enrolledTo)
        ? { enrolledAt: { ...(enrolledFrom ? { gte: enrolledFrom } : {}), ...(enrolledTo ? { lte: enrolledTo } : {}) } }
        : {}),
    };

    const { field: sortField, order } = parseSort(req);
    const allowedSort: Record<string, any> = {
      enrolledAt: { enrolledAt: order },
      studentId: { studentId: order },
      classId: { classId: order },
      student: { student: { name: order } },
    };
    const orderBy = (sortField && allowedSort[sortField]) || { enrolledAt: "desc" };

    const [data, total] = await Promise.all([
      prisma.enrollment.findMany({ where, skip, take, orderBy, include: { student: true } }),
      prisma.enrollment.count({ where }),
    ]);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// POST /api/enrollments
enrollmentsRouter.post(
  "/",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const body = enrollmentCreateSchema.parse(req.body);
    const enrollment = await createEnrollment(req.user!.id, body.classId);
    res.status(201).json({ data: enrollment });
  })
);

// POST /api/enrollments/join
enrollmentsRouter.post(
  "/join",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const body = enrollmentJoinSchema.parse(req.body);
    const cls = await prisma.class.findUnique({ where: { inviteCode: body.inviteCode } });
    if (!cls) throw new AppError(404, "Class not found");

    const enrollment = await createEnrollment(req.user!.id, cls.id);
    res.status(201).json({ data: enrollment });
  })
);

// GET /api/enrollments/:id
enrollmentsRouter.get(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const enrollment = await prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) throw new AppError(404, "Enrollment not found");
    res.json({ data: enrollment });
  })
);

// PUT /api/enrollments/:id
enrollmentsRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const body = enrollmentUpdateSchema.parse(req.body);

    const existing = await prisma.enrollment.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Enrollment not found");

    const nextStudentId = body.studentId ?? existing.studentId;
    const nextClassId = body.classId ?? existing.classId;

    if (body.studentId) {
      const student = await prisma.user.findUnique({ where: { id: body.studentId } });
      if (!student) throw new AppError(404, "Student not found");
    }
    if (body.classId) {
      const cls = await prisma.class.findUnique({ where: { id: body.classId } });
      if (!cls) throw new AppError(404, "Class not found");
    }

    if (nextStudentId !== existing.studentId || nextClassId !== existing.classId) {
      const dupe = await prisma.enrollment.findUnique({
        where: { studentId_classId: { studentId: nextStudentId, classId: nextClassId } },
      });
      if (dupe) throw new AppError(409, "Student already enrolled in class");
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: { studentId: nextStudentId, classId: nextClassId },
    });
    res.json({ data: updated });
  })
);

// DELETE /api/enrollments/:id
enrollmentsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.enrollment.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Enrollment not found");

    await prisma.enrollment.delete({ where: { id } });
    res.json({ message: "Enrollment deleted" });
  })
);
