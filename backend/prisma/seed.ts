import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

const DEMO_PASSWORD = "Password123!";

async function signUp(email: string, name: string, role: "admin" | "teacher" | "student") {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const result = await auth.api.signUpEmail({
    body: { email, password: DEMO_PASSWORD, name, role } as any,
  });
  return prisma.user.findUniqueOrThrow({ where: { id: (result as any).user.id } });
}

async function main() {
  console.log("Seeding database...");

  const admin = await signUp("admin@classroom.com", "Ava Admin", "admin");
  const teacherMath = await signUp("teacher.math@classroom.com", "Tariq Mathews", "teacher");
  const teacherSci = await signUp("teacher.sci@classroom.com", "Priya Chen", "teacher");
  const studentA = await signUp("student.a@classroom.com", "Sam Alvarez", "student");
  const studentB = await signUp("student.b@classroom.com", "Bea Nguyen", "student");
  const studentC = await signUp("student.c@classroom.com", "Chris Okafor", "student");

  const scienceDept = await prisma.department.upsert({
    where: { code: "SCI" },
    update: {},
    create: { code: "SCI", name: "Science", description: "Natural and physical sciences" },
  });
  const mathDept = await prisma.department.upsert({
    where: { code: "MATH" },
    update: {},
    create: { code: "MATH", name: "Mathematics", description: "Pure and applied mathematics" },
  });

  const algebra = await prisma.subject.upsert({
    where: { code: "MATH101" },
    update: {},
    create: { code: "MATH101", name: "Algebra I", departmentId: mathDept.id, description: "Introductory algebra" },
  });
  const biology = await prisma.subject.upsert({
    where: { code: "SCI101" },
    update: {},
    create: { code: "SCI101", name: "Biology I", departmentId: scienceDept.id, description: "Introductory biology" },
  });

  const algebraClass = await prisma.class.upsert({
    where: { inviteCode: "ALG-2026" },
    update: {},
    create: {
      name: "Algebra I - Section A",
      inviteCode: "ALG-2026",
      subjectId: algebra.id,
      teacherId: teacherMath.id,
      description: "Morning section",
      capacity: 30,
      status: "active",
      schedules: [{ day: "Mon", startTime: "09:00", endTime: "10:00" }, { day: "Wed", startTime: "09:00", endTime: "10:00" }],
    },
  });
  const biologyClass = await prisma.class.upsert({
    where: { inviteCode: "BIO-2026" },
    update: {},
    create: {
      name: "Biology I - Section A",
      inviteCode: "BIO-2026",
      subjectId: biology.id,
      teacherId: teacherSci.id,
      description: "Afternoon section",
      capacity: 25,
      status: "active",
      schedules: [{ day: "Tue", startTime: "13:00", endTime: "14:30" }],
    },
  });

  for (const student of [studentA, studentB]) {
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId: algebraClass.id } },
      update: {},
      create: { studentId: student.id, classId: algebraClass.id },
    });
  }
  for (const student of [studentB, studentC]) {
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId: biologyClass.id } },
      update: {},
      create: { studentId: student.id, classId: biologyClass.id },
    });
  }

  console.log("\nSeed complete. Demo accounts (all use password: %s):", DEMO_PASSWORD);
  console.log(`  admin:   ${admin.email}`);
  console.log(`  teacher: ${teacherMath.email}`);
  console.log(`  teacher: ${teacherSci.email}`);
  console.log(`  student: ${studentA.email}`);
  console.log(`  student: ${studentB.email}`);
  console.log(`  student: ${studentC.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
