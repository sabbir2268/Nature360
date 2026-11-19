import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "../config/firebase";

export const MAX_EVIDENCE_BYTES = 25 * 1024 * 1024;
export const MAX_INLINE_BYTES = 2 * 1024 * 1024;

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

export const ALLOW_INLINE_EVIDENCE = import.meta.env.VITE_ALLOW_INLINE_EVIDENCE === "true";

export function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateEvidenceFile(file) {
  if (!file) return "Choose a file first.";

  if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, WebP, GIF, MP4, WebM, MOV or PDF file.";
  }

  if (file.size > MAX_EVIDENCE_BYTES) {
    return `The file is too large. Maximum size is ${formatFileSize(MAX_EVIDENCE_BYTES)}.`;
  }

  return "";
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
}

function safeName(name) {
  return String(name || "evidence")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-120);
}

/**
 * Uploads a complaint/investigation file to Firebase Storage and returns the
 * metadata the API stores against the record.
 *
 * For local development without a configured bucket, set
 * VITE_ALLOW_INLINE_EVIDENCE=true to fall back to a small base64 payload.
 */
export async function uploadEvidence(file, folder = "complaints") {
  const validationError = validateEvidenceFile(file);
  if (validationError) throw new Error(validationError);

  if (ALLOW_INLINE_EVIDENCE) {
    if (file.size > MAX_INLINE_BYTES) {
      throw new Error("Inline evidence is limited to 2 MB. Configure Firebase Storage for larger files.");
    }

    const data = await readAsDataUrl(file);
    return {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url: "",
      path: "",
      data,
    };
  }

  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in again before uploading evidence.");

  const path = `${folder}/${user.uid}/${Date.now()}-${safeName(file.name)}`;
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, file, { contentType: file.type });
  const url = await getDownloadURL(objectRef);

  return {
    name: file.name,
    mimeType: file.type,
    size: file.size,
    url,
    path,
  };
}

export async function uploadEvidenceList(files, folder = "complaints") {
  const items = [];
  for (const file of files) {
    items.push(await uploadEvidence(file, folder));
  }
  return items;
}
