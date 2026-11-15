import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, FileText, MapPin, Send, Tag, TriangleAlert } from "lucide-react";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import SelectField from "../../../components/ui/SelectField";
import Reveal from "../../../components/ui/Reveal";
import {
  POST_CATEGORIES,
  POST_SEVERITIES,
  createPost,
} from "../../posts/services/postServices";
import { getApiErrorMessage } from "../../../lib/api";
import { PATHS, postDetailsPath } from "../../../utils/paths";

const emptyForm = {
  title: "",
  category: POST_CATEGORIES[0],
  severity: "Medium",
  location: "",
  description: "",
};

const tips = [
  "Describe what you saw and when you saw it.",
  "Add a landmark or street so officers can find the exact spot.",
  "Keep it factual — reports with clear details get resolved faster.",
];

function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const created = await createPost({
        title: form.title.trim(),
        category: form.category,
        severity: form.severity,
        location: form.location.trim(),
        description: form.description.trim(),
      });

      setForm(emptyForm);
      navigate(postDetailsPath(created.id), {
        replace: true,
        state: { message: "Complaint submitted. Follow its progress on this page." },
      });
    } catch (submitError) {
      console.error("Unable to create post:", submitError);
      setError(getApiErrorMessage(submitError));
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <Reveal>
        <form
          onSubmit={handleSubmit}
          className="glass rounded-[1.75rem] p-5 sm:p-7"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                Report details
              </p>
              <h2 className="mt-1 font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
                Tell us what happened
              </h2>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest-900 to-emerald-600 text-lime-300 shadow-sm">
              <FileText className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <TextField
              id="post-title"
              label="Post title"
              name="title"
              type="text"
              icon={Tag}
              placeholder="e.g. Overflowing bins near Central Market"
              value={form.title}
              onChange={handleChange}
              maxLength={120}
              required
              minLength={5}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="post-category"
                label="Category"
                name="category"
                icon={Tag}
                options={POST_CATEGORIES}
                value={form.category}
                onChange={handleChange}
              />
              <SelectField
                id="post-severity"
                label="Severity"
                name="severity"
                icon={TriangleAlert}
                options={POST_SEVERITIES}
                value={form.severity}
                onChange={handleChange}
              />
            </div>

            <TextField
              id="post-location"
              label="Location"
              name="location"
              type="text"
              icon={MapPin}
              placeholder="Area, street, or nearest landmark"
              value={form.location}
              onChange={handleChange}
              maxLength={160}
              required
            />

            <div>
              <label htmlFor="post-description" className="mb-1.5 block text-[11px] font-bold text-forest-900">
                Description
              </label>
              <textarea
                id="post-description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                maxLength={800}
                required
                minLength={20}
                placeholder="Describe the problem, how long it has been there, and anything officers should know."
                className="w-full resize-y rounded-xl border border-forest-900/10 bg-white/80 px-4 py-3 text-sm leading-6 text-forest-950 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
              <p className="mt-1.5 text-right text-[10px] font-medium text-slate-400">
                {form.description.length}/800 characters
              </p>
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
              Your name and email are attached privately to this report.
            </p>
            <Button type="submit" size="lg" className="group w-full sm:w-auto" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish post"}
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </form>
      </Reveal>

      <Reveal delay={0.08} className="space-y-4">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-5 text-white shadow-[0_30px_80px_-40px_rgba(5,46,36,0.6)] sm:p-6">
          <div className="grid-pattern-dark pointer-events-none absolute inset-0 opacity-80" />
          <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-lime-300/15 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-lime-200">
              Tips for a good report
            </span>
            <ul className="mt-4 space-y-3">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-[11px] leading-5 text-white/65">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-300" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass rounded-[1.75rem] p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">Next step</p>
          <h3 className="mt-1 font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
            Follow your report
          </h3>
          <p className="mt-2 text-[11px] leading-6 text-slate-500">
            After publishing, open Track Post to see the status of every report you have submitted.
          </p>
          <Button
            to={PATHS.TRACK_POST}
            variant="outline"
            size="sm"
            className="mt-4 w-full gap-1.5"
          >
            Go to Track Post
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Reveal>
    </div>
  );
}

export default CreatePost;
