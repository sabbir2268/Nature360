import "./config/env.js";

import compression from "compression";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import { connectDB, disconnectDB } from "./config/db.js";
import { ensureSettings } from "./services/settingsService.js";
import alertRoutes from "./routes/alerts.js";
import analyticsRoutes from "./routes/analytics.js";
import auditRoutes from "./routes/audit.js";
import dashboardRoutes from "./routes/dashboard.js";
import intelligenceRoutes from "./routes/intelligence.js";
import notificationRoutes from "./routes/notifications.js";
import postRoutes from "./routes/posts.js";
import reportRoutes from "./routes/reports.js";
import settingsRoutes from "./routes/settings.js";
import userRoutes from "./routes/users.js";

const PORT = Number(process.env.PORT || 5000);
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";

// Vite can move to the next free port (5174, 5175, ...) and browsers treat
// localhost and 127.0.0.1 as different origins. Accept any local origin in
// development so the dashboards can always reach the API.
function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);

  const normalized = origin.trim().replace(/\/+$/, "");
  const isLocalOrigin =
    IS_DEVELOPMENT && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized);

  if (CORS_ORIGIN.includes("*") || CORS_ORIGIN.includes(normalized) || isLocalOrigin) {
    return callback(null, true);
  }
  return callback(null, false);
}

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(compression());
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    ok: true,
    service: "nature360-api",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found.", code: "not_found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  console.error("Unhandled API error:", error);

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      error: "The request contained invalid data.",
      code: "invalid_data",
    });
  }

  return res.status(500).json({ error: "Something went wrong on the server.", code: "server_error" });
});

let server;
let shuttingDown = false;

function listen() {
  return new Promise((resolve, reject) => {
    const instance = app.listen(PORT);
    const onError = (error) => {
      instance.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      instance.off("error", onError);
      resolve(instance);
    };

    instance.once("error", onError);
    instance.once("listening", onListening);
  });
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("Shutting down Nature360 API...");

  const forceExit = setTimeout(() => process.exit(exitCode || 1), 5000);
  forceExit.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    await disconnectDB();
  } catch (error) {
    console.error("MongoDB disconnect failed:", error);
  }

  process.exit(exitCode);
}

async function start() {
  try {
    await connectDB();
    await ensureSettings();

    if (!process.env.FIREBASE_API_KEY) {
      console.warn(
        "FIREBASE_API_KEY is not set - authenticated requests will fail until it is added to server/.env.",
      );
    }

    server = await listen();

    server.on("error", (error) => {
      console.error("HTTP server error:", error);
      shutdown(1);
    });

    console.log(`Nature360 API listening on http://localhost:${PORT}`);
    console.log(`Allowed origins: ${CORS_ORIGIN.join(", ")}`);

    process.once("SIGINT", () => shutdown(0));
    process.once("SIGTERM", () => shutdown(0));
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Another Nature360 API or dev server is probably running.\n` +
          `Stop the other process or change PORT in server/.env, then try again.`,
      );
    } else {
      console.error("Failed to start Nature360 API:", error);
    }

    await shutdown(1);
  }
}

start();
