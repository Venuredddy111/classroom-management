import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get(
  "/stats",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      departmentCount,
      subjectCount,
      classCount,
      enrollmentCount,
      usersByRole,
      classesGroupedBySubject,
      allSubjects,
      allClassesForCapacity,
      enrollmentCountsByClass,
      enrollmentTrend,
      recentEnrollments,
      recentClasses,
      recentUsers,
    ] = await Promise.all([
      prisma.department.count(),
      prisma.subject.count(),
      prisma.class.count(),
      prisma.enrollment.count(),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.class.groupBy({ by: ["subjectId"], _count: true }),
      prisma.subject.findMany({ select: { id: true, department: { select: { name: true } } } }),
      prisma.class.findMany({ select: { id: true, capacity: true } }),
      prisma.enrollment.groupBy({ by: ["classId"], _count: true }),
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "enrolledAt") AS day, COUNT(*)::bigint AS count
        FROM "enrollment"
        WHERE "enrolledAt" >= ${since}
        GROUP BY day
        ORDER BY day ASC
      `,
      prisma.enrollment.findMany({ take: 5, orderBy: { enrolledAt: "desc" }, include: { student: true, class: true } }),
      prisma.class.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    ]);

    const subjectToDept = new Map(allSubjects.map((s) => [s.id, s.department.name]));
    const byDept = new Map<string, number>();
    for (const g of classesGroupedBySubject) {
      const deptName = subjectToDept.get(g.subjectId) ?? "Unknown";
      byDept.set(deptName, (byDept.get(deptName) ?? 0) + g._count);
    }
    const classesByDepartment = Array.from(byDept.entries()).map(([department, count]) => ({ department, count }));

    const countMap = new Map(enrollmentCountsByClass.map((c) => [c.classId, c._count]));
    const buckets = { under50: 0, mid: 0, near: 0, full: 0 };
    for (const c of allClassesForCapacity) {
      const enrolled = countMap.get(c.id) ?? 0;
      const ratio = c.capacity > 0 ? enrolled / c.capacity : 0;
      if (ratio >= 1) buckets.full++;
      else if (ratio >= 0.9) buckets.near++;
      else if (ratio >= 0.5) buckets.mid++;
      else buckets.under50++;
    }

    const activity = [
      ...recentEnrollments.map((e) => ({
        type: "enrollment" as const,
        at: e.enrolledAt,
        label: `${e.student.name} enrolled in ${e.class.name}`,
      })),
      ...recentClasses.map((c) => ({ type: "class" as const, at: c.createdAt, label: `Class "${c.name}" created` })),
      ...recentUsers.map((u) => ({ type: "user" as const, at: u.createdAt, label: `${u.name} joined as ${u.role}` })),
    ]
      .sort((a, b) => +new Date(b.at) - +new Date(a.at))
      .slice(0, 10);

    res.json({
      data: {
        totals: {
          departments: departmentCount,
          subjects: subjectCount,
          classes: classCount,
          enrollments: enrollmentCount,
          users: usersByRole.reduce((sum, r) => sum + r._count, 0),
        },
        usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
        classesByDepartment,
        capacityDistribution: [
          { bucket: "Under 50%", count: buckets.under50 },
          { bucket: "50-90%", count: buckets.mid },
          { bucket: "Near full (90-100%)", count: buckets.near },
          { bucket: "Full", count: buckets.full },
        ],
        enrollmentTrend: enrollmentTrend.map((row) => ({ date: row.day, count: Number(row.count) })),
        activity,
      },
    });
  })
);
