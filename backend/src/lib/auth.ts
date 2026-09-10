import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || "http://localhost:5173").trim();
const BETTER_AUTH_URL = (process.env.BETTER_AUTH_URL || "http://localhost:8000").trim();

// Locally, frontend and backend are both on "localhost" (just different
// ports), so they're already same-site and default cookie behavior works.
// In production, the frontend (Vercel) and backend (Render) are genuinely
// different domains — cross-site — so the session cookie needs
// SameSite=None (paired with Secure) or the browser silently drops it on
// every cross-origin fetch after login.
const isCrossSiteDeployment = BETTER_AUTH_URL.startsWith("https://");

/**
 * better-auth instance. Mounted at /api/auth/* in src/index.ts, which is
 * where all of the "Auth" endpoints in swagger.json (get-session,
 * sign-in/email, sign-up/email, sign-out, update-user) come from.
 *
 * `role` and `imageCldPubId` are declared as additional fields so they
 * round-trip through sign-up / sign-in / get-session / update-user exactly
 * like the rest of the User schema in swagger.json.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // seconds
    },
  },
  trustedOrigins: [CLIENT_ORIGIN],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  advanced: isCrossSiteDeployment
    ? { defaultCookieAttributes: { sameSite: "none", secure: true } }
    : undefined,
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
