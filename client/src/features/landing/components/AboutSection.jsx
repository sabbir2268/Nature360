import { ArrowRight, Leaf, Quote, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "../../../components/common/Logo";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/ui/Reveal";
import SectionHeading from "../../../components/ui/SectionHeading";
import { aboutValues } from "../data/landingData";

function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_20%,rgba(163,230,53,0.11),transparent_50%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <SectionHeading
              align="left"
              eyebrow="About EcoTrack"
              title={
                <>
                  Built for the people who <span className="text-gradient">notice.</span>
                </>
              }
              description="EcoTrack is a citizen-powered environmental monitoring and response platform. It connects the people who see a problem with the volunteers who investigate it and the officers who can act on it."
            />

            <div className="mt-8 space-y-3">
              {aboutValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Reveal key={value.title} delay={index * 0.08}>
                    <div className="flex items-start gap-3 rounded-2xl border border-forest-900/[0.07] bg-white/55 p-4 backdrop-blur-sm transition-colors duration-300 hover:bg-white/75">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/12 text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-forest-950">{value.title}</p>
                        <p className="mt-1 text-[12px] leading-6 text-slate-500">{value.description}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={0.2} className="mt-6">
              <Button href="#how-it-works" variant="outline" size="md" className="group">
                See how it works
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="relative">
            <div className="glass rounded-[2.5rem] p-2.5 shadow-[0_35px_90px_-45px_rgba(5,46,36,0.5)]">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-6 text-white sm:p-8">
                <div className="grid-pattern-dark pointer-events-none absolute inset-0 opacity-80" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime-300/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <Logo tone="dark" />
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-lime-200">
                      <Sparkles className="h-3 w-3" />
                      Our mission
                    </span>
                  </div>

                  <p className="mt-8 font-display text-[1.6rem] font-extrabold leading-[1.16] tracking-[-0.04em] text-white sm:text-[1.9rem]">
                    Environmental accountability is a shared responsibility.
                  </p>
                  <p className="mt-4 text-[13px] leading-7 text-white/60">
                    Local observations become meaningful when they are easy to report, visible to
                    the right people, and followed through with real action.
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-2">
                    {["Citizens", "Volunteers", "Officers"].map((role, index) => (
                      <div
                        key={role}
                        className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 text-center backdrop-blur-sm"
                      >
                        <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 text-[10px] font-bold text-forest-950">
                          {index + 1}
                        </span>
                        <p className="mt-2 text-[10px] font-semibold text-white/80">{role}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime-300 text-forest-950">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <p className="text-[11px] font-medium leading-5 text-white/70">
                      Citizen-first. Transparent by design. Action-oriented.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="float-slow absolute -left-4 top-10 z-20 hidden rounded-2xl border border-white/70 bg-white/80 p-3 shadow-soft backdrop-blur-md sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/12 text-emerald-700">
                  <Leaf className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold text-forest-950">Together for a cleaner,</p>
                  <p className="text-[9px] font-bold text-forest-950">safer tomorrow.</p>
                </div>
              </div>
            </div>

            <div className="float-slower absolute -right-3 bottom-10 z-20 hidden rounded-2xl border border-white/70 bg-white/80 p-3 shadow-soft backdrop-blur-md sm:block">
              <Quote className="h-4 w-4 text-emerald-600" />
              <p className="mt-1.5 max-w-[150px] text-[9px] font-semibold leading-4 text-forest-900">
                Every environmental problem deserves attention.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
