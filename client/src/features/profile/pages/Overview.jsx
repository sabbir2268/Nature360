import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileSearch,
  FileText,
  MapPinned,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  Timer,
  Users,
} from "lucide-react";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../posts/components/StatusBadge";
import { RiskBadge } from "../../../components/ui/Badge";
import { useAuth } from "../../auth/hooks/useAuth";
import { getDashboardOverview } from "../../dashboard/services/dashboardServices";
import { downloadAdminReport } from "../../admin/services/adminServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime, initialsFromName } from "../../../utils/format";
import {
  PATHS,
  assignedCasePath,
  officerComplaintPath,
  postDetailsPath,
} from "../../../utils/paths";
import { cn } from "../../../utils/cn";

function StatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="flex h-full items-center gap-3 rounded-2xl border border-white/75 bg-white/70 p-4 shadow-sm backdrop-blur">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", accent)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-extrabold leading-none tracking-[-0.04em] text-forest-950">
            {value}
          </p>
          <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function complaintLink(role, postId) {
  if (role === "Volunteer") return assignedCasePath(postId);
  if (role === "Officer" || role === "Admin") return officerComplaintPath(postId);
  return postDetailsPath(postId);
}

function Overview() {
  const { profile, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  const role = profile?.role || "Citizen";
  const name = profile?.name || user?.displayName || "Nature360 member";
  const email = profile?.email || user?.email || "";

  useEffect(() => {
    let active = true;

    getDashboardOverview()
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
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
  }, [reloadKey]);

  const stats = data?.stats;

  const statCards = useMemo(() => {
    if (!stats) return [];

    if (role === "Volunteer") {
      return [
        { label: "Assigned cases", value: stats.assignedToMe ?? 0, icon: FileSearch, accent: "bg-emerald-500/12 text-emerald-700" },
        { label: "Reports submitted", value: stats.reportsSubmitted ?? 0, icon: FileText, accent: "bg-sky-500/12 text-sky-700" },
        { label: "Overdue cases", value: stats.overdue ?? 0, icon: Timer, accent: "bg-rose-500/12 text-rose-700" },
        { label: "Active alerts", value: stats.activeAlerts ?? 0, icon: AlertTriangle, accent: "bg-amber-500/12 text-amber-700" },
      ];
    }

    if (role === "Officer" || role === "Admin") {
      return [
        { label: "Total complaints", value: stats.totalComplaints ?? 0, icon: ClipboardList, accent: "bg-forest-900/10 text-forest-900" },
        { label: "Pending verification", value: stats.pendingVerification ?? 0, icon: BadgeCheck, accent: "bg-amber-500/12 text-amber-700" },
        { label: "Critical risk", value: stats.criticalRisk ?? 0, icon: ShieldAlert, accent: "bg-rose-500/12 text-rose-700" },
        { label: "Unassigned", value: stats.unassigned ?? 0, icon: Users, accent: "bg-indigo-500/12 text-indigo-700" },
      ];
    }

    return [
      { label: "My complaints", value: stats.totalComplaints ?? 0, icon: FileText, accent: "bg-forest-900/10 text-forest-900" },
      { label: "In progress", value: stats.activeComplaints ?? 0, icon: Timer, accent: "bg-amber-500/12 text-amber-700" },
      { label: "Resolved", value: stats.resolvedComplaints ?? 0, icon: CheckCircle2, accent: "bg-emerald-500/12 text-emerald-700" },
      { label: "Active alerts", value: stats.activeAlerts ?? 0, icon: AlertTriangle, accent: "bg-rose-500/12 text-rose-700" },
    ];
  }, [stats, role]);

  const quickActions = useMemo(() => {
    if (role === "Officer" || role === "Admin") {
      return [
        { to: PATHS.OFFICER_QUEUE, label: "Open complaint queue", icon: ClipboardList },
        { to: PATHS.HOTSPOT_INTELLIGENCE, label: "Open hotspot intelligence", icon: MapPinned },
        ...(role === "Admin"
          ? [{ to: PATHS.ADMIN_USERS, label: "Manage users", icon: Users }]
          : []),
      ];
    }

    if (role === "Volunteer") {
      return [
        { to: PATHS.ASSIGNED, label: "Open assigned cases", icon: FileSearch },
        { to: PATHS.HOTSPOT_INTELLIGENCE, label: "Open hotspot intelligence", icon: MapPinned },
        { to: PATHS.NOTIFICATIONS, label: "Check notifications", icon: AlertTriangle },
      ];
    }

    return [
      { to: PATHS.CREATE_POST, label: "Report a problem", icon: PlusCircle },
      { to: PATHS.TRACK_POST, label: "Track my complaints", icon: FileText },
    ];
  }, [role]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadAdminReport();
    } catch (exportError) {
      setError(getApiErrorMessage(exportError));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-5 text-white shadow-[0_35px_90px_-45px_rgba(5,46,36,0.6)] sm:p-7">
          <div className="grid-pattern-dark pointer-events-none absolute inset-0 opacity-80" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-lime-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lime-300 to-emerald-500 text-[20px] font-extrabold text-forest-950 shadow-lg shadow-forest-950/40 ring-1 ring-inset ring-white/40 sm:h-20 sm:w-20 sm:text-[24px]">
                {initialsFromName(name, email)}
              </span>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-lime-200">
                  <BadgeCheck className="h-3 w-3" />
                  {role} workspace
                </span>
                <h2 className="mt-2 truncate font-display text-xl font-extrabold tracking-[-0.04em] sm:text-2xl">
                  Welcome, {name}
                </h2>
                <p className="mt-0.5 truncate text-[12px] text-white/55">
                  {email} · Resolution rate {stats?.resolutionRate ?? 0}%
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {role === "Admin" && (
                <Button
                  type="button"
                  variant="lime"
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting}
                  className="gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  {exporting ? "Preparing PDF..." : "Export admin PDF"}
                </Button>
              )}
              {role !== "Citizen" && (
                <Button to={PATHS.ANALYTICS} variant="darkOutline" size="sm" className="gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-20 animate-pulse rounded-2xl border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setError("");
              setLoading(true);
              setReloadKey((key) => key + 1);
            }}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat, index) => (
              <StatCard key={stat.label} {...stat} delay={index * 0.04} />
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Reveal className="lg:col-span-2" delay={0.05}>
              <div className="glass h-full rounded-[1.75rem] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                      Activity
                    </p>
                    <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                      Recent complaints
                    </h3>
                  </div>
                  <Link
                    to={
                      role === "Volunteer"
                        ? PATHS.ASSIGNED
                        : role === "Citizen"
                          ? PATHS.TRACK_POST
                          : PATHS.OFFICER_QUEUE
                    }
                    className="text-[11px] font-bold text-emerald-700 hover:text-forest-900 hover:underline"
                  >
                    View all
                  </Link>
                </div>

                {data?.recentComplaints?.length ? (
                  <ul className="mt-4 space-y-2.5">
                    {data.recentComplaints.map((post) => (
                      <li key={post.id}>
                        <Link
                          to={complaintLink(role, post.id)}
                          className="group block rounded-2xl border border-forest-900/[0.07] bg-white/60 p-3.5 transition-colors duration-300 hover:border-emerald-500/30 hover:bg-white/85"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-bold text-forest-950">
                                {post.title}
                              </p>
                              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-500">
                                <span>{post.category}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span>{post.area || "No area"}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span>{formatDateTime(post.createdAt)}</span>
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <RiskBadge level={post.riskLevel} />
                              <StatusBadge status={post.status} />
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-forest-900/15 bg-white/40 px-5 py-9 text-center">
                    <FileText className="mx-auto h-6 w-6 text-emerald-700" />
                    <p className="mt-2 font-display text-sm font-bold text-forest-950">
                      No complaints in your workspace yet
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-slate-500">
                      {role === "Citizen"
                        ? "Submit your first environmental complaint to start the accountability flow."
                        : "New cases will appear here as soon as they are available."}
                    </p>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="glass h-full rounded-[1.75rem] p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Shortcuts
                </p>
                <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                  Quick actions
                </h3>

                <div className="mt-4 space-y-2">
                  {quickActions.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="group flex items-center gap-2.5 rounded-xl border border-forest-900/[0.07] bg-white/60 px-3 py-2.5 text-[11px] font-bold text-forest-950 transition-colors hover:border-emerald-500/30 hover:bg-white"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">{label}</span>
                      <ArrowRight className="h-3 w-3 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-forest-900/[0.06] bg-white/50 p-3.5">
                  <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    <CalendarDays className="h-3 w-3" />
                    System snapshot
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
                    <span>Resolution rate: {stats?.resolutionRate ?? 0}%</span>
                    <span>Active alerts: {stats?.activeAlerts ?? 0}</span>
                    <span>Overdue: {stats?.overdue ?? 0}</span>
                    <span>Unread: {stats?.unreadNotifications ?? 0}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </>
      )}
    </div>
  );
}

export default Overview;
