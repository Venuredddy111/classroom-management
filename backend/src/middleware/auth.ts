import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, AuthUser } from "../lib/auth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Reads the better-auth session cookie and attaches req.user when present.
 * Never rejects the request itself — pair with requireAuth / requireRole
 * for routes that must be protected.
 */
export async function attachSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (session) {
      req.user = session.user as AuthUser;
    }
  } catch {
    // No valid session — leave req.user undefined.
  }
  next();
}

/** 401s any request without a valid session. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user.status !== "approved") {
    return res.status(403).json({
      error: req.user.status === "rejected" ? "Account rejected" : "Account pending approval",
      status: req.user.status,
    });
  }
  next();
}

/** 403s any authenticated request whose role isn't in the allowed list. */
export function requireRole(...roles: Array<"admin" | "teacher" | "student">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!roles.includes(req.user.role as any)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
