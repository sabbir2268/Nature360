import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import SelectField from "../../../components/ui/SelectField";
import Pagination from "../../../components/ui/Pagination";
import EmptyState from "../../../components/ui/EmptyState";
import { RoleBadge, VerificationBadge } from "../../../components/ui/Badge";
import { listUsers, updateUserRole, updateUserStatus } from "../services/adminServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { useAuth } from "../../auth/hooks/useAuth";
import { cn } from "../../../utils/cn";

const ROLES = ["Citizen", "Officer", "Volunteer", "Admin"];
const STATUSES = ["Active", "Suspended"];

function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", role: "All", status: "All" });
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listUsers({ ...filters, page, limit: 15 });
      setUsers(result.users);
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

  const handleRole = async (user, role) => {
    if (role === user.role) return;
    setBusyId(user.id);
    setError("");
    try {
      const updated = await updateUserRole(user.id, role);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setFlash(`${updated.name || updated.email} is now ${updated.role}.`);
    } catch (roleError) {
      setError(getApiErrorMessage(roleError));
      load();
    } finally {
      setBusyId("");
    }
  };

  const handleStatus = async (user, status) => {
    if (status === user.status) return;
    setBusyId(user.id);
    setError("");
    try {
      const updated = await updateUserStatus(user.id, status);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setFlash(`${updated.name || updated.email} is now ${updated.status.toLowerCase()}.`);
    } catch (statusError) {
      setError(getApiErrorMessage(statusError));
      load();
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="FR-15"
        title="User management"
        description="Search the directory, assign roles and suspend accounts. At least one administrator always remains."
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

      {flash && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-[11px] font-semibold text-emerald-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 leading-5">{flash}</p>
          <button type="button" onClick={() => setFlash("")} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

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
                id="users-search"
                label="Search users"
                icon={Search}
                type="search"
                placeholder="Name or email address"
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
              id="users-role-filter"
              label="Role"
              icon={UserCog}
              options={["All", ...ROLES]}
              value={filters.role}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, role: event.target.value }));
              }}
            />
            <SelectField
              id="users-status-filter"
              label="Status"
              icon={Users}
              options={["All", ...STATUSES]}
              value={filters.status}
              onChange={(event) => {
                setPage(1);
                setFilters((current) => ({ ...current, status: event.target.value }));
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
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((key) => (
            <div key={key} className="h-20 animate-pulse rounded-2xl border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try a different search or role filter."
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {users.map((user, index) => {
              const isSelf = String(profile?.id) === String(user.id);
              const busy = busyId === user.id;
              return (
                <Reveal key={user.id} delay={Math.min(index * 0.03, 0.2)}>
                  <div className="glass rounded-2xl p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <RoleBadge role={user.role} />
                          <VerificationBadge status={user.emailVerified ? "Verified" : "Pending"} />
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[9px] font-bold",
                              user.status === "Active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-700",
                            )}
                          >
                            {user.status}
                          </span>
                          {isSelf && (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700">
                              You
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[13px] font-bold text-forest-950">
                          {user.name || "Unnamed user"}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500">{user.email}</p>
                        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                          Joined {formatDateTime(user.createdAt)}
                          {user.phone ? ` · ${user.phone}` : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Role
                          <select
                            value={user.role}
                            onChange={(event) => handleRole(user, event.target.value)}
                            disabled={busy}
                            className="mt-1 block h-8 rounded-lg border border-forest-900/10 bg-white px-2 text-[10px] font-bold text-forest-950 outline-none focus:border-emerald-400 disabled:opacity-50"
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Status
                          <select
                            value={user.status}
                            onChange={(event) => handleStatus(user, event.target.value)}
                            disabled={busy}
                            className="mt-1 block h-8 rounded-lg border border-forest-900/10 bg-white px-2 text-[10px] font-bold text-forest-950 outline-none focus:border-emerald-400 disabled:opacity-50"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
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

export default AdminUsers;
