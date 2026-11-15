import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CheckCircle2,
  CircleCheck,
  CircleDot,
  Clock3,
  FileSearch,
  PlusCircle,
  X,
} from "lucide-react";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import { useAuth } from "../../auth/hooks/useAuth";
import { POST_STATUSES, getUserPosts } from "../services/postServices";
import { formatDate } from "../../../utils/format";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";

const filterIcons = {
  All: CircleDot,
  Reported: CircleDot,
  "Under Review": FileSearch,
  "In Progress": Clock3,
  Resolved: CircleCheck,
};

function TrackPost() {
  const { user } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [flash, setFlash] = useState(location.state?.message || "");

  const uid = user?.uid;

  useEffect(() => {
    let active = true;

    if (!uid) return undefined;

    getUserPosts(uid)
      .then((result) => {
        if (active) setPosts(result);
      })
      .catch((fetchError) => {
        console.error("Unable to load posts:", fetchError);
        if (active) setError("We couldn't load your posts right now. Please refresh and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [uid]);

  const counts = useMemo(() => {
    const result = { All: posts.length };
    POST_STATUSES.forEach((status) => {
      result[status] = posts.filter((post) => post.status === status).length;
    });
    return result;
  }, [posts]);

  const visiblePosts = filter === "All" ? posts : posts.filter((post) => post.status === filter);

  return (
    <div className="space-y-5">
      {flash && (
        <Reveal>
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-[11px] font-semibold text-emerald-800 shadow-sm"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="flex-1 leading-5">{flash}</p>
            <button
              type="button"
              onClick={() => setFlash("")}
              aria-label="Dismiss message"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {["All", ...POST_STATUSES].map((status) => {
            const Icon = filterIcons[status] ?? CircleDot;
            const isActive = filter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold transition-all duration-300",
                  isActive
                    ? "border-forest-950 bg-forest-950 text-white shadow-sm"
                    : "border-forest-900/10 bg-white/70 text-slate-500 hover:border-emerald-500/30 hover:text-forest-900",
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-lime-300" : "text-slate-400")} />
                {status}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold",
                    isActive ? "bg-white/15 text-lime-200" : "bg-forest-900/[0.06] text-slate-500",
                  )}
                >
                  {counts[status] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((key) => (
            <div key={key} className="h-64 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
          ))}
        </div>
      ) : error ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700"
        >
          {error}
        </p>
      ) : posts.length === 0 ? (
        <Reveal>
          <div className="glass rounded-[1.75rem] px-6 py-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-700">
              <FileSearch className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
              Nothing to track yet
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-6 text-slate-500">
              Create your first post and this page will follow it from submission through to
              resolution.
            </p>
            <Button to={PATHS.CREATE_POST} size="sm" className="mt-5 gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Create post
            </Button>
          </div>
        </Reveal>
      ) : visiblePosts.length === 0 ? (
        <div className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <p className="font-display text-sm font-bold text-forest-950">
            No posts with status “{filter}”
          </p>
          <button
            type="button"
            onClick={() => setFilter("All")}
            className="mt-2 text-[11px] font-bold text-emerald-700 hover:text-forest-900 hover:underline"
          >
            Show all posts
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visiblePosts.map((post, index) => (
            <Reveal key={post.id} delay={Math.min(index * 0.05, 0.2)}>
              <article className="glass h-full rounded-[1.75rem] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-extrabold leading-snug tracking-[-0.025em] text-forest-950 sm:text-[17px]">
                      {post.title}
                    </h2>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
                      <span>{post.category}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{post.location || "No location"}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{formatDate(post.createdAt, "Just now")}</span>
                    </p>
                  </div>
                  <StatusBadge status={post.status} />
                </div>

                {post.description && (
                  <p className="mt-3 line-clamp-3 text-[12px] leading-6 text-slate-600">
                    {post.description}
                  </p>
                )}

                <div className="mt-4 rounded-2xl border border-forest-900/[0.07] bg-white/50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Progress
                    </p>
                    <span className="rounded-full border border-forest-900/10 bg-white/70 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Ref {post.id?.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                  <StatusTimeline status={post.status} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackPost;
