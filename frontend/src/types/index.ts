// Mirrors the schemas in swagger.json.

export type Role = "admin" | "teacher" | "student";
export type UserStatus = "pending" | "approved" | "rejected";
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
  enrolledCount?: number;
}

export interface Enrollment {
  id: number;
  studentId: string;
  classId: number;
  enrolledAt: string;
  updatedAt: string;
  student?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  imageCldPubId?: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totals: { departments: number; subjects: number; classes: number; enrollments: number; users: number };
  usersByRole: { role: Role; count: number }[];
  classesByDepartment: { department: string; count: number }[];
  capacityDistribution: { bucket: string; count: number }[];
  enrollmentTrend: { date: string; count: number }[];
  activity: { type: "enrollment" | "class" | "user"; at: string; label: string }[];
}

export interface SearchResults {
  departments?: { id: number; name: string; code: string }[];
  subjects?: { id: number; name: string; code: string }[];
  classes?: { id: number; name: string; inviteCode: string }[];
  users?: { id: string; name: string; email: string }[];
}
