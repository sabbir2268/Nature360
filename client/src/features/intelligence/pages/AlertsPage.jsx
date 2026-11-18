import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  MapPin,
  Radar,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/SelectField";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";
import { RiskBadge } from "../../../components/ui/Badge";
import {
  listAlerts,
  runAlertScan,
  updateAlertStatus,
} from "../services/intelligenceServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";
import { useAuth } from "../../auth/hooks/useAuth";

const alertStatusStyles = {
  Active: "border-rose-200 bg-rose-50 text-rose-700",
  Acknowledged: "border-amber-200 bg-amber-50 text-amber-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function AlertsPage() {
  const { role } = useAuth();
  const canManage = role === "Officer" || role === "Admin";
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "All", riskLevel: "All" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [busyId, setBusyId] = useState("");
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listAlerts({ ...filters, page, limit: 12 });
      setAlerts(result.alerts);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleStatus = async (alert, status) => {
    setBusyId(alert.id);
    setError("");
    try {
      const updated = await updateAlertStatus(alert.id, status);
      setAlerts((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setFlash(`Alert ${status.toLowerCase()}.`);
    } catch (statusError) {
      setError(getApiErrorMessage(statusError));
    } finally {
      setBusyId("");
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setError("");
    try {
      const result = await runAlertScan();
      setFlash(result.message || "Hotspot scan completed.");
      setPage(1);
      await load();
    } catch (scanError) {
      setError(getApiErrorMessage(scanError));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="FR-11"
        title="Hotspot alerts"
        description="Automatic alerts fire when a category and area cross the configured report threshold, so repeat pollution is not missed."
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
            {canManage && (
              <Button type="button" size="sm" onClick={handleScan} disabled={scanning} className="gap-1.5">
                <Radar className={cn("h-3.5 w-3.5", scanning && "animate-pulse")} />
                {scanning ? "Scanning..." : "Run hotspot scan"}
              </Button>
            )}
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

      <Reveal>
        <div className="glass rounded-[1.75rem] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              id="alerts-status"
              label="Status"
              options={["All", "Active", "Acknowledged", "Resolved"]}
              value={filters.status}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, status: event.target.value }));
              }}
            />
            <SelectField
              id="alerts-risk"
              label="Risk level"
              options={["All", "Low", "Moderate", "High", "Critical"]}
              value={filters.riskLevel}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, riskLevel: event.target.value }));
              }}
            />
          </div>
          <p className="mt-3 border-t border-forest-900/[0.07] pt-3 text-[10px] text-slate-400">
            Alerts are generated automatically when complaints are verified and can also be rechecked
            manually. Officers and administrators can acknowledge or resolve them.
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
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-28 animate-pulse rounded-2xl border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No alerts match these filters"
          description="Hotspot alerts are created automatically once a category and area pass the report threshold. You can also run a manual scan as an officer or admin."
          action={
            canManage ? (
              <Button type="button" size="sm" onClick={handleScan} disabled={scanning} className="gap-1.5">
                <Radar className="h-3.5 w-3.5" />
                Run hotspot scan
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <Reveal key={alert.id} delay={Math.min(index * 0.04, 0.2)}>
                <div className="glass rounded-[1.75rem] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-600">
                        <BellRing className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[9px] font-bold",
                              alertStatusStyles[alert.status] || alertStatusStyles.Active,
                            )}
                          >
                            {alert.status}
                          </span>
                          <RiskBadge level={alert.riskLevel} />
                        </div>
                        <h3 className="mt-1.5 font-display text-[15px] font-extrabold tracking-[-0.025em] text-forest-950">
                          {alert.category} hotspot in {alert.area}
                        </h3>
                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{alert.message}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-600" />
                            {alert.area}
                          </span>
                          <span>{alert.reportCount} reports</span>
                          <span>Risk {alert.riskScore}/100</span>
                          <span>Created {formatDateTime(alert.createdAt)}</span>
                        </p>
                        {alert.status === "Acknowledged" && alert.acknowledgedBy?.name && (
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-amber-700">
                            Acknowledged by {alert.acknowledgedBy.name} ·{" "}
                            {formatDateTime(alert.acknowledgedAt)}
                          </p>
                        )}
                        {alert.status === "Resolved" && alert.resolvedAt && (
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                            Resolved {formatDateTime(alert.resolvedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {canManage && alert.status !== "Resolved" && (
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5 self-center">
                        {alert.status === "Active" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatus(alert, "Acknowledged")}
                            disabled={busyId === alert.id}
                            className="gap-1"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleStatus(alert, "Resolved")}
                          disabled={busyId === alert.id}
                          className="gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-forest-900/[0.07] bg-white/50 px-4 py-3">
        <p className="text-[10px] font-semibold text-slate-500">
          Want the geographic picture? Open the hotspot map.
        </p>
        <Button to={PATHS.HOTSPOTS} variant="ghost" size="sm" className="gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          Hotspot map
        </Button>
      </div>
    </div>
  );
}

export default AlertsPage;
