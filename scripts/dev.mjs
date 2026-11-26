import { spawn } from "node:child_process";
import path from "node:path";

// Start the API and the web app together. The dashboards read their data from
// the API, so running only the client leaves every dashboard empty.
const npmCli = path.join(
  path.dirname(process.execPath),
  "node_modules",
  "npm",
  "bin",
  "npm-cli.js",
);
const options = { cwd: process.cwd(), stdio: "inherit" };

const children = [
  spawn(process.execPath, [npmCli, "--prefix", "server", "run", "dev"], options),
  spawn(process.execPath, [npmCli, "--prefix", "client", "run", "dev"], options),
];

let shuttingDown = false;

function stopAll(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child.exitCode === null && !child.killed) {
      try {
        child.kill(signal);
      } catch {
        // The process may already be gone.
      }
    }
  }
}

process.once("SIGINT", () => stopAll("SIGINT"));
process.once("SIGTERM", () => stopAll("SIGTERM"));

let remaining = children.length;
for (const child of children) {
  child.once("exit", (code) => {
    remaining -= 1;
    if (remaining === 0) {
      stopAll();
      process.exit(code || 0);
    }
  });
}
