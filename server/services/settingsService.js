import Setting from "../models/Setting.js";
import { DEFAULT_CATEGORIES, DEFAULT_SEVERITIES } from "../models/Post.js";

export const DEFAULT_SETTINGS = {
  key: "global",
  categories: DEFAULT_CATEGORIES.map((name) => ({
    name,
    description: "",
    active: true,
  })),
  severityLevels: [
    { name: "Low", weight: 1, color: "emerald", active: true },
    { name: "Medium", weight: 2, color: "amber", active: true },
    { name: "High", weight: 3, color: "rose", active: true },
    { name: "Critical", weight: 4, color: "red", active: true },
  ],
  riskRules: {
    frequencyWeight: 30,
    severityWeight: 25,
    recurrenceWeight: 25,
    recencyWeight: 20,
    frequencyWindowDays: 30,
    recurrenceWindowDays: 90,
    lowMax: 39,
    moderateMax: 59,
    highMax: 79,
  },
  alertRules: {
    active: true,
    reportThreshold: 10,
    windowDays: 7,
    notifyRoles: ["Officer", "Admin"],
  },
};

function withDefaults(setting) {
  const raw = setting?.toObject ? setting.toObject() : setting || {};
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    categories:
      raw.categories?.length > 0
        ? raw.categories.map((category) => ({
            ...category,
            name: String(category.name || "").trim(),
          }))
        : DEFAULT_SETTINGS.categories,
    severityLevels:
      raw.severityLevels?.length > 0
        ? raw.severityLevels
        : DEFAULT_SETTINGS.severityLevels,
    riskRules: { ...DEFAULT_SETTINGS.riskRules, ...(raw.riskRules || {}) },
    alertRules: { ...DEFAULT_SETTINGS.alertRules, ...(raw.alertRules || {}) },
  };
}

export async function ensureSettings() {
  let setting = await Setting.findOne({ key: "global" });

  if (!setting) {
    setting = await Setting.create({
      ...DEFAULT_SETTINGS,
      severityLevels: DEFAULT_SETTINGS.severityLevels.map((level) => ({ ...level })),
      categories: DEFAULT_SETTINGS.categories.map((category) => ({ ...category })),
    });
    console.log("Seeded default environmental categories, severity levels, risk and alert rules.");
  }

  return setting;
}

export async function getSettings() {
  const setting = await Setting.findOne({ key: "global" });
  return withDefaults(setting);
}

export async function getPublicSettings() {
  const settings = await getSettings();

  return {
    categories: settings.categories.filter((category) => category.active),
    severityLevels: settings.severityLevels.filter((level) => level.active),
    riskRules: settings.riskRules,
    alertRules: {
      reportThreshold: settings.alertRules.reportThreshold,
      windowDays: settings.alertRules.windowDays,
      active: settings.alertRules.active,
    },
  };
}

export async function saveSettings(payload) {
  const current = await getSettings();
  const next = {
    key: "global",
    categories: mergeList(current.categories, payload.categories, "name"),
    severityLevels: mergeList(current.severityLevels, payload.severityLevels, "name"),
    riskRules: { ...current.riskRules, ...(payload.riskRules || {}) },
    alertRules: { ...current.alertRules, ...(payload.alertRules || {}) },
  };

  const setting = await Setting.findOneAndUpdate(
    { key: "global" },
    { $set: next },
    { new: true, upsert: true, runValidators: true },
  );

  return withDefaults(setting);
}

function mergeList(current, incoming, key) {
  if (!Array.isArray(incoming)) return current;

  const cleaned = incoming
    .map((item) => ({
      ...item,
      [key]: String(item?.[key] || "").trim(),
    }))
    .filter((item) => item[key]);

  return cleaned.length > 0 ? cleaned : current;
}

export function isCategoryAllowed(settings, category) {
  const name = String(category || "").trim().toLowerCase();
  return settings.categories.some(
    (item) => item.active && item.name.toLowerCase() === name,
  );
}

export function isSeverityAllowed(settings, severity) {
  const name = String(severity || "").trim().toLowerCase();
  return settings.severityLevels.some(
    (item) => item.active && item.name.toLowerCase() === name,
  );
}

export function severityWeights(settings) {
  const map = new Map();
  settings.severityLevels.forEach((level) => {
    map.set(level.name.toLowerCase(), Number(level.weight) || 0);
  });
  return map;
}

export function maxSeverityWeight(settings) {
  return Math.max(
    1,
    ...settings.severityLevels.map((level) => Number(level.weight) || 0),
  );
}
