import "dotenv/config";
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

async function start() {
  try {
    await connectDB();

    if (!process.env.FIREBASE_API_KEY) {
      console.warn(
        "FIREBASE_API_KEY is not set — authenticated requests will fail until it is added to server/.env.",
      );
    }

    app.listen(PORT, () => {
      console.log(`Nature360 API listening on http://localhost:${PORT}`);
      console.log(`Allowed origins: ${CORS_ORIGIN.join(", ")}`);
    });
  } catch (error) {
    console.error("Failed to start Nature360 API:", error);
    process.exit(1);
  }
}

start();
