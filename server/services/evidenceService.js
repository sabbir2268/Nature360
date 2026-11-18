import { isValidEvidenceUrl } from "../utils/helpers.js";

export const ALLOWED_EVIDENCE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
];

/** Firebase Storage uploads are limited in the browser; base64 fallback stays small. */
export const MAX_STORAGE_EVIDENCE_BYTES = 25 * 1024 * 1024;
export const MAX_BASE64_EVIDENCE_BYTES = 2 * 1024 * 1024;
export const MAX_EVIDENCE_ITEMS = 6;

export function normalizeEvidence(input) {
  if (!input || typeof input !== "object") {
    return { error: "Attach a valid evidence file." };
  }

  const name = String(input.name || "").trim().slice(0, 200);
  const mimeType = String(input.mimeType || "").trim().toLowerCase();
  const size = Number(input.size) || 0;
  const url = String(input.url || "").trim();
  const path = String(input.path || "").trim().slice(0, 500);
  const data = String(input.data || "");

  if (!name) {
    return { error: "The evidence file needs a name." };
  }

  if (!ALLOWED_EVIDENCE_TYPES.includes(mimeType)) {
    return { error: "Evidence must be a JPG, PNG, WebP, GIF, MP4, WebM, MOV or PDF file." };
  }

  if (size <= 0 || size > MAX_STORAGE_EVIDENCE_BYTES) {
    return { error: "Evidence files must be larger than 0 bytes and no more than 25 MB." };
  }

  if (url) {
    if (!isValidEvidenceUrl(url)) {
      return { error: "Evidence must be uploaded through Firebase Storage." };
    }

    return {
      value: { name, mimeType, size, url, path, data: "", uploadedAt: new Date() },
    };
  }

  if (data) {
    if (size > MAX_BASE64_EVIDENCE_BYTES) {
      return { error: "Inline evidence is limited to 2 MB. Upload larger files to Firebase Storage." };
    }
    if (!data.startsWith("data:")) {
      return { error: "The evidence file could not be read. Please attach it again." };
    }
    return {
      value: { name, mimeType, size, url: "", path: "", data, uploadedAt: new Date() },
    };
  }

  return { error: "Upload the evidence file before submitting." };
}

export function normalizeEvidenceList(inputs) {
  if (!inputs) return { values: [] };
  if (!Array.isArray(inputs)) return { error: "Evidence must be sent as a list of files." };
  if (inputs.length > MAX_EVIDENCE_ITEMS) {
    return { error: `Attach no more than ${MAX_EVIDENCE_ITEMS} evidence files.` };
  }

  const values = [];
  for (const input of inputs) {
    const result = normalizeEvidence(input);
    if (result.error) return { error: result.error };
    values.push(result.value);
  }

  return { values };
}
