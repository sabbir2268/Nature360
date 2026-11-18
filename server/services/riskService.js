import Post from "../models/Post.js";
import { maxSeverityWeight, severityWeights } from "./settingsService.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export function riskLevelFromScore(score, rules) {
  if (score <= rules.lowMax) return "Low";
  if (score <= rules.moderateMax) return "Moderate";
  if (score <= rules.highMax) return "High";
  return "Critical";
}

/**
 * Rule-based Pollution Risk Score:
 * frequency + severity + recurrence + recent incidents.
 * Each component is normalised to 0-100 and combined using configurable weights.
 */
export function computeRiskScore({
  frequencyCount,
  recurrenceCount,
  avgSeverityWeight,
  maxWeight,
  daysSinceLatest,
  rules,
}) {
  const threshold = Math.max(1, Number(rules.frequencyWindowDays) || 30);

  const frequency = Math.min(100, (frequencyCount / threshold) * 100);
  const severity = Math.min(100, (avgSeverityWeight / Math.max(1, maxWeight)) * 100);
  const recurrence = Math.min(
    100,
    (Math.max(0, recurrenceCount - 1) / Math.max(1, threshold * 1.5)) * 100,
  );

  let recency = 0;
  if (daysSinceLatest !== null && daysSinceLatest <= 1) recency = 100;
  else if (daysSinceLatest <= 3) recency = 80;
  else if (daysSinceLatest <= 7) recency = 60;
  else if (daysSinceLatest <= 14) recency = 40;
  else if (daysSinceLatest <= 30) recency = 20;
  else if (daysSinceLatest <= 90) recency = 10;

  const weights = [
    [Number(rules.frequencyWeight) || 0, frequency],
    [Number(rules.severityWeight) || 0, severity],
    [Number(rules.recurrenceWeight) || 0, recurrence],
    [Number(rules.recencyWeight) || 0, recency],
  ];
  const totalWeight = weights.reduce((sum, [weight]) => sum + weight, 0) || 1;
  const score = weights.reduce((sum, [weight, value]) => sum + weight * value, 0) / totalWeight;

  return {
    score: Math.round(score),
    level: riskLevelFromScore(score, rules),
    components: {
      frequency: Math.round(frequency),
      severity: Math.round(severity),
      recurrence: Math.round(recurrence),
      recency: Math.round(recency),
    },
  };
}

function areaFilter(post) {
  if (post.area) return { area: post.area };
  if (post.location) return { location: post.location };
  if (post.coordinates?.lat !== null && post.coordinates?.lng !== null) {
    return {
      "coordinates.lat": {
        $gte: post.coordinates.lat - 0.01,
        $lte: post.coordinates.lat + 0.01,
      },
      "coordinates.lng": {
        $gte: post.coordinates.lng - 0.01,
        $lte: post.coordinates.lng + 0.01,
      },
    };
  }
  return {};
}

export async function calculateRiskForPost(post, settings) {
  const rules = settings.riskRules;
  const now = Date.now();
  const frequencySince = new Date(now - rules.frequencyWindowDays * DAY_MS);
  const recurrenceSince = new Date(now - rules.recurrenceWindowDays * DAY_MS);

  const base = {
    isDeleted: false,
    category: post.category,
    ...areaFilter(post),
  };

  const [frequencyCount, recurrenceCount, recentDocs] = await Promise.all([
    Post.countDocuments({ ...base, createdAt: { $gte: frequencySince } }),
    Post.countDocuments({ ...base, createdAt: { $gte: recurrenceSince } }),
    Post.find({ ...base, createdAt: { $gte: frequencySince } })
      .select("severity createdAt")
      .lean(),
  ]);

  const weights = severityWeights(settings);
  const maxWeight = maxSeverityWeight(settings);
  const avgSeverityWeight =
    recentDocs.length > 0
      ? recentDocs.reduce(
          (sum, doc) => sum + (weights.get(String(doc.severity || "").toLowerCase()) || 0),
          0,
        ) / recentDocs.length
      : weights.get(String(post.severity || "").toLowerCase()) || 0;

  const latest = recentDocs.reduce(
    (max, doc) => Math.max(max, new Date(doc.createdAt).getTime()),
    new Date(post.createdAt || Date.now()).getTime(),
  );
  const daysSinceLatest = Math.max(0, Math.floor((now - latest) / DAY_MS));

  return computeRiskScore({
    frequencyCount,
    recurrenceCount,
    avgSeverityWeight,
    maxWeight,
    daysSinceLatest,
    rules,
  });
}

export async function refreshPostRisk(post, settings) {
  const result = await calculateRiskForPost(post, settings);
  post.riskScore = result.score;
  post.riskLevel = result.level;
  return result;
}

export function buildHotspots(complaints, settings) {
  const groups = new Map();
  const weights = severityWeights(settings);
  const maxWeight = maxSeverityWeight(settings);

  complaints.forEach((complaint) => {
    const area =
      complaint.area ||
      complaint.location ||
      [
        Number(complaint.coordinates?.lat || 0).toFixed(3),
        Number(complaint.coordinates?.lng || 0).toFixed(3),
      ].join(", ");
    const key = `${complaint.category}::${area}`;
    const existing = groups.get(key) || {
      key,
      category: complaint.category,
      area,
      reportCount: 0,
      openCount: 0,
      severityTotal: 0,
      latestAt: null,
      latTotal: 0,
      lngTotal: 0,
      coordinateCount: 0,
      statuses: {},
    };

    existing.reportCount += 1;
    if (complaint.status !== "Resolved" && complaint.status !== "Rejected") {
      existing.openCount += 1;
    }
    existing.severityTotal += weights.get(String(complaint.severity || "").toLowerCase()) || 0;
    existing.statuses[complaint.status] = (existing.statuses[complaint.status] || 0) + 1;

    const created = new Date(complaint.createdAt).getTime();
    if (!existing.latestAt || created > existing.latestAt) existing.latestAt = created;

    if (complaint.coordinates?.lat !== null && complaint.coordinates?.lng !== null) {
      existing.latTotal += complaint.coordinates.lat;
      existing.lngTotal += complaint.coordinates.lng;
      existing.coordinateCount += 1;
    }

    groups.set(key, existing);
  });

  const windowDays = Math.max(1, Number(settings.riskRules.frequencyWindowDays) || 30);

  return Array.from(groups.values()).map((group) => {
    const avgSeverityWeight = group.severityTotal / Math.max(1, group.reportCount);
    const daysSinceLatest = group.latestAt
      ? Math.max(0, Math.floor((Date.now() - group.latestAt) / DAY_MS))
      : null;
    const score = computeRiskScore({
      frequencyCount: group.reportCount,
      recurrenceCount: group.reportCount,
      avgSeverityWeight,
      maxWeight,
      daysSinceLatest,
      rules: { ...settings.riskRules, frequencyWindowDays: windowDays },
    });

    return {
      key: group.key,
      category: group.category,
      area: group.area,
      reportCount: group.reportCount,
      openCount: group.openCount,
      riskScore: score.score,
      riskLevel: score.level,
      components: score.components,
      latestAt: group.latestAt ? new Date(group.latestAt).toISOString() : null,
      coordinates:
        group.coordinateCount > 0
          ? {
              lat: group.latTotal / group.coordinateCount,
              lng: group.lngTotal / group.coordinateCount,
            }
          : null,
      statuses: group.statuses,
    };
  });
}
