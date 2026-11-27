import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const SERVER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EMBEDDED_DB_PATH = path.join(SERVER_ROOT, ".data", "mongodb");

let embeddedServer = null;
let connectionEventsBound = false;

function embeddedFallbackEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.MONGODB_EMBEDDED_FALLBACK === "true";
}

function bindConnectionEvents() {
  if (connectionEventsBound) return;
  connectionEventsBound = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected.");
  });
}

/**
 * Starts a self-contained MongoDB instance for local development. Used when
 * the configured MONGODB_URI cannot be reached (for example when no local
 * mongod is installed or Atlas is not reachable). Data is kept on disk in
 * server/.data/mongodb so it survives restarts.
 */
async function connectEmbedded() {
  const { MongoMemoryServer } = await import("mongodb-memory-server");

  await mkdir(EMBEDDED_DB_PATH, { recursive: true });

  embeddedServer = await MongoMemoryServer.create({
    instance: {
      dbPath: EMBEDDED_DB_PATH,
      storageEngine: "wiredTiger",
    },
  });

  const uri = embeddedServer.getUri();

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "nature360",
    serverSelectionTimeoutMS: 15000,
  });

  console.warn(
    "MongoDB URI was unreachable. Started an embedded MongoDB for local development.",
  );
  console.warn(`Embedded data directory: ${EMBEDDED_DB_PATH}`);
  console.log(`MongoDB connected (embedded database: ${mongoose.connection.name})`);
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Add your MongoDB connection string to server/.env.",
    );
  }

  bindConnectionEvents();

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20,
      minPoolSize: 0,
      socketTimeoutMS: 45000,
      retryWrites: true,
    });

    console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
  } catch (error) {
    if (!embeddedFallbackEnabled()) throw error;

    console.warn(`Could not connect to MONGODB_URI: ${error.message}`);
    await connectEmbedded();
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (embeddedServer) {
    await embeddedServer.stop();
    embeddedServer = null;
  }
}
