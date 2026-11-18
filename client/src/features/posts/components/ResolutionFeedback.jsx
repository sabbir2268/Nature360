import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleSlash2,
  FileText,
  Flag,
  MessageSquareText,
  Paperclip,
  RotateCcw,
  Send,
  Upload,
  X,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";
import { cn } from "../../../utils/cn";
import { MESSAGE_REQUIRED_ACTIONS, submitResolutionResponse } from "../services/postServices";
import {
  ALLOWED_EVIDENCE_TYPES,
  formatFileSize,
  uploadEvidence,
  validateEvidenceFile,
} from "../../../lib/storage";

const actionOptions = [
  {
    value: "Confirmed",
    label: "Confirm resolution",
    hint: "The problem is fully fixed.",
    icon: CheckCircle2,
    activeClass: "border-emerald-500/50 bg-emerald-50 text-emerald-800",
  },
  {
    value: "Feedback",
    label: "Send feedback",
    hint: "Tell the team what still needs attention.",
    icon: MessageSquareText,
    activeClass: "border-sky-500/50 bg-sky-50 text-sky-800",
  },
  {
    value: "Additional Evidence",
    label: "Add evidence",
    hint: "Attach a photo, video or PDF (max 25 MB).",
    icon: Paperclip,
    activeClass: "border-indigo-500/50 bg-indigo-50 text-indigo-800",
  },
  {
    value: "Reopened",
    label: "Reopen issue",
    hint: "The problem came back or is still present.",
    icon: RotateCcw,
    activeClass: "border-amber-500/50 bg-amber-50 text-amber-800",
  },
  {
    value: "Incorrect Resolution",
    label: "Report incorrect",
    hint: "The resolution does not match reality.",
    icon: Flag,
    activeClass: "border-rose-500/50 bg-rose-50 text-rose-800",
  },
];

const responseStyles = {
  Confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Feedback: "border-sky-200 bg-sky-50 text-sky-700",
  "Additional Evidence": "border-indigo-200 bg-indigo-50 text-indigo-700",
  Reopened: "border-amber-200 bg-amber-50 text-amber-700",
  "Incorrect Resolution": "border-rose-200 bg-rose-50 text-rose-700",
};

const resolutionStateStyles = {
  "Awaiting Citizen": "border-amber-200 bg-amber-50 text-amber-700",
  Confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Reopened: "border-orange-200 bg-orange-50 text-orange-700",
  Disputed: "border-rose-200 bg-rose-50 text-rose-700",
};

