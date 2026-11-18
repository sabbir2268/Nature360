import Alert from "../models/Alert.js";
import Post from "../models/Post.js";
import { notifyRoles } from "./notificationService.js";
import { computeRiskScore } from "./riskService.js";
import { maxSeverityWeight, severityWeights } from "./settingsService.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Automatic hotspot alert check. Called after a complaint is created or
 * verified. Creates at most one active alert per category + area per window.
 */
export async function checkHotspotAlert(post, settings) {
  const rules = settings.alertRules;
  if (!rules?.active) return null;

  const windowDays = Math.max(1, Number(rules.windowDays) || 7);
  const threshold = Math.max(1, Number(rules.reportThreshold) || 10);
  const since = new Date(Date.now() - windowDays * DAY_MS);

  const area = post.area || post.location || "";
  if (!area) return null;

  const match = {
    isDeleted: false,
    category: post.category,
    area,
    createdAt: { $gte: since },
  };

  const complaints = await Post.find(match).select("severity createdAt").lean();
  if (complaints.length < threshold) return null;

  const existing = await Alert.findOne({
    category: post.category,
    area,
    status: "Active",
    createdAt: { $gte: since },
  });
  if (existing) {
    existing.reportCount = complaints.length;
    await existing.save();
    return existing;
  }

  const weights = severityWeights(settings);
  const avgSeverityWeight =
    complaints.reduce(
      (sum, item) => sum + (weights.get(String(item.severity || "").toLowerCase()) || 0),
      0,
    ) / complaints.length;
  const latest = complaints.reduce(
    (max, item) => Math.max(max, new Date(item.createdAt).getTime()),
    Date.now(),
  );
  const score = computeRiskScore({
    frequencyCount: complaints.length,
    recurrenceCount: complaints.length,
    avgSeverityWeight,
    maxWeight: maxSeverityWeight(settings),
    daysSinceLatest: Math.max(0, Math.floor((Date.now() - latest) / DAY_MS)),
    rules: {
      ...settings.riskRules,
      frequencyWindowDays: windowDays,
    },
  });

  const alert = await Alert.create({
    category: post.category,
    area,
    coordinates: {
      lat: post.coordinates?.lat ?? null,
      lng: post.coordinates?.lng ?? null,
    },
    reportCount: complaints.length,
    windowDays,
    riskScore: score.score,
    riskLevel: score.level === "Low" ? "Moderate" : score.level,
    message: `${complaints.length} ${post.category} reports were recorded in ${area} within ${windowDays} days.`,
    status: "Active",
  });

  await notifyRoles(rules.notifyRoles?.length ? rules.notifyRoles : ["Officer", "Admin"], {
    type: "alert",
    title: `Hotspot alert: ${post.category} in ${area}`,
    message: alert.message,
    link: "/dashboard/alerts",
  });

  return alert;
}
