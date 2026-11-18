import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  FileText,
  MapPin,
  Paperclip,
  Send,
  Tag,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import SelectField from "../../../components/ui/SelectField";
import LocationPicker from "../../../components/maps/LocationPicker";
import EvidenceGallery from "../../../components/ui/EvidenceGallery";
import {
  POST_CATEGORIES,
  POST_SEVERITIES,
} from "../services/postServices";
import { getPublicSettings } from "../../settings/services/settingsServices";
import {
  formatFileSize,
  uploadEvidenceList,
  validateEvidenceFile,
} from "../../../lib/storage";
import { cn } from "../../../utils/cn";
import { hasCoordinates } from "../../../utils/geo";

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function ComplaintForm({ initial, onSubmit, submitLabel = "Submit complaint" }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || "",
    category: initial?.category || POST_CATEGORIES[0],
    severity: initial?.severity || "Medium",
    location: initial?.location || "",
    area: initial?.area || "",
    description: initial?.description || "",
    incidentAt: toDateInput(initial?.incidentAt),
  }));
  const [coordinates, setCoordinates] = useState(() => {
    if (hasCoordinates(initial?.coordinates)) {
      return { lat: initial.coordinates.lat, lng: initial.coordinates.lng };
    }
    return null;
  });
  const [existingEvidence, setExistingEvidence] = useState(initial?.evidence || []);
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState(POST_CATEGORIES);
  const [severities, setSeverities] = useState(POST_SEVERITIES);
  const [submitting, setSubmitting] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getPublicSettings()
      .then((settings) => {
        if (!active) return;
        const nextCategories = settings.categories.map((item) => item.name);
        const nextSeverities = settings.severityLevels.map((item) => item.name);
        if (nextCategories.length) setCategories(nextCategories);
        if (nextSeverities.length) setSeverities(nextSeverities);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const filePreview = useMemo(
    () =>
      files.map((file) => ({
        file,
        name: file.name,
        size: formatFileSize(file.size),
      })),
    [files],
  );

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    setError("");

    for (const file of selected) {
      const validationError = validateEvidenceFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        event.target.value = "";
        return;
      }
    }

    setFiles((current) => [...current, ...selected].slice(0, 6));
    event.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, position) => position !== index));
  };

  const removeExisting = (index) => {
    setExistingEvidence((current) => current.filter((_, position) => position !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.title.trim().length < 5) {
      setError("Give the complaint a title of at least 5 characters.");
      return;
    }
    if (form.description.trim().length < 20) {
      setError("Describe the problem with at least 20 characters.");
      return;
    }

    setSubmitting(true);

    try {
      let uploaded = [];
      if (files.length > 0) {
        setUploadNote(`Uploading ${files.length} file${files.length === 1 ? "" : "s"} to Firebase Storage...`);
        uploaded = await uploadEvidenceList(files, "complaints");
      }
      setUploadNote("Saving complaint...");

      await onSubmit({
        title: form.title.trim(),
        category: form.category,
        severity: form.severity,
        location: form.location.trim(),
        area: form.area.trim() || form.location.trim(),
        description: form.description.trim(),
        incidentAt: form.incidentAt ? new Date(`${form.incidentAt}T12:00:00`).toISOString() : null,
        coordinates: coordinates
          ? { lat: coordinates.lat, lng: coordinates.lng, accuracy: coordinates.accuracy ?? null }
          : { lat: null, lng: null },
        evidence: [...existingEvidence, ...uploaded],
      });
    } catch (submitError) {
      setError(submitError?.message || "The complaint could not be saved. Please try again.");
      setSubmitting(false);
      setUploadNote("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-[1.75rem] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Complaint details
          </p>
          <h2 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
            {initial ? "Update what happened" : "Tell us what happened"}
          </h2>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest-900 to-emerald-600 text-lime-300 shadow-sm">
          <FileText className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <TextField
          id="complaint-title"
          label="Complaint title"
          name="title"
          type="text"
          icon={Tag}
          placeholder="e.g. Overflowing bins near Central Market"
          value={form.title}
          onChange={handleChange}
          maxLength={160}
          minLength={5}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="complaint-category"
            label="Category"
            name="category"
            icon={Tag}
            options={categories}
            value={form.category}
            onChange={handleChange}
          />
          <SelectField
            id="complaint-severity"
            label="Severity"
            name="severity"
            icon={TriangleAlert}
            options={severities}
            value={form.severity}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="complaint-area"
            label="Area / neighbourhood"
            name="area"
            type="text"
            icon={MapPin}
            placeholder="e.g. Mirpur 10"
            value={form.area}
            onChange={handleChange}
            maxLength={120}
          />
          <div>
            <label htmlFor="complaint-incident" className="mb-1.5 block text-[11px] font-bold text-forest-900">
              When did you notice it?
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="complaint-incident"
                name="incidentAt"
                type="date"
                value={form.incidentAt}
                max={new Date().toISOString().slice(0, 10)}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-forest-900/10 bg-white/80 pl-10 pr-4 text-sm text-forest-950 outline-none transition-all duration-300 focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>
        </div>

        <TextField
          id="complaint-location"
          label="Location / address"
          name="location"
          type="text"
          icon={MapPin}
          placeholder="Street, landmark or address officers can find"
          value={form.location}
          onChange={handleChange}
          maxLength={300}
        />

        <LocationPicker value={coordinates} onChange={setCoordinates} height="300px" />

        <div>
          <label htmlFor="complaint-description" className="mb-1.5 block text-[11px] font-bold text-forest-900">
            Description
          </label>
          <textarea
            id="complaint-description"
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
            maxLength={2000}
            required
            minLength={20}
            placeholder="Describe the problem, how long it has been there, and anything officers should know."
            className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          />
          <p className="mt-1.5 text-right text-[10px] font-medium text-slate-400">
            {form.description.length}/2000 characters
          </p>
        </div>

        <div className="rounded-2xl border border-forest-900/[0.07] bg-white/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest-900">
                <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                Photo, video or document evidence
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                JPG, PNG, WebP, GIF, MP4, WebM, MOV or PDF. Maximum 25 MB per file.
              </p>
            </div>
            <label
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100",
                (submitting || files.length >= 6) && "pointer-events-none opacity-50",
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              Add files
              <input
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={handleFiles}
                className="hidden"
                disabled={submitting}
              />
            </label>
          </div>

          {existingEvidence.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Attached evidence
              </p>
              <div className="space-y-1.5">
                {existingEvidence.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-forest-900/[0.06] bg-white/70 px-2.5 py-2"
                  >
                    <Paperclip className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-forest-950">
                      {item.name || "Evidence file"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExisting(index)}
                      className="grid h-6 w-6 place-items-center rounded-md text-rose-500 hover:bg-rose-50"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setExistingEvidence([])}
                className="mt-2 text-[10px] font-bold text-rose-600 hover:underline"
              >
                Remove all attached evidence
              </button>
            </div>
          )}

          {filePreview.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Ready to upload
              </p>
              {filePreview.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-50/60 px-2.5 py-2"
                >
                  <Upload className="h-3 w-3 shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-forest-950">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-slate-400">{item.size}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="grid h-6 w-6 place-items-center rounded-md text-rose-500 hover:bg-rose-50"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {existingEvidence.length > 0 && (
            <div className="mt-3">
              <EvidenceGallery items={existingEvidence} />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] font-medium text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] leading-5 text-slate-400">
          {uploadNote || "Your personal details stay private. Evidence is stored in Firebase Storage."}
        </p>
        <Button type="submit" size="lg" className="group w-full sm:w-auto" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
          <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Button>
      </div>
    </form>
  );
}
