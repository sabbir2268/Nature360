import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  PlusCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import StatusBadge from "../../posts/components/StatusBadge";
import { useAuth } from "../../auth/hooks/useAuth";
import { getUserPosts } from "../../posts/services/postServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDate, initialsFromName } from "../../../utils/format";
import { PATHS, postDetailsPath } from "../../../utils/paths";
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

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-forest-900/[0.06] bg-white/60 px-3.5 py-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-0.5 break-words text-[12px] font-semibold text-forest-950">{value}</p>
      </div>
    </div>
  );
}

function Overview() {
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const uid = user?.uid;
  const name = profile?.name || user?.displayName || "EcoTrack member";
  const email = profile?.email || user?.email || "";
  const role = profile?.role || "Citizen";
  const joined = profile?.createdAt;

  useEffect(() => {
    let active = true;

    if (!uid) return undefined;

    getUserPosts()
      .then((result) => {
        if (active) setPosts(result);
      })
      .catch((fetchError) => {
        console.error("Unable to load posts:", fetchError);
        if (active) setError(getApiErrorMessage(fetchError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [uid]);

  const stats = useMemo(() => {
    const resolved = posts.filter((post) => post.status === "Resolved").length;
    const active = posts.filter((post) => post.status !== "Resolved").length;
    return [
      { label: "Total posts", value: posts.length, icon: FileText, accent: "bg-forest-900/10 text-forest-900" },
      { label: "Active reports", value: active, icon: Clock, accent: "bg-amber-500/12 text-amber-700" },
      { label: "Resolved", value: resolved, icon: CheckCircle2, accent: "bg-emerald-500/12 text-emerald-700" },
    ];
  }, [posts]);

  const recentPosts = posts.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Profile banner */}
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
                  <ShieldCheck className="h-3 w-3" />
                  {role}
                </span>
                <h2 className="mt-2 truncate font-display text-xl font-extrabold tracking-[-0.04em] sm:text-2xl">
                  {name}
                </h2>
                <p className="mt-0.5 truncate text-[12px] text-white/55">{email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button to={PATHS.CREATE_POST} variant="lime" size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                New post
              </Button>
              <Button to={PATHS.TRACK_POST} variant="darkOutline" size="sm" className="gap-1.5">
                <Radar className="h-4 w-4" />
                Track posts
              </Button>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[10px] font-semibold text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-lime-300" />
              Member since {formatDate(joined, "today")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-lime-300" />
              Citizen-powered reporting
            </span>
          </div>
        </div>
      </Reveal>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.06} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Personal details */}
        <Reveal className="lg:col-span-1" delay={0.05}>
          <div className="glass h-full rounded-[1.75rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Account
                </p>
                <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                  Personal details
                </h3>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-forest-900/10 bg-white/70 text-emerald-700">
                <User className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <DetailRow icon={User} label="Full name" value={name} />
              <DetailRow icon={Mail} label="Email address" value={email || "Not provided"} />
              <DetailRow icon={ShieldCheck} label="Account role" value={role} />
              <DetailRow icon={CalendarDays} label="Member since" value={formatDate(joined, "Today")} />
              <DetailRow
                icon={MapPin}
                label="Reports submitted"
                value={`${posts.length} post${posts.length === 1 ? "" : "s"}`}
              />
            </div>

            <p className="mt-4 rounded-xl border border-forest-900/[0.06] bg-white/50 px-3.5 py-3 text-[10px] leading-5 text-slate-500">
              Your account is secured by Firebase Authentication. Personal details are stored with your
              profile and never shown publicly.
            </p>
          </div>
        </Reveal>

        {/* Posts */}
        <Reveal className="lg:col-span-2" delay={0.1}>
          <div className="glass h-full rounded-[1.75rem] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Activity
                </p>
                <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                  My posts
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-forest-900/10 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                  {posts.length} total
                </span>
                <Link
                  to={PATHS.TRACK_POST}
                  className="text-[11px] font-bold text-emerald-700 transition-colors hover:text-forest-900 hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="mt-4 space-y-2.5">
                {[0, 1, 2].map((key) => (
                  <div
                    key={key}
                    className="h-16 animate-pulse rounded-2xl border border-white/70 bg-white/50"
                  />
                ))}
              </div>
            ) : error ? (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700"
              >
                {error}
              </p>
            ) : recentPosts.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-forest-900/15 bg-white/40 px-5 py-9 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </span>
                <p className="mt-3 font-display text-sm font-bold text-forest-950">No posts yet</p>
                <p className="mx-auto mt-1 max-w-xs text-[11px] leading-5 text-slate-500">
                  Report your first environmental problem and it will show up here with live progress.
                </p>
                <Button to={PATHS.CREATE_POST} size="sm" className="mt-4 gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  Create your first post
                </Button>
              </div>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      to={postDetailsPath(post.id)}
                      className="group block rounded-2xl border border-forest-900/[0.07] bg-white/60 p-3.5 transition-colors duration-300 hover:border-emerald-500/30 hover:bg-white/85"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-forest-950">{post.title}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-emerald-600" />
                              {post.location || "No location"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3 text-emerald-600" />
                              {formatDate(post.createdAt, "Just now")}
                            </span>
                          </p>
                        </div>
                        <StatusBadge status={post.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default Overview;
