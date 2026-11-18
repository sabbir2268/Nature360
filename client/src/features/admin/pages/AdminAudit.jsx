import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ClipboardList,
  FileSearch,
  RefreshCw,
  Search,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import SelectField from "../../../components/ui/SelectField";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";
import { RoleBadge } from "../../../components/ui/Badge";
import { listAuditLogs } from "../services/adminServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { cn } from "../../../utils/cn";

const ACTION_OPTIONS = [
  "All",
  "complaint.create",
  "complaint.update",
  "complaint.delete",
  "complaint.status",
  "complaint.verify",
  "complaint.assign",
  "complaint.internal_note",
  "complaint.corrective_action",
  "complaint.response",
  "investigation.update",
  "investigation.report",
  "alert.status",
  "alert.scan",
  "settings.update",
  "user.role_change",
  "user.status_change",
  "user.update_profile",
];

const ENTITY_OPTIONS = ["All", "Post", "User", "Alert", "Setting"];

function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    action: "All",
    entityType: "All",
    from: "",
    to: "",
  });
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listAuditLogs({ ...filters, page, limit: 20 });
      setLogs(result.logs);
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

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="FR-16"
        title="Audit trail"
        description="Every sensitive action is recorded with the actor, entity, timestamp and details. Records are append-only from the API."
        actions={
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
        }
      />

      <Reveal>
        <div className="glass rounded-[1.75rem] p-4 sm:p-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setFilters((current) => ({ ...current, search: draft.trim() }));
            }}
            className="flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <TextField
                id="audit-search"
                label="Search log"
                icon={Search}
                type="search"
                placeholder="Actor name, action or entity id"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </div>
            <Button type="submit" className="gap-1.5">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              id="audit-action"
              label="Action"
              icon={ClipboardList}
              options={ACTION_OPTIONS}
              value={filters.action}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, action: event.target.value }));
              }}
            />
            <SelectField
              id="audit-entity"
              label="Entity"
              icon={FileSearch}
              options={ENTITY_OPTIONS}
              value={filters.entityType}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, entityType: event.target.value }));
              }}
            />
            <div>
              <label htmlFor="audit-from" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                From
              </label>
              <input
                id="audit-from"
                type="date"
                value={filters.from}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, from: event.target.value }));
                }}
                className="h-12 w-full rounded-xl border border-forest-900/10 bg-white/80 px-3 text-sm text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
            <div>
              <label htmlFor="audit-to" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                To
              </label>
              <input
                id="audit-to"
                type="date"
                value={filters.to}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, to: event.target.value }));
                }}
                className="h-12 w-full rounded-xl border border-forest-900/10 bg-white/80 px-3 text-sm text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>
          {(filters.search || filters.action !== "All" || filters.entityType !== "All" || filters.from || filters.to) && (
            <div className="mt-3 flex items-center justify-between border-t border-forest-900/[0.07] pt-3">
              <p className="text-[10px] font-semibold text-slate-500">Filters applied</p>
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  setPage(1);
                  setFilters({ search: "", action: "All", entityType: "All", from: "", to: "" });
                }}
                className="text-[10px] font-bold text-emerald-700 hover:underline"
              >
                Clear filters
              </button>
            </div>
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
      ) : loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((key) => (
            <div key={key} className="h-20 animate-pulse rounded-2xl border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No audit entries found"
          description="Try widening the date range or clearing filters. Sensitive actions will appear here as they happen."
        />
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log, index) => {
              const isOpen = expanded === log.id;
              const details = log.details ? JSON.stringify(log.details) : "";
              return (
                <Reveal key={log.id} delay={Math.min(index * 0.025, 0.2)}>
                  <div className="glass rounded-2xl px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full border border-forest-900/10 bg-forest-900/[0.04] px-2 py-0.5 font-mono text-[9px] font-bold text-forest-900">
                            {log.action}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            {log.entityType}
                          </span>
                          <RoleBadge role={log.actorRole || "Citizen"} />
                        </div>
                        <p className="mt-1.5 text-[11px] font-bold text-forest-950">
                          {log.actorName || "System"}{" "}
                          <span className="font-medium text-slate-400">
                            · {log.entityId || "no entity id"}
                          </span>
                        </p>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          {formatDateTime(log.createdAt)}
                          {log.ip ? ` · ${log.ip}` : ""}
                        </p>
                      </div>
                      {details && (
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? "" : log.id)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-forest-900/10 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-600 hover:bg-forest-50"
                        >
                          Details
                          <ChevronDown
                            className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
                          />
                        </button>
                      )}
                    </div>
                    {isOpen && details && (
                      <pre className="thin-scrollbar mt-2 max-h-52 overflow-auto rounded-xl border border-forest-900/[0.07] bg-forest-950/[0.03] p-3 text-[10px] leading-5 text-forest-900">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default AdminAudit;
