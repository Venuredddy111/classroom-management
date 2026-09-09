import type { AuthProvider } from "@refinedev/core";
import type { Role } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${API_URL}/auth${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Request failed");
  }
  return json;
}

async function getSession() {
  const res = await fetch(`${API_URL}/auth/get-session`, { credentials: "include" });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      await postJson("/sign-in/email", { email, password });
      return { success: true, redirectTo: "/" };
    } catch (error) {
      return {
        success: false,
        error: { name: "LoginError", message: error instanceof Error ? error.message : "Invalid credentials" },
      };
    }
  },

  register: async ({ email, password, name, role }) => {
    try {
      await postJson("/sign-up/email", { email, password, name, role: role || "student" });
      return { success: true, redirectTo: "/" };
    } catch (error) {
      return {
        success: false,
        error: { name: "RegisterError", message: error instanceof Error ? error.message : "Could not register" },
      };
    }
  },

  logout: async () => {
    await postJson("/sign-out", {});
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const session = await getSession();
    if (session?.user) return { authenticated: true };
    return { authenticated: false, redirectTo: "/login" };
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },

  getIdentity: async () => {
    const session = await getSession();
    if (!session?.user) return null;
    return { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role };
  },
};
