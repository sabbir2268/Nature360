import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Map as MapIcon,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Logo from "../../../components/common/Logo";
import Reveal from "../../../components/ui/Reveal";
import SectionHeading from "../../../components/ui/SectionHeading";
import { cn } from "../../../utils/cn";
import HotspotMap from "./HotspotMap";
import {
  categoryData,
  categoryOptions,
  hotspots,
  reportsOverTime,
  resolutionData,
  riskScores,
  severityMeta,
  severityOptions,
} from "../data/dashboardData";

const dashboardNav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Reports", icon: FileText },
  { label: "Hotspots", icon: MapIcon },
  { label: "Investigations", icon: Search },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-[0_18px_40px_-20px_rgba(5,46,36,0.45)] backdrop-blur">
      {label && <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>}
      <div className="mt-1 space-y-0.5">
        {payload.map((entry) => (
          <p key={entry.dataKey} className="flex items-center gap-1.5 text-[10px] font-semibold text-forest-950">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.color }} />
            <span className="capitalize">{entry.name || entry.dataKey}</span>
            <span className="ml-auto pl-3">{entry.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={cn("rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-sm backdrop-blur-sm sm:p-4", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-forest-950">{title}</p>
          <p className="mt-0.5 text-[9px] text-slate-400">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function DashboardPreview() {
  const [category, setCategory] = useState("All categories");
  const [severity, setSeverity] = useState("All severities");
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const filteredHotspots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return hotspots.filter((hotspot) => {
      const matchesCategory = category === "All categories" || hotspot.category === category;
      const matchesSeverity = severity === "All severities" || hotspot.severity === severity;
      const matchesQuery =
        !normalizedQuery ||
        hotspot.name.toLowerCase().includes(normalizedQuery) ||
        hotspot.category.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSeverity && matchesQuery;
    });
  }, [category, severity, query]);

  const filtersActive = category !== "All categories" || severity !== "All severities" || query.length > 0;

  const resetFilters = () => {
    setCategory("All categories");
    setSeverity("All severities");
    setQuery("");
  };

  return (
    <section id="insights" className="relative overflow-hidden bg-[#F1F7F2] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(163,230,53,0.1),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Insights"
          title={
            <>
              Understand Your Environment <span className="text-gradient">Through Data.</span>
            </>
          }
          description="A clear operational view of reports, hotspots, risk levels, and resolution progress. Every figure in this preview is illustrative demo data."
        />

        <Reveal delay={0.1} className="mt-10 sm:mt-12">
          <div className="rounded-[2rem] border border-white/75 bg-white/60 p-2 shadow-[0_35px_100px_-50px_rgba(5,46,36,0.55)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-3">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-[#F8FBF8] sm:rounded-[2rem]">
              <div className="flex">
                <aside className="hidden w-52 shrink-0 flex-col border-r border-forest-900/[0.07] bg-white/55 p-4 lg:flex">
                  <Logo />
                  <nav className="mt-8 space-y-1" aria-label="Dashboard preview navigation">
                    {dashboardNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[11px] font-semibold",
                            item.active
                              ? "bg-forest-950 text-white shadow-sm"
                              : "text-slate-500",
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5", item.active ? "text-lime-300" : "text-slate-400")} />
                          {item.label}
                          {item.active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lime-300" />}
                        </div>
                      );
                    })}
                  </nav>

                  <div className="mt-6 rounded-2xl border border-forest-900/[0.06] bg-white/60 p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/12 text-emerald-700">
                        <Users className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-[9px] font-bold text-forest-950">Community roles</p>
                        <p className="text-[8px] text-slate-400">Citizen · Volunteer · Officer</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto rounded-2xl bg-gradient-to-br from-forest-950 to-emerald-900 p-3.5 text-white">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-lime-300">Demo workspace</p>
                    <p className="mt-1 text-[10px] leading-5 text-white/65">
                      All dashboard figures are illustrative and not operational statistics.
                    </p>
                  </div>
                </aside>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 border-b border-forest-900/[0.06] bg-white/45 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-700">Workspace</p>
                      <h3 className="truncate font-display text-[15px] font-extrabold tracking-[-0.03em] text-forest-950 sm:text-base">
                        Environmental overview
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="relative hidden md:block">
                        <span className="sr-only">Search hotspots</span>
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="Search hotspots..."
                          className="h-9 w-40 rounded-full border border-forest-900/10 bg-white/75 pl-8 pr-3 text-[10px] font-medium text-forest-950 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10 lg:w-48"
                        />
                      </label>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setNotificationsOpen((open) => !open)}
                          aria-label="View demo notifications"
                          aria-expanded={notificationsOpen}
                          className="relative grid h-9 w-9 place-items-center rounded-full border border-forest-900/10 bg-white/70 text-slate-500 transition-colors hover:bg-white hover:text-forest-900"
                        >
                          <Bell className="h-3.5 w-3.5" />
                          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        </button>
                        <AnimatePresence>
                          {notificationsOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.97 }}
                              transition={{ duration: 0.18 }}
                              className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-56 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_24px_60px_-24px_rgba(5,46,36,0.45)] backdrop-blur-xl"
                            >
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                Demo notification
                              </p>
                              <p className="mt-1.5 text-[11px] font-semibold leading-5 text-forest-950">
                                Water reports crossed a configured threshold in Zone 4.
                              </p>
                              <p className="mt-1 text-[9px] text-slate-400">Illustrative alert · Officer review needed</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex items-center gap-2 rounded-full border border-forest-900/10 bg-white/70 p-1 pr-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-950 text-[9px] font-bold text-lime-300">
                          EO
                        </span>
                        <span className="hidden text-[9px] font-bold text-forest-950 sm:block">Officer</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-5">
                    <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/65 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-950 px-2.5 py-2 text-[9px] font-bold text-white">
                          <SlidersHorizontal className="h-3 w-3 text-lime-300" />
                          Filters
                        </span>

                        <label className="relative">
                          <span className="sr-only">Filter by category</span>
                          <select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="h-8 appearance-none rounded-full border border-forest-900/10 bg-white/85 py-0 pl-3 pr-7 text-[10px] font-semibold text-forest-900 outline-none transition-colors focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                          >
                            {categoryOptions.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                        </label>

                        <label className="relative">
                          <span className="sr-only">Filter by severity</span>
                          <select
                            value={severity}
                            onChange={(event) => setSeverity(event.target.value)}
                            className="h-8 appearance-none rounded-full border border-forest-900/10 bg-white/85 py-0 pl-3 pr-7 text-[10px] font-semibold text-forest-900 outline-none transition-colors focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/10"
                          >
                            {severityOptions.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                        </label>

                        {filtersActive && (
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-full px-2 py-1 text-[9px] font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <p className="text-[9px] font-semibold text-slate-500">
                        <span className="font-bold text-forest-950">{filteredHotspots.length}</span> hotspots match
                      </p>
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
                      <div className="relative">
                        <HotspotMap items={filteredHotspots} compact className="h-[300px] sm:h-[340px]" />
                        {filteredHotspots.length === 0 && (
                          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center rounded-[1.75rem] bg-white/55 backdrop-blur-[2px]">
                            <p className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[10px] font-bold text-forest-950 shadow-sm">
                              No hotspots match these filters
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {riskScores.map((risk) => (
                          <div
                            key={risk.level}
                            className="flex flex-col rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur-sm"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-bold",
                                  severityMeta[risk.level].soft,
                                  severityMeta[risk.level].text,
                                  severityMeta[risk.level].border,
                                )}
                              >
                                <span className={cn("h-1 w-1 rounded-full", severityMeta[risk.level].dot)} />
                                {risk.level}
                              </span>
                              <span className="text-[8px] font-bold text-slate-300">DEMO</span>
                            </div>
                            <p className="mt-2.5 text-[1.6rem] font-extrabold leading-none tracking-[-0.05em] text-forest-950">
                              {risk.score}
                            </p>
                            <p className="mt-1 text-[8px] font-medium leading-4 text-slate-400">
                              Rule-based risk score
                            </p>
                            <div className="mt-auto pt-2">
                              <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: risk.track }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${risk.score}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: risk.color }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-12">
                      <Panel
                        title="Reports over time"
                        subtitle="Monthly report and resolution volume"
                        className="lg:col-span-7"
                        action={
                          <span className="rounded-full border border-forest-900/10 bg-white/75 px-2 py-1 text-[8px] font-bold text-slate-500">
                            Demo
                          </span>
                        }
                      >
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reportsOverTime} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
                              <defs>
                                <linearGradient id="reportsFill" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.28} />
                                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE8DF" />
                              <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 9, fill: "#64748B" }}
                                dy={4}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 9, fill: "#64748B" }}
                                width={34}
                              />
                              <Tooltip content={<ChartTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="reports"
                                name="Reports"
                                stroke="#10B981"
                                strokeWidth={2.5}
                                fill="url(#reportsFill)"
                                isAnimationActive={!reduceMotion}
                              />
                              <Area
                                type="monotone"
                                dataKey="resolved"
                                name="Resolved"
                                stroke="#14532D"
                                strokeWidth={1.8}
                                strokeDasharray="4 4"
                                fill="transparent"
                                isAnimationActive={!reduceMotion}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-[8px] font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-4 rounded-full bg-emerald-500" />
                            Reports
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-4 rounded-full bg-forest-900" />
                            Resolved
                          </span>
                        </div>
                      </Panel>

                      <Panel
                        title="Pollution categories"
                        subtitle="Share of demo reports"
                        className="lg:col-span-5"
                        action={
                          <span className="rounded-full border border-forest-900/10 bg-white/75 px-2 py-1 text-[8px] font-bold text-slate-500">
                            Demo
                          </span>
                        }
                      >
                        <div className="relative h-[168px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={48}
                                outerRadius={70}
                                paddingAngle={3}
                                stroke="none"
                                isAnimationActive={!reduceMotion}
                              >
                                {categoryData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            <div className="text-center">
                              <p className="font-display text-lg font-extrabold leading-none text-forest-950">100</p>
                              <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">reports</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {categoryData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="truncate text-[8px] font-medium text-slate-500">{entry.name}</span>
                            </div>
                          ))}
                        </div>
                      </Panel>

                      <Panel
                        title="Complaint resolution"
                        subtitle="Resolved vs. pending demo complaints"
                        className="lg:col-span-12"
                        action={
                          <span className="rounded-full border border-forest-900/10 bg-white/75 px-2 py-1 text-[8px] font-bold text-slate-500">
                            Demo
                          </span>
                        }
                      >
                        <div className="h-[190px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resolutionData} margin={{ top: 8, right: 4, left: -26, bottom: 0 }} barGap={4}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE8DF" />
                              <XAxis
                                dataKey="category"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 9, fill: "#64748B" }}
                                dy={4}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 9, fill: "#64748B" }}
                                width={34}
                              />
                              <Tooltip content={<ChartTooltip />} />
                              <Bar
                                dataKey="resolved"
                                name="Resolved"
                                fill="#10B981"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={28}
                                isAnimationActive={!reduceMotion}
                              />
                              <Bar
                                dataKey="pending"
                                name="Pending"
                                fill="#D9F99D"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={28}
                                isAnimationActive={!reduceMotion}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-[8px] font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-4 rounded-full bg-emerald-500" />
                            Resolved
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-4 rounded-full bg-lime-300" />
                            Pending
                          </span>
                        </div>
                      </Panel>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-5 text-center text-[10px] font-medium text-slate-400">
          Dashboard preview with illustrative demo data. Risk scores and alerts are rule-based, not
          predictive AI.
        </p>
      </div>
    </section>
  );
}

export default DashboardPreview;
