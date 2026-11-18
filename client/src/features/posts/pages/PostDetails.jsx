import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  MapPin,
  Paperclip,
  Pencil,
  RefreshCw,
  Tag,
  Trash2,
  TriangleAlert,
  User,
  Wrench,
  X,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/ui/Reveal";
import Modal from "../../../components/ui/Modal";
import EvidenceGallery from "../../../components/ui/EvidenceGallery";
import LeafletMap from "../../../components/maps/LeafletMap";
import { RiskBadge } from "../../../components/ui/Badge";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import ResolutionFeedback from "../components/ResolutionFeedback";
import { getApiErrorMessage } from "../../../lib/api";
import { deletePost, getPost } from "../services/postServices";
import { useAuth } from "../../auth/hooks/useAuth";
import { formatDateTime } from "../../../utils/format";
import { PATHS, editPostPath } from "../../../utils/paths";
import { cn } from "../../../utils/cn";
import { hasCoordinates } from "../../../utils/geo";

const severityStyles = {
  Low: "text-emerald-700",
  Medium: "text-amber-700",
  High: "text-rose-700",
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-forest-900/[0.06] bg-white/60 px-3 py-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-0.5 break-words text-[11px] font-semibold text-forest-950">{value}</p>
      </div>
    </div>
  );
}

