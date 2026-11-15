import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Load server/.env no matter which directory the process was started from.
const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(serverDir, ".env") });

// Also allow a .env in the current working directory (without overriding the
// values loaded from server/.env above).
dotenv.config();
