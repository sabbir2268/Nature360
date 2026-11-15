import "./config/env.js";

import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";

const PORT = Number(process.env.PORT || 5000);
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: CORS_ORIGIN.includes("*") ? true : CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "nature360-api",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found.", code: "not_found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  console.error("Unhandled API error:", error);
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

  console.log("Shutting down Nature360 API…");

  // Do not let a stuck connection keep the process alive forever.
  const forceExit = setTimeout(() => process.exit(exitCode || 1), 5000);
  forceExit.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error("MongoDB disconnect failed:", error);
  }

  process.exit(exitCode);
}

async function start() {
  try {
    await connectDB();

    if (!process.env.FIREBASE_API_KEY) {
      console.warn(
        "FIREBASE_API_KEY is not set — authenticated requests will fail until it is added to server/.env.",
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
