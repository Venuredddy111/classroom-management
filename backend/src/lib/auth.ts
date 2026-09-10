import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || "http://localhost:5173").trim();

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
  baseURL: (process.env.BETTER_AUTH_URL || "http://localhost:8000").trim(),
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
