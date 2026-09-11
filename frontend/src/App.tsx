import { Refine, Authenticated } from "@refinedev/core";
import routerBindings, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { notificationProvider } from "./providers/notificationProvider";
import { AppLayout } from "@/components/layout/app-layout";
import { AppErrorComponent } from "@/components/app-error-component";
import { IndexRedirect } from "@/components/index-redirect";
import { RequireRole } from "@/components/require-role";

import { DashboardPage } from "./pages/dashboard";
import { ApprovalsList } from "./pages/approvals";
import { DepartmentList, DepartmentCreate, DepartmentEdit, DepartmentShow } from "./pages/departments";
import { SubjectList, SubjectCreate, SubjectEdit, SubjectShow } from "./pages/subjects";
import { ClassList, ClassCreate, ClassEdit, ClassShow } from "./pages/classes";
import { EnrollmentList, EnrollmentCreate, EnrollmentEdit, EnrollmentShow, JoinClass } from "./pages/enrollments";
import { UserList, UserCreate, UserEdit, UserShow } from "./pages/users";
import { Login } from "./pages/login";
import { Register } from "./pages/register";

function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider}
        authProvider={authProvider}
        routerProvider={routerBindings}
        notificationProvider={notificationProvider}
        resources={[
          {
            name: "dashboard",
            list: "/dashboard",
            meta: { label: "Dashboard" },
          },
          {
            name: "approvals",
            list: "/approvals",
            meta: { label: "Approvals" },
          },
          {
            name: "departments",
            list: "/departments",
            create: "/departments/create",
            edit: "/departments/edit/:id",
            show: "/departments/show/:id",
            meta: { label: "Departments" },
          },
          {
            name: "subjects",
            list: "/subjects",
            create: "/subjects/create",
            edit: "/subjects/edit/:id",
            show: "/subjects/show/:id",
            meta: { label: "Subjects" },
          },
          {
            name: "classes",
            list: "/classes",
            create: "/classes/create",
            edit: "/classes/edit/:id",
            show: "/classes/show/:id",
            meta: { label: "Classes" },
          },
          {
            name: "enrollments",
            list: "/enrollments",
            create: "/enrollments/create",
            edit: "/enrollments/edit/:id",
            show: "/enrollments/show/:id",
            meta: { label: "Enrollments" },
          },
          {
            name: "join-class",
            list: "/join-class",
            meta: { label: "Join a class" },
          },
          {
            name: "users",
            list: "/users",
            create: "/users/create",
            edit: "/users/edit/:id",
            show: "/users/show/:id",
            meta: { label: "Users" },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          projectId: "classroom-management",
        }}
      >
        <Routes>
          <Route
            element={
              <Authenticated key="authenticated-layout" fallback={<CatchAllNavigate to="/login" />}>
                <AppLayout />
              </Authenticated>
            }
          >
            <Route index element={<IndexRedirect />} />

            <Route
              path="/dashboard"
              element={
                <RequireRole roles={["admin"]}>
                  <DashboardPage />
                </RequireRole>
              }
            />

            <Route
              path="/approvals"
              element={
                <RequireRole roles={["admin", "teacher"]}>
                  <ApprovalsList />
                </RequireRole>
              }
            />

            <Route path="/departments">
              <Route index element={<DepartmentList />} />
              <Route path="create" element={<DepartmentCreate />} />
              <Route path="edit/:id" element={<DepartmentEdit />} />
              <Route path="show/:id" element={<DepartmentShow />} />
            </Route>

            <Route path="/subjects">
              <Route index element={<SubjectList />} />
              <Route path="create" element={<SubjectCreate />} />
              <Route path="edit/:id" element={<SubjectEdit />} />
              <Route path="show/:id" element={<SubjectShow />} />
            </Route>

            <Route path="/classes">
              <Route index element={<ClassList />} />
              <Route path="create" element={<ClassCreate />} />
              <Route path="edit/:id" element={<ClassEdit />} />
              <Route path="show/:id" element={<ClassShow />} />
            </Route>

            <Route path="/enrollments">
              <Route index element={<EnrollmentList />} />
              <Route path="create" element={<EnrollmentCreate />} />
              <Route path="edit/:id" element={<EnrollmentEdit />} />
              <Route path="show/:id" element={<EnrollmentShow />} />
            </Route>

            <Route path="/join-class" element={<JoinClass />} />

            <Route path="/users">
              <Route index element={<UserList />} />
              <Route path="create" element={<UserCreate />} />
              <Route path="edit/:id" element={<UserEdit />} />
              <Route path="show/:id" element={<UserShow />} />
            </Route>

            <Route path="*" element={<AppErrorComponent />} />
          </Route>

          <Route
            element={
              <Authenticated key="authenticated-auth-pages" fallback={<Outlet />}>
                <NavigateToResource resource="departments" />
              </Authenticated>
            }
          >
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>

        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
