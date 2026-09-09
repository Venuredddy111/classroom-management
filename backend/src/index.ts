import AgentAPI from "apminsight";
AgentAPI.config()

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { attachSession } from "./middleware/auth";
import { arcjetProtect } from "./middleware/arcjet";
import { errorHandler } from "./middleware/errorHandler";
import { departmentsRouter } from "./routes/departments";
import { subjectsRouter } from "./routes/subjects";
import { classesRouter } from "./routes/classes";
import { enrollmentsRouter } from "./routes/enrollments";
import { usersRouter } from "./routes/users";

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

// attachSession only reads req.headers directly (via better-auth's
// fromNodeHeaders), so it doesn't need cookie-parser or express.json first.
// It runs before arcjetProtect so rate limits can be scaled by req.user.role.
app.use(attachSession);
app.use(arcjetProtect);

// better-auth needs the raw (un-parsed-by-express.json) request, so its
// handler is mounted before the JSON body parser. This covers every
// "Auth" path in swagger.json: get-session, sign-in/email, sign-up/email,
// sign-out, update-user, and anything else better-auth exposes.
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/departments", departmentsRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/classes", classesRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/users", usersRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Classroom Management API listening on http://localhost:${PORT}`);
});