function ResolutionFeedback({ post, onUpdated }) {
  const alreadyConfirmed = post.resolutionStatus === "Confirmed";
  const [action, setAction] = useState(alreadyConfirmed ? "Feedback" : "Confirmed");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const responses = post.citizenResponses || [];
  const isResolved = post.status === "Resolved";
  const currentResolution = post.resolutionStatus || "Awaiting Citizen";
  const selected = actionOptions.find((option) => option.value === action) ?? actionOptions[0];

  const handleFileChange = (event) => {
    setError("");
    const chosen = event.target.files?.[0] || null;

    if (!chosen) {
      setFile(null);
      return;
    }

    const validationError = validateEvidenceFile(chosen);
    if (validationError) {
      setError(validationError);
      setFile(null);
      event.target.value = "";
      return;
    }

    setFile(chosen);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = message.trim();

    if (alreadyConfirmed && action === "Confirmed") {
      setError("You have already confirmed this resolution.");
      return;
    }

    if (MESSAGE_REQUIRED_ACTIONS.includes(action) && trimmed.length < 10) {
      setError("Add a short explanation of at least 10 characters.");
      return;
    }

    if (action === "Additional Evidence" && !file) {
      setError("Attach an evidence file (image or PDF) to submit additional evidence.");
      return;
    }

    setSubmitting(true);

    try {
      let evidence = null;
      if (file) {
        evidence = await uploadEvidence(file, `complaints/${post.id}/responses`);
      }

      const result = await submitResolutionResponse(post.id, {
        action,
        message: trimmed,
        evidence,
      });

      onUpdated?.(result.post);
      setSuccess(result.message);
      setMessage("");
      clearFile();
      setAction("Confirmed");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Your voice
          </p>
          <h3 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
            Resolution feedback
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold",
            resolutionStateStyles[currentResolution] ?? resolutionStateStyles["Awaiting Citizen"],
          )}
        >
          {currentResolution}
        </span>
      </div>

      {!isResolved ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-dashed border-forest-900/15 bg-white/40 px-4 py-4">
          <CircleSlash2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-[11px] leading-5 text-slate-500">
            Resolution feedback becomes available once this complaint is marked{" "}
            <span className="font-bold text-forest-900">Resolved</span>. You can then confirm the
            fix, send feedback, attach evidence, reopen the issue or report an incorrect
            resolution.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {actionOptions.map((option) => {
              const Icon = option.icon;
              const isActive = action === option.value;
              const isDisabled = alreadyConfirmed && option.value === "Confirmed";

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setAction(option.value);
                    setError("");
                  }}
                  disabled={isDisabled || submitting}
                  aria-pressed={isActive}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
                    isActive
                      ? option.activeClass
                      : "border-forest-900/10 bg-white/60 text-slate-600 hover:border-emerald-500/30 hover:bg-white",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold">{option.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-4 opacity-70">
                      {isDisabled ? "Already confirmed" : option.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <label
              htmlFor="resolution-message"
              className="mb-1.5 block text-[11px] font-bold text-forest-900"
            >
              {selected.value === "Confirmed" ? "Note (optional)" : "Explanation"}
            </label>
            <textarea
              id="resolution-message"
              name="message"
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
              disabled={submitting}
              placeholder={
                selected.value === "Confirmed"
                  ? "Anything you want to add about the completed work."
                  : "Describe what still needs attention, or why the resolution is not correct."
              }
              className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
            />
            <p className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-slate-400">
              <span>
                {MESSAGE_REQUIRED_ACTIONS.includes(selected.value)
                  ? "At least 10 characters required."
                  : "Optional for this action."}
              </span>
              <span>{message.length}/1000</span>
            </p>
          </div>

          <div>
            <label
              htmlFor="resolution-evidence"
              className="mb-1.5 block text-[11px] font-bold text-forest-900"
            >
              Evidence {selected.value === "Additional Evidence" ? "" : "(optional)"}
            </label>
            <input
              ref={fileInputRef}
              id="resolution-evidence"
              name="evidence"
              type="file"
              accept={ALLOWED_EVIDENCE_TYPES.join(",")}
              onChange={handleFileChange}
              disabled={submitting}
              className="block w-full cursor-pointer rounded-xl border border-forest-900/10 bg-white/80 px-3 py-2.5 text-[11px] text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-forest-950 file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:text-lime-200 hover:file:brightness-110 disabled:opacity-60"
            />
            {file ? (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-[10px] font-semibold text-emerald-800">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="shrink-0 text-emerald-600">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove attached evidence"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-emerald-700 hover:bg-emerald-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                <Upload className="h-3 w-3" />
                JPG, PNG, WebP, GIF, MP4, WebM, MOV or PDF · up to 25 MB
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] font-medium text-rose-700"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          {success && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-3 text-[11px] font-semibold text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="flex-1 leading-5">{success}</p>
              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss message"
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-emerald-700 hover:bg-emerald-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] leading-5 text-slate-400">
              Your response is attached to this complaint and visible in its tracking history.
            </p>
            <Button type="submit" size="md" disabled={submitting} className="w-full gap-1.5 sm:w-auto">
              {submitting ? "Sending…" : "Submit response"}
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {responses.length > 0 && (
        <div className="mt-5 border-t border-forest-900/[0.07] pt-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Response history
          </p>
          <ul className="mt-3 space-y-2.5">
            {responses
              .slice()
              .reverse()
              .map((entry, index) => (
                <li
                  key={`${entry.action}-${entry.respondedAt}-${index}`}
                  className="rounded-xl border border-forest-900/[0.06] bg-white/60 px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[9px] font-bold",
                        responseStyles[entry.action] ?? "border-slate-200 bg-slate-50 text-slate-600",
                      )}
                    >
                      {entry.action}
                    </span>
                    <time
                      dateTime={entry.respondedAt || undefined}
                      className="text-[10px] font-medium text-slate-400"
                    >
                      {formatDateTime(entry.respondedAt)}
                    </time>
                  </div>
                  {entry.message && (
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-600">{entry.message}</p>
                  )}
                  {entry.evidence?.name && (
                    <a
                      href={entry.evidence.url || entry.evidence.data}
                      target="_blank"
                      rel="noreferrer"
                      download={entry.evidence.name}
                      className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="truncate">{entry.evidence.name}</span>
                      <span className="shrink-0 font-medium text-indigo-500">
                        {formatFileSize(entry.evidence.size)}
                      </span>
                    </a>
                  )}
                  <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    {entry.respondedBy?.role || "Citizen"} · {entry.respondedBy?.name || "EcoTrack"}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ResolutionFeedback;
