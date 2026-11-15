import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

const POSTS_COLLECTION = "posts";

export const POST_STATUSES = ["Reported", "Under Review", "In Progress", "Resolved"];

export const POST_CATEGORIES = [
  "Illegal Dumping",
  "Water Pollution",
  "Air Pollution",
  "Deforestation",
  "Noise Pollution",
  "Other",
];

export const POST_SEVERITIES = ["Low", "Medium", "High"];

function normalizePost(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

export async function createPost({ userId, authorName, authorEmail, ...post }) {
  const reference = await addDoc(collection(db, POSTS_COLLECTION), {
    ...post,
    userId,
    authorName,
    authorEmail,
    status: POST_STATUSES[0],
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

/**
 * Sorted on the client so no composite Firestore index is required.
 */
export async function getUserPosts(userId) {
  const snapshot = await getDocs(
    query(collection(db, POSTS_COLLECTION), where("userId", "==", userId)),
  );

  return snapshot.docs
    .map(normalizePost)
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}
