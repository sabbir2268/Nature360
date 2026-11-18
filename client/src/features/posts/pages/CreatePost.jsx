import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPinned, Radar, ShieldCheck } from "lucide-react";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/ui/Reveal";
import ComplaintForm from "../components/ComplaintForm";
import { createPost } from "../services/postServices";
import { PATHS, postDetailsPath } from "../../../utils/paths";

const tips = [
  "Describe what you saw, when you saw it, and how serious it looks.",
  "Place a GPS pin so officers and volunteers can find the exact spot.",
  "Attach photos or short videos. Clear evidence is verified faster.",
  "You can edit or soft-delete a complaint until investigation begins.",
];

function CreatePost() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const created = await createPost(payload);
    navigate(postDetailsPath(created.id), {
      replace: true,
      state: { message: "Complaint submitted. Follow its progress on this page." },
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <Reveal>
        <ComplaintForm onSubmit={handleSubmit} submitLabel="Submit complaint" />
      </Reveal>

      <Reveal delay={0.08} className="space-y-4">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-5 text-white shadow-[0_30px_80px_-40px_rgba(5,46,36,0.6)] sm:p-6">
          <div className="grid-pattern-dark pointer-events-none absolute inset-0 opacity-80" />
          <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-lime-300/15 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-lime-200">
              Tips for a strong complaint
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
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            What happens next
          </p>
          <h3 className="mt-1 font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
            Complaint workflow
          </h3>
          <ol className="mt-3 space-y-2.5">
            {[
              "Officers review and verify the complaint.",
              "Severity, priority and duplicates are assessed.",
              "A field volunteer is assigned with a deadline.",
              "Corrective action is recorded and the complaint resolved.",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-2.5 text-[11px] leading-5 text-slate-500">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-[9px] font-extrabold text-emerald-700">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Button to={PATHS.TRACK_POST} variant="outline" size="sm" className="mt-4 w-full gap-1.5">
            <Radar className="h-3.5 w-3.5" />
            Go to my complaints
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="glass rounded-[1.75rem] p-5">
          <div className="flex items-start gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
              <MapPinned className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-sm font-extrabold text-forest-950">GPS-tagged location</h3>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                A map pin helps hotspot detection group reports by area and calculate pollution risk.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2.5 border-t border-forest-900/[0.07] pt-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-sm font-extrabold text-forest-950">Private by default</h3>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Your email is only visible to authorised officers and administrators. Records are
                never hard-deleted.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default CreatePost;