function PostDetails() {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(location.state?.message || "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadPost = useCallback(
    () =>
      getPost(postId)
        .then((data) => {
          setPost(data);
          setError("");
        })
        .catch((loadError) => {
          setError(getApiErrorMessage(loadError));
        })
        .finally(() => {
          setLoading(false);
        }),
    [postId],
  );

  useEffect(() => {
    let active = true;

    getPost(postId)
      .then((data) => {
        if (active) {
          setPost(data);
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
  }, [postId]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    loadPost();
  };

  const handlePostUpdated = (updatedPost) => {
    setPost(updatedPost);
    setError("");
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePost(postId);
      navigate(PATHS.TRACK_POST, {
        replace: true,
        state: { message: "The complaint was removed from your active records." },
      });
    } catch (deleteFailure) {
      setDeleteError(getApiErrorMessage(deleteFailure));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-40 animate-pulse rounded-full bg-white/60" />
        <div className="h-44 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass rounded-[1.75rem] px-6 py-14 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-600">
          <AlertCircle className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
          Complaint not available
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-6 text-slate-500">
          {error || "This complaint could not be found."}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" size="sm" onClick={handleRetry} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
          <Button to={PATHS.TRACK_POST} variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to complaints
          </Button>
        </div>
      </div>
    );
  }

  const history = post.statusHistory || [];
  const reference = post.id ? post.id.slice(-6).toUpperCase() : "------";
  const isOwner = String(profile?.id) === String(post.userId);
  const canEdit = isOwner && ["Submitted", "Under Review", "Rejected"].includes(post.status);
  const canDelete = isOwner && ["Submitted", "Under Review", "Rejected"].includes(post.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to={PATHS.TRACK_POST}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:text-forest-900 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All complaints
        </Link>
        <span className="rounded-full border border-forest-900/10 bg-white/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Ref {reference}
        </span>
      </div>

      {/* Complaint summary */}
      <Reveal>
        <div className="glass rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                Complaint tracking
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold leading-snug tracking-[-0.035em] text-forest-950 sm:text-2xl">
                {post.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-emerald-600" />
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  {post.location || "Location not provided"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3 text-emerald-600" />
                  Submitted {formatDateTime(post.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <StatusBadge status={post.status} />
                <RiskBadge level={post.riskLevel} />
              </div>
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <Button to={editPostPath(post.id)} variant="outline" size="xs" className="gap-1">
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setDeleteOpen(true)}
                      className="gap-1 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 whitespace-pre-line text-[12px] leading-6 text-slate-600 sm:text-[13px]">
            {post.description}
          </p>

          {post.status === "Rejected" && post.rejectionReason && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
              Rejection reason: {post.rejectionReason}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-forest-900/[0.07] pt-3 text-[10px] font-semibold">
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                severityStyles[post.severity] ?? "text-slate-500",
              )}
            >
              <TriangleAlert className="h-3 w-3" />
              {post.severity || "Medium"} severity
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <History className="h-3 w-3 text-emerald-600" />
              {history.length} status update{history.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </Reveal>

      {flash && (
        <div
          role="status"
          aria-live="polite"
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
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {/* Evidence */}
          {(post.evidence || []).length > 0 && (
            <Reveal>
              <div className="glass rounded-[1.75rem] p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                      Evidence
                    </p>
                    <h3 className="font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                      Attached files
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <EvidenceGallery items={post.evidence} />
                </div>
              </div>
            </Reveal>
          )}

          {/* Corrective actions */}
          {(post.correctiveActions || []).length > 0 && (
            <Reveal>
              <div className="glass rounded-[1.75rem] p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                      Field response
                    </p>
                    <h3 className="font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                      Corrective actions
                    </h3>
                  </div>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {post.correctiveActions.map((action, index) => (
                    <li
                      key={`${action.action}-${action.performedAt}-${index}`}
                      className="rounded-xl border border-forest-900/[0.07] bg-white/55 px-3.5 py-3"
                    >
                      <p className="text-[12px] font-semibold text-forest-950">
                        {index + 1}. {action.action}
                      </p>
                      {action.note && (
                        <p className="mt-1 text-[11px] leading-5 text-slate-500">{action.note}</p>
                      )}
                      <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        {action.performedBy?.name || "Officer"} · {formatDateTime(action.performedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {/* Status history */}
          <Reveal>
            <div className="glass rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Timeline
                  </p>
                  <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                    Status history
                  </h3>
                </div>
                <StatusBadge status={post.status} />
              </div>

              {history.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-forest-900/15 bg-white/40 px-4 py-6 text-center text-[11px] text-slate-500">
                  No status updates recorded yet.
                </p>
              ) : (
                <ol className="mt-5">
                  {history.map((entry, index) => {
                    const isLast = index === history.length - 1;

                    return (
                      <li key={entry._id || `${entry.status}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
                        {!isLast && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[13px] top-7 h-full w-px bg-forest-900/10"
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[9px] font-extrabold",
                            isLast
                              ? "border-emerald-500/30 bg-gradient-to-br from-forest-900 to-emerald-600 text-lime-300"
                              : "border-forest-900/10 bg-white text-slate-400",
                          )}
                        >
                          {isLast ? <span className="h-2 w-2 rounded-full bg-lime-300" /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <p className="text-[12px] font-bold text-forest-950">
                              {entry.status}
                              {isLast && (
                                <span className="ml-2 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                                  Current
                                </span>
                              )}
                            </p>
                            <time
                              dateTime={entry.changedAt || undefined}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400"
                            >
                              <Clock3 className="h-3 w-3" />
                              {formatDateTime(entry.changedAt)}
                            </time>
                          </div>
                          {entry.note && (
                            <p className="mt-1 text-[11px] leading-5 text-slate-500">{entry.note}</p>
                          )}
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                            {entry.changedBy?.role || "Citizen"} ·{" "}
                            {entry.changedBy?.name || "EcoTrack"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </Reveal>

          {/* Resolution feedback (FR-04) */}
          <Reveal delay={0.05}>
            <ResolutionFeedback post={post} onUpdated={handlePostUpdated} />
          </Reveal>
        </div>

        <div className="space-y-5">
          {/* Details */}
          <Reveal>
            <div className="glass rounded-[1.75rem] p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                Overview
              </p>
              <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                Complaint details
              </h3>

              <div className="mt-4 space-y-2.5">
                <InfoRow icon={Tag} label="Category" value={post.category} />
                <InfoRow icon={TriangleAlert} label="Severity" value={post.severity || "Medium"} />
                <InfoRow icon={Tag} label="Priority" value={post.priority || "Not set"} />
                <InfoRow icon={MapPin} label="Area" value={post.area || "Not provided"} />
                <InfoRow icon={MapPin} label="Location" value={post.location || "Not provided"} />
                <InfoRow icon={User} label="Reported by" value={post.authorName || "Citizen"} />
                {post.assignedTo?.name && (
                  <InfoRow icon={User} label="Assigned volunteer" value={post.assignedTo.name} />
                )}
                <InfoRow icon={CalendarDays} label="Submitted" value={formatDateTime(post.createdAt)} />
                <InfoRow icon={Clock3} label="Last update" value={formatDateTime(post.updatedAt)} />
                <InfoRow
                  icon={CheckCircle2}
                  label="Resolution"
                  value={post.resolutionStatus || "Awaiting Citizen"}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-forest-900/[0.07] bg-white/50 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Overall progress
                </p>
                <StatusTimeline status={post.status} />
              </div>
            </div>
          </Reveal>

          {hasCoordinates(post.coordinates) && (
              <Reveal delay={0.05}>
                <div className="glass overflow-hidden rounded-[1.75rem] p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Map
                  </p>
                  <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                    Reported location
                  </h3>
                  <div className="mt-3">
                    <LeafletMap
                      markers={[
                        {
                          id: post.id,
                          lat: Number(post.coordinates.lat),
                          lng: Number(post.coordinates.lng),
                          label: post.title,
                          color: "#dc2626",
                        },
                      ]}
                      height="220px"
                      zoom={15}
                    />
                  </div>
                </div>
              </Reveal>
            )}
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        title="Remove this complaint?"
        description="The complaint will be hidden from your active records but kept in the audit trail. This cannot be undone from the app."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Keep complaint
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 from-rose-600 via-rose-600 to-rose-700 shadow-rose-900/20 hover:brightness-105"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Removing..." : "Delete complaint"}
            </Button>
          </div>
        }
      >
        {deleteError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] font-medium text-rose-700">
            {deleteError}
          </p>
        ) : (
          <p className="text-[12px] leading-6 text-slate-600">
            You are removing <strong className="text-forest-950">{post.title}</strong>. Officers will
            still be able to see that a record existed if they are auditing past activity.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default PostDetails;
