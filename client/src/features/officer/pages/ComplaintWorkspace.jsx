import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  History,
  MapPin,
  MessageSquarePlus,
  RefreshCw,
  ShieldCheck,
  StickyNote,
  TriangleAlert,
  UserCheck,
  Wrench,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/SelectField";
import TextField from "../../../components/ui/TextField";
import EvidenceGallery from "../../../components/ui/EvidenceGallery";
import LeafletMap from "../../../components/maps/LeafletMap";
import StatusBadge from "../../posts/components/StatusBadge";
import { PriorityBadge, RiskBadge } from "../../../components/ui/Badge";
import {
  addCorrectiveAction,
  addInternalNote,
  assignVolunteer,
  getDuplicateCandidates,
  getVolunteers,
  updateComplaintStatus,
  verifyComplaint,
} from "../services/officerServices";
import { getPost, WORKFLOW_STATUSES } from "../../posts/services/postServices";
import { getPublicSettings } from "../../settings/services/settingsServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";
import { hasCoordinates } from "../../../utils/geo";

const severityStyles = {
  Low: "text-emerald-700",
  Medium: "text-amber-700",
  High: "text-orange-700",
  Critical: "text-rose-700",
};

function Section({ icon: Icon, eyebrow, title, children, className = "" }) {
  return (
    <div className={cn("glass rounded-[1.75rem] p-5 sm:p-6", className)}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
          <h3 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
            {title}
          </h3>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function defaultDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
}

function ComplaintWorkspace() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [severities, setSeverities] = useState(["Low", "Medium", "High", "Critical"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [verification, setVerification] = useState({
    decision: "Verified",
    category: "",
    severity: "Medium",
    priority: "Medium",
    note: "",
    reason: "",
  });
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [assignment, setAssignment] = useState({ volunteerId: "", deadline: defaultDeadline(), note: "" });
  const [assigning, setAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  const [statusForm, setStatusForm] = useState({ status: "Under Review", note: "", correctiveAction: "" });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [actionForm, setActionForm] = useState({ action: "", note: "" });
  const [savingAction, setSavingAction] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextPost, nextVolunteers, nextDuplicates, settings] = await Promise.all([
        getPost(postId),
        getVolunteers().catch(() => []),
        getDuplicateCandidates(postId).catch(() => []),
        getPublicSettings().catch(() => null),
      ]);

      setPost(nextPost);
      setVolunteers(nextVolunteers);
      setDuplicates(nextDuplicates);

      if (settings) {
        setCategories(settings.categories.map((item) => item.name));
        setSeverities(settings.severityLevels.map((item) => item.name));
      }

      setVerification((current) => ({
        ...current,
        category: nextPost.category,
        severity: nextPost.severity || "Medium",
        priority: nextPost.priority || "Medium",
        decision: nextPost.verificationStatus === "Rejected" ? "Verified" : current.decision,
      }));
      setAssignment((current) => ({
        ...current,
        volunteerId: nextPost.assignedTo?.id || current.volunteerId,
      }));
      setStatusForm((current) => ({ ...current, status: nextPost.status }));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWorkspace();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadWorkspace]);

  const applyPost = (nextPost, message) => {
    setPost(nextPost);
    setFlash(message);
    setStatusForm((current) => ({ ...current, status: nextPost.status }));
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setVerificationError("");
    setVerifying(true);
    try {
      const nextPost = await verifyComplaint(postId, {
        decision: verification.decision,
        category: verification.category,
        severity: verification.severity,
        priority: verification.priority,
        note: verification.note,
        reason: verification.reason,
      });
      applyPost(nextPost, `Complaint ${verification.decision.toLowerCase()} successfully.`);
      setVerification((current) => ({ ...current, note: "", reason: "" }));
      if (verification.decision === "Verified") {
        getDuplicateCandidates(postId).then(setDuplicates).catch(() => {});
      }
    } catch (verifyError) {
      setVerificationError(getApiErrorMessage(verifyError));
    } finally {
      setVerifying(false);
    }
  };

  const handleAssign = async (event) => {
    event.preventDefault();
    setAssignmentError("");

    if (!assignment.volunteerId) {
      setAssignmentError("Choose a volunteer first.");
      return;
    }

    setAssigning(true);
    try {
      const nextPost = await assignVolunteer(postId, {
        volunteerId: assignment.volunteerId,
        deadline: assignment.deadline || null,
        note: assignment.note,
      });
      applyPost(nextPost, "Case assigned and the volunteer notified.");
      setAssignment((current) => ({ ...current, note: "" }));
    } catch (assignError) {
      setAssignmentError(getApiErrorMessage(assignError));
    } finally {
      setAssigning(false);
    }
  };

  const handleStatus = async (event) => {
    event.preventDefault();
    setStatusError("");
    setUpdatingStatus(true);
    try {
      const nextPost = await updateComplaintStatus(postId, statusForm);
      applyPost(nextPost, `Status updated to ${statusForm.status}.`);
      setStatusForm((current) => ({ ...current, note: "", correctiveAction: "" }));
    } catch (statusFailure) {
      setStatusError(getApiErrorMessage(statusFailure));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleNote = async (event) => {
    event.preventDefault();
    setNoteError("");
    if (noteDraft.trim().length < 2) {
      setNoteError("Write a note first.");
      return;
    }
    setSavingNote(true);
    try {
      const nextPost = await addInternalNote(postId, noteDraft.trim());
      applyPost(nextPost, "Internal note added.");
      setNoteDraft("");
    } catch (noteFailure) {
      setNoteError(getApiErrorMessage(noteFailure));
    } finally {
      setSavingNote(false);
    }
  };

  const handleAction = async (event) => {
    event.preventDefault();
    setActionError("");
    if (actionForm.action.trim().length < 3) {
      setActionError("Describe the corrective action.");
      return;
    }
    setSavingAction(true);
    try {
      const nextPost = await addCorrectiveAction(postId, actionForm);
      applyPost(nextPost, "Corrective action recorded.");
      setActionForm({ action: "", note: "" });
    } catch (actionFailure) {
      setActionError(getApiErrorMessage(actionFailure));
    } finally {
      setSavingAction(false);
    }
  };

  const mapMarkers = useMemo(() => {
    if (!post) return [];
    const markers = [];

    if (hasCoordinates(post.coordinates)) {
      markers.push({
        id: "complaint",
        lat: Number(post.coordinates.lat),
        lng: Number(post.coordinates.lng),
        label: post.title,
        color: "#dc2626",
      });
    }

    if (hasCoordinates(post.investigation?.gps)) {
      markers.push({
        id: "investigation",
        lat: Number(post.investigation.gps.lat),
        lng: Number(post.investigation.gps.lng),
        label: "Volunteer investigation",
        color: "#2563eb",
      });
    }

    return markers;
  }, [post]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white/60" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-64 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass rounded-[1.75rem] px-6 py-14 text-center">
        <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
        <h2 className="mt-3 font-display text-lg font-extrabold text-forest-950">
          Case not available
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">{error || "This complaint could not be loaded."}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" size="sm" onClick={loadWorkspace} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
          <Button to={PATHS.OFFICER_QUEUE} variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to={PATHS.OFFICER_QUEUE}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-forest-900 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Complaint queue
      </Link>

      <PageHeader
        eyebrow={`Case ${post.id.slice(-6).toUpperCase()}`}
        title={post.title}
        description={post.description}
        actions={
          <>
            <StatusBadge status={post.status} />
            <PriorityBadge priority={post.priority} />
            <RiskBadge level={post.riskLevel} />
          </>
        }
      />

      {flash && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-[11px] font-semibold text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 leading-5">{flash}</p>
          <button
            type="button"
            onClick={() => setFlash("")}
            className="text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section icon={ShieldCheck} eyebrow="FR-06" title="Verify complaint">
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  id="verify-decision"
                  label="Decision"
                  options={[
                    { value: "Verified", label: "Verify complaint" },
                    { value: "Rejected", label: "Reject complaint" },
                  ]}
                  value={verification.decision}
                  onChange={(event) =>
                    setVerification((current) => ({ ...current, decision: event.target.value }))
                  }
                />
                <SelectField
                  id="verify-priority"
                  label="Priority"
                  options={["Low", "Medium", "High", "Urgent"]}
                  value={verification.priority}
                  onChange={(event) =>
                    setVerification((current) => ({ ...current, priority: event.target.value }))
                  }
                />
              </div>

              {verification.decision === "Verified" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField
                      id="verify-category"
                      label="Category"
                      options={categories.length ? categories : [post.category]}
                      value={verification.category}
                      onChange={(event) =>
                        setVerification((current) => ({ ...current, category: event.target.value }))
                      }
                    />
                    <SelectField
                      id="verify-severity"
                      label="Severity"
                      options={severities}
                      value={verification.severity}
                      onChange={(event) =>
                        setVerification((current) => ({ ...current, severity: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="verify-note" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                      Verification note
                    </label>
                    <textarea
                      id="verify-note"
                      rows={3}
                      value={verification.note}
                      onChange={(event) =>
                        setVerification((current) => ({ ...current, note: event.target.value }))
                      }
                      placeholder="What did you check? Any adjustments to category or severity?"
                      className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="verify-reason" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                    Rejection reason
                  </label>
                  <textarea
                    id="verify-reason"
                    rows={3}
                    value={verification.reason}
                    onChange={(event) =>
                      setVerification((current) => ({ ...current, reason: event.target.value }))
                    }
                    placeholder="Explain clearly why this complaint cannot be accepted (min. 10 characters)."
                    className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none focus:border-rose-400/70 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                  />
                </div>
              )}

              {verificationError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
                  {verificationError}
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-slate-400">
                  Current verification: {post.verificationStatus || "Pending"}
                </p>
                <Button type="submit" size="sm" disabled={verifying}>
                  {verifying ? "Saving..." : "Save decision"}
                </Button>
              </div>
            </form>
          </Section>

          <Section icon={UserCheck} eyebrow="FR-07" title="Assign field volunteer">
            <form onSubmit={handleAssign} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  id="assign-volunteer"
                  label="Volunteer"
                  options={[
                    { value: "", label: volunteers.length ? "Choose a volunteer" : "No active volunteers" },
                    ...volunteers.map((volunteer) => ({
                      value: volunteer.id,
                      label: volunteer.name,
                    })),
                  ]}
                  value={assignment.volunteerId}
                  onChange={(event) =>
                    setAssignment((current) => ({ ...current, volunteerId: event.target.value }))
                  }
                />
                <div>
                  <label htmlFor="assign-deadline" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                    Deadline
                  </label>
                  <div className="relative">
                    <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="assign-deadline"
                      type="date"
                      value={assignment.deadline}
                      onChange={(event) =>
                        setAssignment((current) => ({ ...current, deadline: event.target.value }))
                      }
                      className="h-12 w-full rounded-xl border border-forest-900/10 bg-white/80 pl-10 pr-4 text-sm text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
              </div>
              <TextField
                id="assign-note"
                label="Assignment note (optional)"
                placeholder="Access instructions, focus areas or safety notes"
                value={assignment.note}
                onChange={(event) =>
                  setAssignment((current) => ({ ...current, note: event.target.value }))
                }
              />

              {post.assignedTo?.name && (
                <p className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-[11px] font-semibold text-indigo-700">
                  Currently assigned to {post.assignedTo.name}
                  {post.deadline ? ` · due ${formatDateTime(post.deadline)}` : ""}
                </p>
              )}

              {assignmentError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
                  {assignmentError}
                </p>
              )}

              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={assigning || volunteers.length === 0}>
                  {assigning ? "Assigning..." : "Assign case"}
                </Button>
              </div>
            </form>
          </Section>

          <Section icon={Wrench} eyebrow="FR-09 / FR-10" title="Corrective action and status">
            <form onSubmit={handleAction} className="space-y-3 border-b border-forest-900/[0.07] pb-4">
              <TextField
                id="action-name"
                label="Corrective action"
                placeholder="e.g. Cleared 3 tonnes of waste and installed signage"
                value={actionForm.action}
                onChange={(event) =>
                  setActionForm((current) => ({ ...current, action: event.target.value }))
                }
              />
              <div>
                <label htmlFor="action-note" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                  Notes
                </label>
                <textarea
                  id="action-note"
                  rows={2}
                  value={actionForm.note}
                  onChange={(event) =>
                    setActionForm((current) => ({ ...current, note: event.target.value }))
                  }
                  className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              {actionError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
                  {actionError}
                </p>
              )}
              <div className="flex justify-end">
                <Button type="submit" variant="outline" size="sm" disabled={savingAction}>
                  {savingAction ? "Saving..." : "Record action"}
                </Button>
              </div>
            </form>

            <form onSubmit={handleStatus} className="mt-4 space-y-3">
              <SelectField
                id="status-next"
                label="Update status"
                options={WORKFLOW_STATUSES.filter((status) => status !== "Submitted")}
                value={statusForm.status}
                onChange={(event) =>
                  setStatusForm((current) => ({ ...current, status: event.target.value }))
                }
              />
              <div>
                <label htmlFor="status-note" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                  Status note
                </label>
                <textarea
                  id="status-note"
                  rows={2}
                  value={statusForm.note}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="Visible to the citizen in the complaint history."
                  className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              {statusForm.status === "Resolved" && (
                <TextField
                  id="status-corrective"
                  label="Corrective action (optional)"
                  placeholder="What was actually fixed?"
                  value={statusForm.correctiveAction}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, correctiveAction: event.target.value }))
                  }
                />
              )}
              {statusError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
                  {statusError}
                </p>
              )}
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={updatingStatus}>
                  {updatingStatus ? "Updating..." : "Update status"}
                </Button>
              </div>
            </form>
          </Section>

          <Section icon={History} eyebrow="Audit" title="Status history">
            <ol className="space-y-3">
              {[...(post.statusHistory || [])].reverse().map((entry, index) => (
                <li key={`${entry.status}-${entry.changedAt}-${index}`} className="flex gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-[11px] font-bold text-forest-950">
                      {entry.status}
                      <span className="ml-2 text-[9px] font-semibold text-slate-400">
                        {formatDateTime(entry.changedAt)}
                      </span>
                    </p>
                    {entry.note && <p className="mt-0.5 text-[10px] leading-5 text-slate-500">{entry.note}</p>}
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {entry.changedBy?.name || "System"} · {entry.changedBy?.role || "System"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="space-y-4">
          <Section icon={TriangleAlert} eyebrow="Overview" title="Case details">
            <dl className="space-y-2.5 text-[11px]">
              {[
                ["Category", post.category],
                ["Severity", post.severity],
                ["Risk score", `${post.riskScore || 0}/100 (${post.riskLevel || "Low"})`],
                ["Area", post.area || "Not set"],
                ["Location", post.location || "Not set"],
                ["Reported by", post.authorName || "Citizen"],
                ["Citizen email", post.authorEmail || "Hidden"],
                ["Submitted", formatDateTime(post.createdAt)],
                ["Deadline", post.deadline ? formatDateTime(post.deadline) : "Not set"],
                ["Resolution", post.resolutionStatus || "Awaiting Citizen"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="text-right font-semibold text-forest-950">{value}</dd>
                </div>
              ))}
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-400">Severity label</dt>
                <dd className={cn("font-bold", severityStyles[post.severity] || "text-slate-600")}>
                  {post.severity}
                </dd>
              </div>
            </dl>
          </Section>

          <Section icon={MapPin} eyebrow="Location" title="Map">
            {mapMarkers.length ? (
              <LeafletMap markers={mapMarkers} height="230px" />
            ) : (
              <p className="rounded-xl border border-dashed border-forest-900/15 bg-white/40 px-3.5 py-6 text-center text-[11px] text-slate-500">
                No GPS coordinates were provided.
              </p>
            )}
          </Section>

          {(post.evidence || []).length > 0 && (
            <Section icon={ClipboardCheck} eyebrow="Citizen evidence" title="Attached files">
              <EvidenceGallery items={post.evidence} />
            </Section>
          )}

          {duplicates.length > 0 && (
            <Section icon={AlertCircle} eyebrow="Duplicate check" title="Similar complaints">
              <ul className="space-y-2">
                {duplicates.map((item) => (
                  <li key={item.id} className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2.5">
                    <p className="text-[11px] font-bold text-forest-950">{item.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {item.score}% match · {item.area || item.location || "Unknown area"}
                    </p>
                    <p className="text-[9px] font-semibold text-amber-700">{item.reasons.join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section icon={StickyNote} eyebrow="Private" title="Internal notes">
            <form onSubmit={handleNote} className="space-y-2">
              <textarea
                rows={3}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Only officers and admins can read this."
                className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-3.5 py-3 text-[11px] leading-5 text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
              {noteError && <p className="text-[10px] font-medium text-rose-600">{noteError}</p>}
              <Button type="submit" variant="outline" size="sm" disabled={savingNote} className="w-full gap-1.5">
                <MessageSquarePlus className="h-3.5 w-3.5" />
                {savingNote ? "Adding..." : "Add note"}
              </Button>
            </form>

            {(post.internalNotes || []).length > 0 ? (
              <ul className="mt-4 space-y-2">
                {[...post.internalNotes].reverse().map((item, index) => (
                  <li
                    key={`${item.addedAt}-${index}`}
                    className="rounded-xl border border-forest-900/[0.07] bg-white/55 px-3 py-2.5"
                  >
                    <p className="text-[11px] leading-5 text-slate-600">{item.note}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {item.addedBy?.name || "Officer"} · {formatDateTime(item.addedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[10px] text-slate-400">No internal notes yet.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

export default ComplaintWorkspace;
