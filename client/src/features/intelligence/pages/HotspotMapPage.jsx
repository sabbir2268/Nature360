import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Flame,
  Layers,
  MapPinned,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/SelectField";
import TextField from "../../../components/ui/TextField";
import EmptyState from "../../../components/ui/EmptyState";
import LeafletMap from "../../../components/maps/LeafletMap";
import { RiskBadge } from "../../../components/ui/Badge";
import { getAreas, getHotspots } from "../services/intelligenceServices";
import { getPublicSettings } from "../../settings/services/settingsServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";
import { hasCoordinates } from "../../../utils/geo";
import { useAuth } from "../../auth/hooks/useAuth";

const riskColors = {
  Low: "#10b981",
  Moderate: "#f59e0b",
  High: "#f97316",
  Critical: "#dc2626",
};

const defaultFilters = {
  area: "",
  category: "All",
  severity: "All",
  riskLevel: "All",
  minReports: "1",
};

function HotspotMapPage({ embedded = false }) {
  const { role } = useAuth();
  const [hotspots, setHotspots] = useState([]);
  const [meta, setMeta] = useState({ total: 0, scannedComplaints: 0, alertRules: null });
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [areaDraft, setAreaDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHotspots(filters);
      setHotspots(data.hotspots || []);
      setMeta({
        total: data.total || 0,
        scannedComplaints: data.scannedComplaints || 0,
        alertRules: data.alertRules || null,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    Promise.all([
      getAreas().catch(() => []),
      getPublicSettings().catch(() => null),
    ]).then(([nextAreas, settings]) => {
      setAreas(nextAreas);
      if (settings) {
        setCategories(settings.categories.map((item) => item.name));
        setSeverities(settings.severityLevels.map((item) => item.name));
      }
    });
  }, []);

  const markers = useMemo(
    () =>
      hotspots
        .filter((hotspot) => hasCoordinates(hotspot.coordinates))
        .map((hotspot) => ({
          id: hotspot.key,
          lat: Number(hotspot.coordinates.lat),
          lng: Number(hotspot.coordinates.lng),
          label: `${hotspot.area} · ${hotspot.category}`,
          popup: `<strong>${hotspot.area}</strong><br/>${hotspot.category}<br/>${hotspot.reportCount} reports · risk ${hotspot.riskScore}/100 (${hotspot.riskLevel})`,
          color: riskColors[hotspot.riskLevel] || riskColors.Low,
          radius: 8 + Math.min(12, hotspot.reportCount),
        })),
    [hotspots],
  );

  const summary = useMemo(() => {
    const counts = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    hotspots.forEach((hotspot) => {
      counts[hotspot.riskLevel] = (counts[hotspot.riskLevel] || 0) + 1;
    });
    const reports = hotspots.reduce((sum, hotspot) => sum + hotspot.reportCount, 0);
    return { ...counts, reports };
  }, [hotspots]);

  const headerActions = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={load}
        disabled={loading}
        className="gap-1.5"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        Refresh
      </Button>
      {!embedded && (
        <Button to={PATHS.ALERTS} size="sm" className="gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          Alerts
        </Button>
      )}
    </>
  );

  return (
    <div className="space-y-5">
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
              FR-12
            </p>
            <h2 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
              Environmental hotspots
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">{headerActions}</div>
        </div>
      ) : (
        <PageHeader
          eyebrow="FR-12"
          title="Environmental hotspots"
          description="Rule-based clustering groups complaints by category and area to expose repeat pollution and high-risk locations."
          actions={headerActions}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Hotspot groups", value: meta.total, icon: Layers, tone: "text-emerald-700 bg-emerald-500/10" },
          { label: "Complaints scanned", value: meta.scannedComplaints, icon: Search, tone: "text-sky-700 bg-sky-500/10" },
          { label: "Reports grouped", value: summary.reports, icon: TrendingUp, tone: "text-indigo-700 bg-indigo-500/10" },
          { label: "Critical hotspots", value: summary.Critical, icon: Flame, tone: "text-rose-700 bg-rose-500/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Reveal key={stat.label}>
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {stat.label}
                  </p>
                  <span className={cn("grid h-7 w-7 place-items-center rounded-lg", stat.tone)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-1.5 font-display text-2xl font-extrabold text-forest-950">
                  {stat.value}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div className="glass rounded-[1.75rem] p-4 sm:p-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setFilters((current) => ({ ...current, area: areaDraft.trim() }));
            }}
            className="flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <TextField
                id="hotspot-area"
                label="Area filter"
                icon={MapPinned}
                placeholder="e.g. Mirpur 10"
                list="hotspot-area-options"
                value={areaDraft}
                onChange={(event) => setAreaDraft(event.target.value)}
              />
              <datalist id="hotspot-area-options">
                {areas.map((area) => (
                  <option key={area} value={area} />
                ))}
              </datalist>
            </div>
            <Button type="submit" className="gap-1.5">
              <Search className="h-4 w-4" />
              Apply area
            </Button>
          </form>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              id="hotspot-category"
              label="Category"
              options={["All", ...categories]}
              value={filters.category}
              onChange={(event) =>
                setFilters((current) => ({ ...current, category: event.target.value }))
              }
            />
            <SelectField
              id="hotspot-severity"
              label="Severity"
              options={["All", ...severities]}
              value={filters.severity}
              onChange={(event) =>
                setFilters((current) => ({ ...current, severity: event.target.value }))
              }
            />
            <SelectField
              id="hotspot-risk"
              label="Risk level"
              options={["All", "Low", "Moderate", "High", "Critical"]}
              value={filters.riskLevel}
              onChange={(event) =>
                setFilters((current) => ({ ...current, riskLevel: event.target.value }))
              }
            />
            <SelectField
              id="hotspot-min"
              label="Minimum reports"
              options={["1", "2", "3", "5", "10"]}
              value={filters.minReports}
              onChange={(event) =>
                setFilters((current) => ({ ...current, minReports: event.target.value }))
              }
            />
          </div>

          {meta.alertRules && (
            <p className="mt-3 border-t border-forest-900/[0.07] pt-3 text-[10px] font-medium text-slate-500">
              Automatic alert rule: {meta.alertRules.reportThreshold}+ reports in {meta.alertRules.windowDays} days ·{" "}
              <span className={meta.alertRules.active ? "text-emerald-700" : "text-rose-600"}>
                {meta.alertRules.active ? "active" : "disabled"}
              </span>
            </p>
          )}
        </div>
      </Reveal>

      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="min-w-0 flex-1">{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={load}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="glass rounded-[1.75rem] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    OpenStreetMap
                  </p>
                  <h2 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                    Hotspot map
                  </h2>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {markers.length} mapped
                </span>
              </div>
              <div className="mt-3">
                {loading ? (
                  <div className="h-[420px] animate-pulse rounded-2xl bg-white/50" />
                ) : markers.length ? (
                  <LeafletMap markers={markers} height="420px" />
                ) : (
                  <div className="grid h-[420px] place-items-center rounded-2xl border border-dashed border-forest-900/15 bg-white/40 text-center">
                    <div>
                      <MapPinned className="mx-auto h-7 w-7 text-slate-300" />
                      <p className="mt-2 text-[11px] font-semibold text-slate-500">
                        No geotagged hotspots for these filters.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(riskColors).map(([level, color]) => (
                  <span key={level} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {level}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="glass rounded-[1.75rem] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                  Ranked hotspots
                </h2>
                <span className="text-[10px] font-semibold text-slate-400">{hotspots.length} groups</span>
              </div>

              {loading ? (
                <div className="mt-3 space-y-2">
                  {[0, 1, 2, 3].map((key) => (
                    <div key={key} className="h-20 animate-pulse rounded-xl bg-white/50" />
                  ))}
                </div>
              ) : hotspots.length === 0 ? (
                <EmptyState
                  icon={Flame}
                  title="No hotspots found"
                  description="Hotspots appear when complaints share a category and area. Adjust the filters or wait for more reports."
                  className="mt-3 border-0 bg-transparent py-8"
                />
              ) : (
                <ul className="thin-scrollbar mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                  {hotspots.map((hotspot, index) => (
                    <li
                      key={hotspot.key}
                      className="rounded-xl border border-forest-900/[0.07] bg-white/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-forest-950">
                            {index + 1}. {hotspot.area}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">{hotspot.category}</p>
                        </div>
                        <RiskBadge level={hotspot.riskLevel} />
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-forest-900/[0.04] px-1 py-1.5">
                          <p className="font-display text-sm font-extrabold text-forest-950">
                            {hotspot.riskScore}
                          </p>
                          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Risk
                          </p>
                        </div>
                        <div className="rounded-lg bg-forest-900/[0.04] px-1 py-1.5">
                          <p className="font-display text-sm font-extrabold text-forest-950">
                            {hotspot.reportCount}
                          </p>
                          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Reports
                          </p>
                        </div>
                        <div className="rounded-lg bg-forest-900/[0.04] px-1 py-1.5">
                          <p className="font-display text-sm font-extrabold text-forest-950">
                            {hotspot.openCount}
                          </p>
                          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Open
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-[9px] font-medium text-slate-400">
                          Latest {formatDateTime(hotspot.latestAt)}
                        </p>
                        {(role === "Officer" || role === "Admin") && (
                          <a
                            href={`${PATHS.OFFICER_QUEUE}?area=${encodeURIComponent(hotspot.area)}`}
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 hover:underline"
                          >
                            View cases
                            <ArrowRight className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                      <p className="mt-1 text-[9px] font-semibold text-slate-400">
                        {Object.entries(hotspot.statuses || {})
                          .map(([status, count]) => `${status}: ${count}`)
                          .join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}

export default HotspotMapPage;
