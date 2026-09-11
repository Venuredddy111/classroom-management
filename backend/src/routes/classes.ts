import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler, AppError } from "../utils/asyncHandler";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import { parseSort } from "../utils/sorting";

export const classesRouter = Router();

const scheduleSchema = z.object({
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const classCreateSchema = z.object({
  name: z.string().max(255),
  inviteCode: z.string().max(20),
  subjectId: z.number().int(),
  teacherId: z.string(),
  description: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  bannerCldPubId: z.string().nullable().optional(),
  capacity: z.number().int().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  schedules: z.array(scheduleSchema).optional(),
});

const classUpdateSchema = classCreateSchema.partial();
const enrollStudentSchema = z.object({ studentId: z.string().min(1) });

async function assertSubjectExists(subjectId: number) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw new AppError(404, "Subject not found");
}

async function assertTeacherExists(teacherId: string) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new AppError(404, "Teacher not found");
}

// GET /api/classes
classesRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const subjectId = req.query.subjectId ? Number(req.query.subjectId) : undefined;
    const teacherId = typeof req.query.teacherId === "string" ? req.query.teacherId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const subjectName = typeof req.query.subject === "string" ? req.query.subject : undefined;
    const teacherName = typeof req.query.teacher === "string" ? req.query.teacher : undefined;
    const createdFrom = typeof req.query.createdFrom === "string" ? new Date(req.query.createdFrom) : undefined;
    const createdTo = typeof req.query.createdTo === "string" ? new Date(req.query.createdTo) : undefined;
    const capacityStatus = typeof req.query.capacityStatus === "string" ? req.query.capacityStatus : undefined;

    let capacityIdFilter: number[] | undefined;
    if (capacityStatus === "near" || capacityStatus === "full") {
      const [allClasses, counts] = await Promise.all([
        prisma.class.findMany({ select: { id: true, capacity: true } }),
        prisma.enrollment.groupBy({ by: ["classId"], _count: true }),
      ]);
      const countMap = new Map(counts.map((c) => [c.classId, c._count]));
      capacityIdFilter = allClasses
        .filter((c) => {
          const enrolled = countMap.get(c.id) ?? 0;
          const ratio = c.capacity > 0 ? enrolled / c.capacity : 0;
          return capacityStatus === "full" ? ratio >= 1 : ratio >= 0.9;
        })
        .map((c) => c.id);
    }

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { inviteCode: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(teacherId ? { teacherId } : {}),
      ...(status ? { status: status as any } : {}),
      ...(subjectName ? { subject: { name: { contains: subjectName, mode: "insensitive" as const } } } : {}),
      ...(teacherName ? { teacher: { name: { contains: teacherName, mode: "insensitive" as const } } } : {}),
      ...((createdFrom || createdTo)
        ? { createdAt: { ...(createdFrom ? { gte: createdFrom } : {}), ...(createdTo ? { lte: createdTo } : {}) } }
        : {}),
      ...(capacityIdFilter ? { id: { in: capacityIdFilter } } : {}),
    };

    const { field: sortField, order } = parseSort(req);
    const allowedSort: Record<string, any> = {
      name: { name: order },
      capacity: { capacity: order },
      status: { status: order },
      createdAt: { createdAt: order },
      subject: { subject: { name: order } },
      teacher: { teacher: { name: order } },
    };
    const orderBy = (sortField && allowedSort[sortField]) || { createdAt: "desc" };

    const [rows, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { subject: true, teacher: true, _count: { select: { enrollments: true } } },
      }),
      prisma.class.count({ where }),
    ]);

    const data = rows.map(({ _count, ...c }) => ({ ...c, enrolledCount: _count.enrollments }));

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);

// POST /api/classes
classesRouter.post(
  "/",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const body = classCreateSchema.parse(req.body);
    await assertSubjectExists(body.subjectId);
    await assertTeacherExists(body.teacherId);

    const existingInvite = await prisma.class.findUnique({ where: { inviteCode: body.inviteCode } });
    if (existingInvite) throw new AppError(409, "Invite code already exists");

    const created = await prisma.class.create({ data: { ...body, schedules: body.schedules ?? [] } });
    res.status(201).json({ data: created });
  })
);

// GET /api/classes/invite/:code
classesRouter.get(
  "/invite/:code",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const cls = await prisma.class.findUnique({ where: { inviteCode: req.params.code } });
    if (!cls) throw new AppError(404, "Class not found");
    res.json({ data: cls });
  })
);

// GET /api/classes/:id
classesRouter.get(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher", "student"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        subject: { include: { department: true } },
        teacher: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!cls) throw new AppError(404, "Class not found");
    const { _count, ...rest } = cls;
    res.json({ data: { ...rest, enrolledCount: _count.enrollments } });
  })
);

// POST /api/classes/:id/enrollments
classesRouter.post(
  "/:id/enrollments",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const classId = Number(req.params.id);
    const { studentId } = enrollStudentSchema.parse(req.body);

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new AppError(404, "Class not found");

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) throw new AppError(404, "Student not found");
    if (student.role !== "student") throw new AppError(400, "User is not a student");

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    if (existing) throw new AppError(409, "Student already enrolled in class");

    const enrollment = await prisma.enrollment.create({
      data: { studentId, classId },
      include: { student: true },
    });
    res.status(201).json({ data: enrollment });
  })
);

// PUT /api/classes/:id
classesRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const body = classUpdateSchema.parse(req.body);

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Class not found");
    if (body.subjectId !== undefined) await assertSubjectExists(body.subjectId);
    if (body.teacherId !== undefined) await assertTeacherExists(body.teacherId);

    if (body.inviteCode && body.inviteCode !== existing.inviteCode) {
      const dupe = await prisma.class.findUnique({ where: { inviteCode: body.inviteCode } });
      if (dupe) throw new AppError(409, "Invite code already exists");
    }

    const updated = await prisma.class.update({ where: { id }, data: body });
    res.json({ data: updated });
  })
);

// DELETE /api/classes/:id
classesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "teacher"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Class not found");

    await prisma.class.delete({ where: { id } });
    res.json({ message: "Class deleted" });
  })
);

// GET /api/classes/:id/users
classesRouter.get(
  "/:id/users",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page, limit, skip, take } = getPagination(req);
    const role = typeof req.query.role === "string" ? req.query.role : undefined;

    const cls = await prisma.class.findUnique({ where: { id } });
    if (!cls) throw new AppError(404, "Class not found");

    if (role === "teacher") {
      const teacher = await prisma.user.findUnique({ where: { id: cls.teacherId } });
      const data = teacher ? [teacher] : [];
      return res.json({ data, pagination: buildPaginationMeta(1, limit, data.length) });
    }

    if (role === "student") {
      const where = { role: "student" as const, enrollments: { some: { classId: id } } };
      const [data, total] = await Promise.all([
        prisma.user.findMany({ where, skip, take, orderBy: { name: "asc" } }),
        prisma.user.count({ where }),
      ]);
      return res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
    }

    // No role filter: teacher + all enrolled students, paginated together.
    const teacher = await prisma.user.findUnique({ where: { id: cls.teacherId } });
    const studentWhere = { role: "student" as const, enrollments: { some: { classId: id } } };
    const students = await prisma.user.findMany({ where: studentWhere, orderBy: { name: "asc" } });
    const all = teacher ? [teacher, ...students] : students;
    const total = all.length;
    const data = all.slice(skip, skip + take);

    res.json({ data, pagination: buildPaginationMeta(page, limit, total) });
  })
);
