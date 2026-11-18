import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CircleDot,
  ClipboardList,
  MapPin,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import SelectField from "../../../components/ui/SelectField";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";
import StatusBadge from "../../posts/components/StatusBadge";
import { PriorityBadge, RiskBadge } from "../../../components/ui/Badge";
import { listAssignedCases } from "../services/volunteerServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { assignedCasePath } from "../../../utils/paths";
import { cn } from "../../../utils/cn";

const statusOptions = ["All", "Verified", "Investigation", "Action Taken", "Resolved"];

function AssignedCases() {
  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "All", search: "", sort: "deadline" });
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listAssignedCases({ ...filters, page, limit: 10 });
      setCases(result.posts);
      setPagination(result.pagination);
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError));
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
        eyebrow="Field volunteer"
        title="My assigned cases"
        description="Investigate the complaint on site, capture GPS-tagged evidence and submit a clear report to the officer team."
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
                id="assigned-search"
                label="Search cases"
                icon={Search}
                type="search"
                placeholder="Title, area or location"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </div>
            <Button type="submit" className="gap-1.5">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <SelectField
              id="assigned-status"
              label="Status"
              icon={CircleDot}
              options={statusOptions}
              value={filters.status}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, status: event.target.value }));
              }}
            />
            <SelectField
              id="assigned-sort"
              label="Sort by"
              icon={CalendarClock}
              options={[
                { value: "deadline", label: "Nearest deadline" },
                { value: "newest", label: "Newest first" },
                { value: "risk", label: "Highest risk" },
                { value: "priority", label: "Highest priority" },
              ]}
              value={filters.sort}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, sort: event.target.value }));
              }}
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
      ) : loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-44 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assigned cases yet"
          description="When an officer assigns you a verified complaint, it will appear here with its deadline and details."
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((post, index) => {
              const overdue =
                post.deadline &&
                new Date(post.deadline).getTime() < now &&
                post.status !== "Resolved";
              return (
                <Reveal key={post.id} delay={Math.min(index * 0.04, 0.2)}>
                  <Link
                    to={assignedCasePath(post.id)}
                    className="glass group flex h-full flex-col rounded-[1.75rem] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:shadow-lift"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={post.status} />
                        <PriorityBadge priority={post.priority} />
                        <RiskBadge level={post.riskLevel} />
                      </div>
                      {post.investigation?.status && (
                        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                          {post.investigation.status}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-display text-[15px] font-extrabold leading-snug tracking-[-0.025em] text-forest-950">
                      {post.title}
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {post.area || post.location || "No area"}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{post.category}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="inline-flex items-center gap-1">
                        <TriangleAlert className="h-3 w-3 text-amber-500" />
                        {post.severity}
                      </span>
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-forest-900/[0.07] pt-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold",
                          overdue ? "text-rose-600" : "text-slate-400",
                        )}
                      >
                        <CalendarClock className="h-3 w-3" />
                        {post.deadline ? `Due ${formatDateTime(post.deadline)}` : "No deadline"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 group-hover:text-forest-900">
                        Open case
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
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

export default AssignedCases;
