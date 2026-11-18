import { useEffect, useState } from "react";
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Layers,
  Plus,
  Radar,
  Save,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import { getAdminSettings, updateAdminSettings } from "../../settings/services/settingsServices";
import { runAlertScan } from "../../intelligence/services/intelligenceServices";
import { getApiErrorMessage } from "../../../lib/api";
import { cn } from "../../../utils/cn";

const NOTIFY_ROLES = ["Officer", "Admin", "Volunteer", "Citizen"];
const COLOR_OPTIONS = ["emerald", "amber", "rose", "red", "sky", "indigo", "violet"];

function Section({ icon: Icon, eyebrow, title, description, children, action }) {
  return (
    <div className="glass rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">{eyebrow}</p>
            <h2 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
              {title}
            </h2>
          </div>
        </div>
        {action}
      </div>
      {description && <p className="mt-2 text-[11px] leading-5 text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function NumberField({ id, label, value, onChange, min = 0, max = 1000, hint }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold text-forest-900">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-forest-900/10 bg-white/80 px-3 text-sm font-semibold text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
      />
      {hint && <p className="mt-1 text-[9px] leading-4 text-slate-400">{hint}</p>}
    </div>
  );
}

function AdminConfig() {
  const [settings, setSettings] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [severityDraft, setSeverityDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    let active = true;
    getAdminSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((loadError) => {
        if (active) setError(getApiErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateList = (key, index, patch) => {
    setSettings((current) => ({
      ...current,
      [key]: current[key].map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeFromList = (key, index) => {
    setSettings((current) => {
      if (current[key].length <= 1) return current;
      return { ...current, [key]: current[key].filter((_, position) => position !== index) };
    });
  };

  const addCategory = () => {
    const name = categoryDraft.trim();
    if (!name) return;
    setSettings((current) => ({
      ...current,
      categories: [...current.categories, { name, description: "", active: true }],
    }));
    setCategoryDraft("");
  };

  const addSeverity = () => {
    const name = severityDraft.trim();
    if (!name) return;
    setSettings((current) => ({
      ...current,
      severityLevels: [
        ...current.severityLevels,
        { name, weight: current.severityLevels.length + 1, color: "emerald", active: true },
      ],
    }));
    setSeverityDraft("");
  };

  const updateRule = (group, key, value) => {
    setSettings((current) => ({
      ...current,
      [group]: { ...current[group], [key]: value },
    }));
  };

  const toggleNotifyRole = (role) => {
    setSettings((current) => {
      const currentRoles = current.alertRules.notifyRoles || [];
      const nextRoles = currentRoles.includes(role)
        ? currentRoles.filter((item) => item !== role)
        : [...currentRoles, role];
      return {
        ...current,
        alertRules: { ...current.alertRules, notifyRoles: nextRoles },
      };
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFlash("");
    try {
      const saved = await updateAdminSettings({
        categories: settings.categories,
        severityLevels: settings.severityLevels.map((level) => ({
          ...level,
          weight: Number(level.weight) || 0,
        })),
        riskRules: {
          frequencyWeight: Number(settings.riskRules.frequencyWeight),
          severityWeight: Number(settings.riskRules.severityWeight),
          recurrenceWeight: Number(settings.riskRules.recurrenceWeight),
          recencyWeight: Number(settings.riskRules.recencyWeight),
          frequencyWindowDays: Number(settings.riskRules.frequencyWindowDays),
          recurrenceWindowDays: Number(settings.riskRules.recurrenceWindowDays),
          lowMax: Number(settings.riskRules.lowMax),
          moderateMax: Number(settings.riskRules.moderateMax),
          highMax: Number(settings.riskRules.highMax),
        },
        alertRules: {
          ...settings.alertRules,
          reportThreshold: Number(settings.alertRules.reportThreshold),
          windowDays: Number(settings.alertRules.windowDays),
        },
      });
      setSettings(saved);
      setFlash("Configuration saved. New complaints use these rules immediately.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setError("");
    try {
      const result = await runAlertScan();
      setFlash(result.message || "Hotspot scan completed.");
    } catch (scanError) {
      setError(getApiErrorMessage(scanError));
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white/60" />
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-56 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
        ))}
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="glass rounded-[1.75rem] px-6 py-14 text-center">
        <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
        <h2 className="mt-3 font-display text-lg font-extrabold text-forest-950">
          Configuration unavailable
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">{error}</p>
        <Button type="button" size="sm" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <PageHeader
        eyebrow="FR-14"
        title="System configuration"
        description="Manage complaint categories, severity weights, risk scoring and automatic hotspot alert rules."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleScan}
              disabled={scanning}
              className="gap-1.5"
            >
              <Radar className={cn("h-3.5 w-3.5", scanning && "animate-pulse")} />
              {scanning ? "Scanning..." : "Run alert scan"}
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save configuration"}
            </Button>
          </>
        }
      />

      {flash && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-[11px] font-semibold text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 leading-5">{flash}</p>
          <button type="button" onClick={() => setFlash("")} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1 leading-5">{error}</p>
          <button type="button" onClick={() => setError("")} className="text-rose-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Section
            icon={Layers}
            eyebrow="Complaints"
            title="Environmental categories"
            description="Active categories appear in the complaint form and officer verification panel."
          >
            <div className="space-y-2">
              {settings.categories.map((category, index) => (
                <div
                  key={`${category.name}-${index}`}
                  className="flex items-center gap-2 rounded-xl border border-forest-900/[0.07] bg-white/60 px-2.5 py-2"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(category.active)}
                    onChange={(event) => updateList("categories", index, { active: event.target.checked })}
                    className="h-3.5 w-3.5 rounded border-forest-900/20 text-emerald-600"
                    aria-label={`Toggle ${category.name}`}
                  />
                  <input
                    value={category.name}
                    onChange={(event) => updateList("categories", index, { name: event.target.value })}
                    className={cn(
                      "h-8 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 text-[11px] font-semibold text-forest-950 outline-none focus:border-emerald-400/60 focus:bg-white",
                      !category.active && "text-slate-400 line-through",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeFromList("categories", index)}
                    disabled={settings.categories.length <= 1}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                    aria-label={`Remove ${category.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={categoryDraft}
                onChange={(event) => setCategoryDraft(event.target.value)}
                placeholder="New category name"
                maxLength={80}
                className="h-10 min-w-0 flex-1 rounded-xl border border-forest-900/10 bg-white/80 px-3 text-[11px] text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCategory} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </Section>
        </Reveal>

        <Reveal delay={0.05}>
          <Section
            icon={TriangleAlert}
            eyebrow="Risk input"
            title="Severity levels"
            description="Weights feed the rule-based risk score. Higher weight means greater risk contribution."
          >
            <div className="space-y-2">
              {settings.severityLevels.map((level, index) => (
                <div
                  key={`${level.name}-${index}`}
                  className="grid grid-cols-[1fr_4.5rem_5.5rem_1.75rem] items-center gap-2 rounded-xl border border-forest-900/[0.07] bg-white/60 px-2.5 py-2"
                >
                  <input
                    value={level.name}
                    onChange={(event) => updateList("severityLevels", index, { name: event.target.value })}
                    className={cn(
                      "h-8 min-w-0 rounded-lg border border-transparent bg-transparent px-1.5 text-[11px] font-semibold text-forest-950 outline-none focus:border-emerald-400/60 focus:bg-white",
                      !level.active && "text-slate-400 line-through",
                    )}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={level.weight}
                    onChange={(event) =>
                      updateList("severityLevels", index, { weight: event.target.value })
                    }
                    className="h-8 rounded-lg border border-forest-900/10 bg-white px-2 text-[11px] font-bold text-forest-950 outline-none focus:border-emerald-400/70"
                    aria-label={`${level.name} weight`}
                  />
                  <select
                    value={level.color || "emerald"}
                    onChange={(event) => updateList("severityLevels", index, { color: event.target.value })}
                    className="h-8 rounded-lg border border-forest-900/10 bg-white px-1.5 text-[10px] font-semibold text-forest-950 outline-none focus:border-emerald-400/70"
                    aria-label={`${level.name} color`}
                  >
                    {COLOR_OPTIONS.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeFromList("severityLevels", index)}
                    disabled={settings.severityLevels.length <= 1}
                    className="grid h-7 w-7 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                    aria-label={`Remove ${level.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[9px] text-slate-400">Toggle a level active or inactive:</p>
              <div className="flex gap-1">
                {settings.severityLevels.map((level, index) => (
                  <button
                    key={`${level.name}-toggle-${index}`}
                    type="button"
                    onClick={() => updateList("severityLevels", index, { active: !level.active })}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[8px] font-bold",
                      level.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-400",
                    )}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={severityDraft}
                onChange={(event) => setSeverityDraft(event.target.value)}
                placeholder="New severity name"
                maxLength={40}
                className="h-10 min-w-0 flex-1 rounded-xl border border-forest-900/10 bg-white/80 px-3 text-[11px] text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSeverity} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </Section>
        </Reveal>
      </div>

      <Reveal delay={0.08}>
        <Section
          icon={ShieldAlert}
          eyebrow="FR-12"
          title="Risk scoring rules"
          description="Risk score = weighted frequency, severity, recurrence and recency, normalized to 100."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              id="risk-frequency"
              label="Frequency weight"
              min={0}
              max={100}
              value={settings.riskRules.frequencyWeight}
              onChange={(value) => updateRule("riskRules", "frequencyWeight", value)}
            />
            <NumberField
              id="risk-severity"
              label="Severity weight"
              min={0}
              max={100}
              value={settings.riskRules.severityWeight}
              onChange={(value) => updateRule("riskRules", "severityWeight", value)}
            />
            <NumberField
              id="risk-recurrence"
              label="Recurrence weight"
              min={0}
              max={100}
              value={settings.riskRules.recurrenceWeight}
              onChange={(value) => updateRule("riskRules", "recurrenceWeight", value)}
            />
            <NumberField
              id="risk-recency"
              label="Recency weight"
              min={0}
              max={100}
              value={settings.riskRules.recencyWeight}
              onChange={(value) => updateRule("riskRules", "recencyWeight", value)}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <NumberField
              id="risk-frequency-window"
              label="Frequency window (days)"
              min={1}
              max={365}
              value={settings.riskRules.frequencyWindowDays}
              onChange={(value) => updateRule("riskRules", "frequencyWindowDays", value)}
            />
            <NumberField
              id="risk-recurrence-window"
              label="Recurrence window (days)"
              min={1}
              max={365}
              value={settings.riskRules.recurrenceWindowDays}
              onChange={(value) => updateRule("riskRules", "recurrenceWindowDays", value)}
            />
            <NumberField
              id="risk-low"
              label="Low max score"
              min={0}
              max={99}
              value={settings.riskRules.lowMax}
              onChange={(value) => updateRule("riskRules", "lowMax", value)}
            />
            <NumberField
              id="risk-moderate"
              label="Moderate max score"
              min={1}
              max={99}
              value={settings.riskRules.moderateMax}
              onChange={(value) => updateRule("riskRules", "moderateMax", value)}
            />
            <NumberField
              id="risk-high"
              label="High max score"
              min={2}
              max={100}
              value={settings.riskRules.highMax}
              onChange={(value) => updateRule("riskRules", "highMax", value)}
            />
          </div>
          <p className="mt-3 rounded-xl border border-forest-900/[0.07] bg-white/50 px-3.5 py-2.5 text-[10px] leading-5 text-slate-500">
            Bands: 0–{settings.riskRules.lowMax} Low · {Number(settings.riskRules.lowMax) + 1}–
            {settings.riskRules.moderateMax} Moderate · {Number(settings.riskRules.moderateMax) + 1}–
            {settings.riskRules.highMax} High · above {settings.riskRules.highMax} Critical.
          </p>
        </Section>
      </Reveal>

      <Reveal delay={0.1}>
        <Section
          icon={BellRing}
          eyebrow="FR-11"
          title="Automatic hotspot alerts"
          description="When a category and area reach the threshold inside the window, the selected roles are notified."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="alert-active" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                Automatic alerts
              </label>
              <button
                type="button"
                id="alert-active"
                onClick={() => updateRule("alertRules", "active", !settings.alertRules.active)}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-xl border px-3 text-[11px] font-bold transition-colors",
                  settings.alertRules.active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500",
                )}
              >
                {settings.alertRules.active ? "Enabled" : "Disabled"}
                <span
                  className={cn(
                    "relative h-4 w-7 rounded-full transition-colors",
                    settings.alertRules.active ? "bg-emerald-500" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all",
                      settings.alertRules.active ? "left-3.5" : "left-0.5",
                    )}
                  />
                </span>
              </button>
            </div>
            <NumberField
              id="alert-threshold"
              label="Report threshold"
              min={1}
              max={1000}
              value={settings.alertRules.reportThreshold}
              onChange={(value) => updateRule("alertRules", "reportThreshold", value)}
            />
            <NumberField
              id="alert-window"
              label="Detection window (days)"
              min={1}
              max={365}
              value={settings.alertRules.windowDays}
              onChange={(value) => updateRule("alertRules", "windowDays", value)}
            />
            <div>
              <span className="mb-1.5 block text-[11px] font-bold text-forest-900">Notify roles</span>
              <div className="flex flex-wrap gap-1.5">
                {NOTIFY_ROLES.map((role) => {
                  const active = (settings.alertRules.notifyRoles || []).includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleNotifyRole(role)}
                      className={cn(
                        "rounded-full border px-2.5 py-1.5 text-[9px] font-bold transition-colors",
                        active
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-400",
                      )}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest-900/[0.07] bg-white/60 px-4 py-3">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" />
          Changes are audit-logged and apply to new risk calculations.
        </p>
        <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save configuration"}
        </Button>
      </div>
    </form>
  );
}

export default AdminConfig;
