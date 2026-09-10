// Mirrors the schemas in swagger.json.

export type Role = "admin" | "teacher" | "student";
export type ClassStatus = "active" | "inactive" | "archived";

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  totalSubjects?: number;
}

export interface Subject {
  id: number;
  departmentId: number;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  department?: Department;
}

export interface ClassEntity {
  id: number;
  name: string;
  inviteCode: string;
  subjectId: number;
  teacherId: string;
  description?: string | null;
  bannerUrl?: string | null;
  bannerCldPubId?: string | null;
  capacity: number;
  status: ClassStatus;
  schedules: Schedule[];
  createdAt: string;
  updatedAt: string;
  subject?: Subject;
  teacher?: User;
}

export interface Enrollment {
  id: number;
  studentId: string;
  classId: number;
  enrolledAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  imageCldPubId?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
