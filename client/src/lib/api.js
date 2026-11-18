import { auth } from "../config/firebase";

const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/** Base URL of the Nature360 API, e.g. http://localhost:5000/api */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, code = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError("Your session expired. Please sign in again.", {
      status: 401,
      code: "unauthorized",
    });
  }

  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function handleResponse(response) {
  const data = await readBody(response);

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status}).`, {
      status: response.status,
      code: data?.code || "",
    });
  }

  return data;
}

/** JSON request against the API, authenticated with the Firebase ID token. */
export async function apiRequest(path, { method = "GET", body, signal, headers: extraHeaders } = {}) {
  const headers = { ...(await authHeaders()), ...(extraHeaders || {}) };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return handleResponse(response);
}

/** Authenticated binary download (used for the admin PDF report). */
export async function apiDownload(path, filename) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: await authHeaders(),
  });

  if (!response.ok) {
    const data = await readBody(response);
    throw new ApiError(data?.error || "The download could not be prepared.", {
      status: response.status,
      code: data?.code || "",
    });
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function getApiErrorMessage(error) {
  if (error instanceof ApiError) return error.message;

  if (error?.name === "TypeError") {
    return "Cannot reach the Nature360 server. Make sure the backend is running (cd server && npm run dev).";
  }

  return error?.message || "Something went wrong. Please try again.";
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.set(key, String(value));
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}
