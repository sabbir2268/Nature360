import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CircleDot,
  ClipboardList,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";
import SelectField from "../../../components/ui/SelectField";
import TextField from "../../../components/ui/TextField";
import StatusBadge from "../../posts/components/StatusBadge";
import { PriorityBadge, RiskBadge } from "../../../components/ui/Badge";
import { listComplaints, POST_CATEGORIES, POST_SEVERITIES } from "../../posts/services/postServices";
import { getPublicSettings } from "../../settings/services/settingsServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { PATHS, officerComplaintPath } from "../../../utils/paths";
import { cn } from "../../../utils/cn";

const STATUS_OPTIONS = [
  "All",
  "Submitted",
  "Under Review",
  "Verified",
  "Investigation",
  "Action Taken",
  "Resolved",
  "Rejected",
];

const verificationOptions = ["All", "Pending", "Verified", "Rejected"];
const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "risk", label: "Highest risk" },
  { value: "priority", label: "Highest priority" },
  { value: "deadline", label: "Nearest deadline" },
];

const defaultFilters = {
  search: "",
  status: "All",
  verification: "All",
  severity: "All",
  priority: "All",
  category: "All",
  area: "",
  sort: "newest",
};

function ComplaintQueue() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    area: searchParams.get("area") || "",
  }));
  const [searchDraft, setSearchDraft] = useState("");
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [severities, setSeverities] = useState(POST_SEVERITIES);
  const [categories, setCategories] = useState(POST_CATEGORIES);

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        setSeverities(settings.severityLevels.map((item) => item.name));
        setCategories(settings.categories.map((item) => item.name));
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listComplaints({ ...filters, page, limit: 12 });
      setPosts(result.posts);
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

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) => key !== "sort" && value && value !== "All",
      ).length,
    [filters],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Officer workspace"
        title="Complaint queue"
        description="Verify incoming reports, set priorities, assign field volunteers and move every case toward a real resolution."
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateFilter("search", searchDraft.trim());
            }}
            className="flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <TextField
                id="queue-search"
                label="Search complaints"
                icon={Search}
                type="search"
                placeholder="Title, description, area or location"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
              />
            </div>
            <Button type="submit" size="md" className="gap-1.5">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <SelectField
              id="queue-status"
              label="Status"
              icon={CircleDot}
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            />
            <SelectField
              id="queue-verification"
              label="Verification"
              icon={ShieldCheck}
              options={verificationOptions}
              value={filters.verification}
              onChange={(event) => updateFilter("verification", event.target.value)}
            />
            <SelectField
              id="queue-severity"
              label="Severity"
              icon={TriangleAlert}
              options={["All", ...severities]}
              value={filters.severity}
              onChange={(event) => updateFilter("severity", event.target.value)}
            />
            <SelectField
              id="queue-priority"
              label="Priority"
              icon={SlidersHorizontal}
              options={["All", "Low", "Medium", "High", "Urgent"]}
              value={filters.priority}
              onChange={(event) => updateFilter("priority", event.target.value)}
            />
            <SelectField
              id="queue-category"
              label="Category"
              icon={ClipboardList}
              options={["All", ...categories]}
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
            />
            <SelectField
              id="queue-sort"
              label="Sort by"
              icon={SlidersHorizontal}
              options={sortOptions}
              value={filters.sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
            />
          </div>

          {filters.area && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-forest-900/[0.07] pt-3">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <MapPin className="h-3 w-3 text-emerald-600" />
                Area filter: <span className="font-bold text-forest-950">{filters.area}</span>
              </p>
              <button
                type="button"
                onClick={() => updateFilter("area", "")}
                className="text-[10px] font-bold text-rose-600 hover:underline"
              >
                Clear area
              </button>
            </div>
          )}

          {activeFilterCount > 0 && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-forest-900/[0.07] pt-3">
              <p className="text-[10px] font-semibold text-slate-500">
                {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} active
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchDraft("");
                  setFilters(defaultFilters);
                  setPage(1);
                }}
                className="text-[10px] font-bold text-emerald-700 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="min-w-0 flex-1">{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((key) => (
            <div key={key} className="h-24 animate-pulse rounded-2xl border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No complaints match these filters"
          description="Try clearing filters or searching for a different area. New citizen complaints appear here automatically."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchDraft("");
                setFilters(defaultFilters);
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={Math.min(index * 0.03, 0.2)}>
                <Link
                  to={officerComplaintPath(post.id)}
                  className="glass group block rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:shadow-lift sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={post.status} />
                        <PriorityBadge priority={post.priority} />
                        <RiskBadge level={post.riskLevel} />
                        {post.verificationStatus === "Pending" && (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                            Needs verification
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
                        <span>{post.severity} severity</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{formatDateTime(post.createdAt)}</span>
                        {post.assignedTo?.name && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>Assigned to {post.assignedTo.name}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 self-center text-[10px] font-bold text-emerald-700 transition-colors group-hover:text-forest-900">
                      Open case
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default ComplaintQueue;
