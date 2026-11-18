import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  ClipboardCheck,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";

const typeIcons = {
  assignment: UserCheck,
  verification: ShieldCheck,
  status: ClipboardCheck,
  investigation: ClipboardCheck,
  alert: BellRing,
  message: MessageSquare,
  system: Bell,
};

const typeTones = {
  assignment: "bg-indigo-500/10 text-indigo-700",
  verification: "bg-sky-500/10 text-sky-700",
  status: "bg-emerald-500/10 text-emerald-700",
  investigation: "bg-violet-500/10 text-violet-700",
  alert: "bg-rose-500/10 text-rose-700",
  message: "bg-amber-500/10 text-amber-700",
  system: "bg-slate-500/10 text-slate-600",
};

function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listNotifications({
        page,
        limit: 15,
        unread: filter === "unread" ? "true" : undefined,
      });
      setNotifications(result.notifications);
      setUnread(result.unread);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleRead = async (notification) => {
    if (notification.read) return;
    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
    );
    setUnread((current) => Math.max(0, current - 1));
    try {
      await markNotificationRead(notification.id);
    } catch {
      load();
    }
  };

  const handleReadAll = async () => {
    setBusy(true);
    setError("");
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnread(0);
    } catch (readError) {
      setError(getApiErrorMessage(readError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Verification decisions, assignments, investigation reports, status changes and hotspot alerts in one place."
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
            {unread > 0 && (
              <Button type="button" size="sm" onClick={handleReadAll} disabled={busy} className="gap-1.5">
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </>
        }
      />

      <Reveal>
        <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-1.5">
            {[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setFilter(option.value);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors",
                  filter === option.value
                    ? "border-forest-950 bg-forest-950 text-white"
                    : "border-forest-900/10 bg-white/70 text-slate-500 hover:text-forest-900",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-semibold text-slate-500">
            {unread > 0 ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You are all caught up"}
          </p>
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
      ) : loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((key) => (
            <div key={key} className="h-20 animate-pulse rounded-2xl border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description="When your complaints or assigned cases change, updates will appear here."
          action={
            <Button to={PATHS.DASHBOARD} size="sm" variant="outline">
              Back to dashboard
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notification, index) => {
              const Icon = typeIcons[notification.type] || Bell;
              const tone = typeTones[notification.type] || typeTones.system;
              const content = (
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-300",
                    notification.read
                      ? "border-forest-900/[0.07] bg-white/55 hover:border-emerald-500/25"
                      : "border-emerald-500/25 bg-emerald-50/70 hover:border-emerald-500/40",
                  )}
                >
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12px] font-bold text-forest-950">{notification.title}</p>
                      {!notification.read && (
                        <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{notification.message}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {notification.type} · {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              );

              return (
                <Reveal key={notification.id} delay={Math.min(index * 0.03, 0.2)}>
                  {notification.link ? (
                    <Link to={notification.link} onClick={() => handleRead(notification)} className="block">
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRead(notification)}
                      className="block w-full text-left"
                    >
                      {content}
                    </button>
                  )}
                </Reveal>
              );
            })}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {unread === 0 && notifications.length > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-forest-900/[0.07] bg-white/50 px-4 py-3 text-[10px] font-semibold text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          All notifications on this page are read.
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
