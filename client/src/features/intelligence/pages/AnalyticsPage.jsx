import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  MapPin,
  PieChart as PieChartIcon,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/SelectField";
import { getAnalyticsSummary, getAnalyticsTrends } from "../services/intelligenceServices";
import { getPublicSettings } from "../../settings/services/settingsServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";

const COLORS = ["#059669", "#0ea5e9", "#6366f1", "#f59e0b", "#f97316", "#dc2626", "#14b8a6", "#8b5cf6"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(6,78,59,0.1)",
  boxShadow: "0 20px 45px -25px rgba(6,78,59,0.4)",
  fontSize: 11,
};

function ChartCard({ icon: Icon, title, subtitle, children, className = "" }) {
  return (
    <div className={cn("glass rounded-[1.75rem] p-4 sm:p-5", className)}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          {subtitle && (
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">{subtitle}</p>
          )}
          <h3 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
            {title}
          </h3>
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState({
    byStatus: [],
    byCategory: [],
    bySeverity: [],
    byRiskLevel: [],
  });
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [filters, setFilters] = useState({ category: "All", severity: "All", days: "30" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        category: filters.category,
        severity: filters.severity,
      };
      const [summaryData, trendData] = await Promise.all([
        getAnalyticsSummary(params),
        getAnalyticsTrends({ ...params, days: filters.days }),
      ]);
      setSummary(summaryData.summary);
      setDistribution({
        byStatus: summaryData.byStatus || [],
        byCategory: summaryData.byCategory || [],
        bySeverity: summaryData.bySeverity || [],
        byRiskLevel: summaryData.byRiskLevel || [],
      });
      setTrends(trendData.series || []);
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
    getPublicSettings()
      .then((settings) => {
        setCategories(settings.categories.map((item) => item.name));
        setSeverities(settings.severityLevels.map((item) => item.name));
      })
      .catch(() => {});
  }, []);

  const trendData = trends.map((point) => ({
    ...point,
    label: new Date(`${point.date}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  const stats = summary
    ? [
        { label: "Total complaints", value: summary.totalComplaints, icon: BarChart3, tone: "bg-emerald-500/10 text-emerald-700" },
        { label: "Active cases", value: summary.activeComplaints, icon: Activity, tone: "bg-sky-500/10 text-sky-700" },
        { label: "Resolved", value: summary.resolvedComplaints, icon: CheckCircle2, tone: "bg-lime-500/10 text-lime-700" },
        { label: "Resolution rate", value: `${summary.resolutionRate}%`, icon: TrendingUp, tone: "bg-indigo-500/10 text-indigo-700" },
        { label: "Avg. resolution", value: `${summary.avgResolutionDays}d`, icon: Clock3, tone: "bg-violet-500/10 text-violet-700" },
        { label: "Avg. risk score", value: `${summary.avgRiskScore}/100`, icon: ShieldAlert, tone: "bg-amber-500/10 text-amber-700" },
        { label: "Active alerts", value: summary.activeAlerts, icon: AlertCircle, tone: "bg-rose-500/10 text-rose-700" },
      ]
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="FR-13"
        title="Analytics and reports"
        description="Understand complaint volume, resolution performance, risk distribution and the areas that need the most attention."
        actions={
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
            <Button to={PATHS.HOTSPOTS} variant="outline" size="sm" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Hotspots
            </Button>
          </>
        }
      />

      <Reveal>
        <div className="glass rounded-[1.75rem] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <SelectField
              id="analytics-category"
              label="Category"
              options={["All", ...categories]}
              value={filters.category}
              onChange={(event) =>
                setFilters((current) => ({ ...current, category: event.target.value }))
              }
            />
            <SelectField
              id="analytics-severity"
              label="Severity"
              options={["All", ...severities]}
              value={filters.severity}
              onChange={(event) =>
                setFilters((current) => ({ ...current, severity: event.target.value }))
              }
            />
            <SelectField
              id="analytics-days"
              label="Trend window"
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 90 days" },
                { value: "180", label: "Last 180 days" },
              ]}
              value={filters.days}
              onChange={(event) =>
                setFilters((current) => ({ ...current, days: event.target.value }))
              }
            />
          </div>
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
      ) : loading && !summary ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6].map((key) => (
            <div key={key} className="h-24 animate-pulse rounded-2xl border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
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

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              icon={TrendingUp}
              title="Submitted vs resolved"
              subtitle="Trend"
              className="lg:col-span-2"
            >
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="submittedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,78,59,0.08)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#059669" strokeWidth={2} fill="url(#submittedFill)" />
                    <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#0ea5e9" strokeWidth={2} fill="url(#resolvedFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard icon={PieChartIcon} title="Status mix" subtitle="Distribution">
              <div className="h-[280px]">
                {distribution.byStatus.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution.byStatus}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {distribution.byStatus.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </ChartCard>

            <ChartCard icon={BarChart3} title="Complaints by category" subtitle="Volume" className="lg:col-span-2">
              <div className="h-[260px]">
                {distribution.byCategory.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution.byCategory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,78,59,0.08)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={52} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" name="Complaints" radius={[6, 6, 0, 0]} fill="#059669" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </ChartCard>

            <ChartCard icon={ShieldAlert} title="Severity and risk" subtitle="Risk profile">
              <div className="h-[260px]">
                {distribution.bySeverity.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={distribution.bySeverity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,78,59,0.08)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="value" name="Complaints" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {distribution.byRiskLevel.map((item, index) => (
                  <li
                    key={item.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/10 bg-white/70 px-2 py-0.5 text-[9px] font-bold text-slate-600"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {item.name}: {item.value}
                  </li>
                ))}
              </ul>
            </ChartCard>
          </div>

          <ChartCard icon={MapPin} title="Top reported areas" subtitle="Hotspot areas">
            {summary?.topAreas?.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {summary.topAreas.map((area, index) => (
                  <div
                    key={area.name}
                    className="flex items-center gap-3 rounded-xl border border-forest-900/[0.07] bg-white/60 px-3 py-2.5"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-[10px] font-extrabold text-emerald-700">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-forest-950">
                      {area.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{area.value} reports</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-[11px] text-slate-400">No area data for these filters.</p>
            )}
            {summary && (
              <p className="mt-3 border-t border-forest-900/[0.07] pt-3 text-[10px] text-slate-400">
                Report generated {formatDateTime(new Date().toISOString())} · rejected complaints:{" "}
                {summary.rejectedComplaints}
              </p>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed border-forest-900/15 bg-white/40">
      <p className="text-[11px] text-slate-400">No data for these filters.</p>
    </div>
  );
}

export default AnalyticsPage;
