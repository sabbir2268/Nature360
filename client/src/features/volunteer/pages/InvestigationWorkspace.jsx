import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Crosshair,
  FileText,
  MapPin,
  Paperclip,
  Send,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import SelectField from "../../../components/ui/SelectField";
import EvidenceGallery from "../../../components/ui/EvidenceGallery";
import LocationPicker from "../../../components/maps/LocationPicker";
import LeafletMap from "../../../components/maps/LeafletMap";
import StatusBadge from "../../posts/components/StatusBadge";
import { PriorityBadge, RiskBadge } from "../../../components/ui/Badge";
import { getPost } from "../../posts/services/postServices";
import {
  submitInvestigationReport,
  updateInvestigation,
} from "../services/volunteerServices";
import { getApiErrorMessage } from "../../../lib/api";
import {
  formatFileSize,
  uploadEvidenceList,
  validateEvidenceFile,
} from "../../../lib/storage";
import { formatDateTime } from "../../../utils/format";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";
import { hasCoordinates } from "../../../utils/geo";

const INVESTIGATION_STATES = ["Pending", "In Progress", "Submitted", "Completed"];

function InvestigationWorkspace() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [form, setForm] = useState({ status: "In Progress", observations: "" });
  const [gps, setGps] = useState(null);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [report, setReport] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const nextPost = await getPost(postId);
      setPost(nextPost);
      setForm({
        status:
          nextPost.investigation?.status === "Pending"
            ? "In Progress"
            : nextPost.investigation?.status || "In Progress",
        observations: nextPost.investigation?.observations || "",
      });
      const investigationGps = nextPost.investigation?.gps;
      if (hasCoordinates(investigationGps)) {
        setGps({
          lat: Number(investigationGps.lat),
          lng: Number(investigationGps.lng),
          accuracy: investigationGps.accuracy ?? null,
        });
      }
      setReport(nextPost.investigation?.report || "");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const markers = useMemo(() => {
    if (!post) return [];
    const result = [];

    if (hasCoordinates(post.coordinates)) {
      result.push({
        id: "complaint",
        lat: Number(post.coordinates.lat),
        lng: Number(post.coordinates.lng),
        label: "Complaint location",
        color: "#dc2626",
      });
    }

    if (gps) {
      result.push({
        id: "investigation",
        lat: Number(gps.lat),
        lng: Number(gps.lng),
        label: "Your investigation pin",
        color: "#2563eb",
      });
    }

    return result;
  }, [post, gps]);

  const handleFiles = (event) => {
    const chosen = Array.from(event.target.files || []);
    setSaveError("");
    for (const file of chosen) {
      const validationError = validateEvidenceFile(file);
      if (validationError) {
        setSaveError(`${file.name}: ${validationError}`);
        event.target.value = "";
        return;
      }
    }
    setFiles((current) => [...current, ...chosen].slice(0, 6));
    event.target.value = "";
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setSaveError("GPS is not available in this browser. Place the pin manually on the map.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGps({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        setSaveError("Could not read your GPS location. Place the pin manually on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const saveProgress = async (event) => {
    event.preventDefault();
    setSaveError("");
    setSaving(true);

    try {
      let uploaded = [];
      if (files.length > 0) {
        uploaded = await uploadEvidenceList(files, `complaints/${postId}/investigation`);
      }

      const nextPost = await updateInvestigation(postId, {
        status: form.status,
        observations: form.observations,
        gps: gps || { lat: null, lng: null },
        ...(uploaded.length ? { evidence: uploaded } : {}),
      });

      setPost(nextPost);
      setFiles([]);
      setFlash("Investigation progress saved.");
    } catch (saveFailure) {
      setSaveError(getApiErrorMessage(saveFailure));
    } finally {
      setSaving(false);
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    setReportError("");

    if (report.trim().length < 20) {
      setReportError("Write an investigation report of at least 20 characters.");
      return;
    }

    setSubmittingReport(true);
    try {
      let uploaded = [];
      if (files.length > 0) {
        uploaded = await uploadEvidenceList(files, `complaints/${postId}/investigation`);
      }

      const nextPost = await submitInvestigationReport(postId, {
        report: report.trim(),
        observations: form.observations,
        gps: gps || { lat: null, lng: null },
        ...(uploaded.length ? { evidence: uploaded } : {}),
      });

      setPost(nextPost);
      setFiles([]);
      setFlash("Report submitted. The officer team has been notified.");
    } catch (submitFailure) {
      setReportError(getApiErrorMessage(submitFailure));
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white/60" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-60 animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
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
        <p className="mt-1 text-[11px] text-slate-500">{error || "This case could not be loaded."}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" size="sm" onClick={load}>
            Retry
          </Button>
          <Button to={PATHS.ASSIGNED} variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            My cases
          </Button>
        </div>
      </div>
    );
  }

  const overdue =
    post.deadline && new Date(post.deadline).getTime() < now && post.status !== "Resolved";

  return (
    <div className="space-y-5">
      <Link
        to={PATHS.ASSIGNED}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-forest-900 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        My assigned cases
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
          <button type="button" onClick={() => setFlash("")} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <form onSubmit={saveProgress} className="glass rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
                <ClipboardCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  FR-08
                </p>
                <h3 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                  Field investigation
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <SelectField
                id="investigation-status"
                label="Investigation status"
                options={INVESTIGATION_STATES}
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              />

              <div>
                <label htmlFor="investigation-observations" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                  On-site observations
                </label>
                <textarea
                  id="investigation-observations"
                  rows={4}
                  value={form.observations}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, observations: event.target.value }))
                  }
                  maxLength={4000}
                  placeholder="What did you find on site? Note quantities, access, safety issues and who you spoke to."
                  className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-forest-900">GPS location</label>
                  <button
                    type="button"
                    onClick={locate}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                  >
                    <Crosshair className="h-3 w-3" />
                    Use current location
                  </button>
                </div>
                <LocationPicker value={gps} onChange={setGps} height="240px" />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-forest-900">Evidence</label>
                  <label
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100",
                      (saving || files.length >= 6) && "pointer-events-none opacity-50",
                    )}
                  >
                    <Upload className="h-3 w-3" />
                    Add files
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      onChange={handleFiles}
                      className="hidden"
                      disabled={saving}
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-50/60 px-2.5 py-2"
                      >
                        <Paperclip className="h-3 w-3 shrink-0 text-emerald-600" />
                        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-forest-950">
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-400">{formatFileSize(file.size)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((current) => current.filter((_, position) => position !== index))
                          }
                          className="grid h-5 w-5 place-items-center rounded text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(post.investigation?.evidence || []).length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Uploaded so far
                    </p>
                    <EvidenceGallery items={post.investigation.evidence} />
                  </div>
                )}
              </div>

              {saveError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
                  {saveError}
                </p>
              )}

              <Button type="submit" size="sm" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save progress"}
              </Button>
            </div>
          </form>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={0.05}>
            <div className="glass rounded-[1.75rem] p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Location
                  </p>
                  <h3 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                    Complaint and investigation pins
                  </h3>
                </div>
              </div>
              <div className="mt-3">
                {markers.length ? (
                  <LeafletMap markers={markers} height="260px" />
                ) : (
                  <p className="rounded-xl border border-dashed border-forest-900/15 bg-white/40 px-3.5 py-8 text-center text-[11px] text-slate-500">
                    No coordinates available yet.
                  </p>
                )}
              </div>
              <dl className="mt-3 space-y-2 text-[11px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Area</dt>
                  <dd className="font-semibold text-forest-950">{post.area || "Not set"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Address</dt>
                  <dd className="text-right font-semibold text-forest-950">
                    {post.location || "Not set"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Deadline</dt>
                  <dd className={cn("font-semibold", overdue ? "text-rose-600" : "text-forest-950")}>
                    {post.deadline ? formatDateTime(post.deadline) : "No deadline"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Severity</dt>
                  <dd className="font-semibold text-forest-950">
                    {post.severity}
                    <TriangleAlert className="ml-1 inline h-3 w-3 text-amber-500" />
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          {(post.evidence || []).length > 0 && (
            <Reveal delay={0.08}>
              <div className="glass rounded-[1.75rem] p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Citizen evidence
                </p>
                <h3 className="mt-1 font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                  What the citizen attached
                </h3>
                <div className="mt-3">
                  <EvidenceGallery items={post.evidence} />
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <Reveal delay={0.1}>
        <form onSubmit={submitReport} className="glass rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                Final step
              </p>
              <h3 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                Investigation report
              </h3>
            </div>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Summarise the condition, the root cause, actions you took or recommend, and attach the
            strongest evidence. Submitting notifies the officer team.
          </p>

          <textarea
            rows={5}
            value={report}
            onChange={(event) => setReport(event.target.value)}
            maxLength={6000}
            placeholder="Write your investigation report (at least 20 characters)."
            className="mt-3 w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />

          {reportError && (
            <p className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium text-rose-700">
              {reportError}
            </p>
          )}

          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-slate-400">
              {files.length > 0
                ? `${files.length} pending file${files.length === 1 ? "" : "s"} will be uploaded with the report.`
                : "Saving progress first is optional; you can submit directly."}
            </p>
            <Button type="submit" size="md" disabled={submittingReport} className="gap-1.5">
              {submittingReport ? "Submitting..." : "Submit report"}
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="glass rounded-[1.75rem] p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-emerald-600" />
            <h3 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
              Case timeline
            </h3>
          </div>
          <ol className="mt-4 space-y-3">
            {(post.statusHistory || []).map((entry, index) => (
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
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  );
}

export default InvestigationWorkspace;
