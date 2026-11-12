import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import Reveal from "../../../components/ui/Reveal";
import SectionHeading from "../../../components/ui/SectionHeading";
import Button from "../../../components/ui/Button";
import { timelineSteps } from "../data/landingData";

function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(163,230,53,0.12),transparent_55%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From Observation to <span className="text-gradient">Resolution.</span>
            </>
          }
          description="A clear, six-step path keeps citizens informed and gives officers and volunteers a shared view of every case."
        />

        <div className="relative mt-12 sm:mt-16">
          <div className="absolute left-6 top-8 hidden h-px bg-forest-900/10 md:left-[8.33%] md:right-[8.33%] md:block">
            <motion.div
              initial={{ scaleX: reduceMotion ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full origin-left bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-500"
            />
          </div>
          <div className="absolute bottom-8 left-6 top-8 w-px bg-forest-900/10 md:hidden">
            <motion.div
              initial={{ scaleY: reduceMotion ? 1 : 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full origin-top bg-gradient-to-b from-emerald-500 via-lime-400 to-emerald-500"
            />
          </div>

          <ol className="grid gap-7 md:grid-cols-6 md:gap-3">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.li
                key={step.title}
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex gap-4 md:block md:text-center"
              >
                    <div className="relative z-10 shrink-0 md:flex md:justify-center">
                      <span className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/80 bg-white/85 text-forest-800 shadow-[0_12px_30px_-18px_rgba(5,46,36,0.5)] backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1 group-hover:border-emerald-300 group-hover:text-emerald-700 md:h-14 md:w-14">
                        <Icon className="h-5 w-5" />
                        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-forest-950 text-[9px] font-bold text-lime-300 ring-2 ring-white">
                          {index + 1}
                        </span>
                      </span>
                    </div>

                    <div className="rounded-2xl pb-1 md:mt-6 md:px-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        {step.label}
                      </span>
                      <h3 className="mt-1.5 font-display text-[14px] font-bold leading-snug tracking-[-0.02em] text-forest-950">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{step.description}</p>
                    </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <Reveal delay={0.15} className="mt-12 sm:mt-14">
          <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-forest-900/[0.08] bg-white/60 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/12 text-emerald-700">
                <Eye className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-forest-950">Transparency at every step</p>
                <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-slate-500">
                  Citizens see verification, investigation, and action updates. Officers keep a
                  clear audit trail. Volunteers know exactly what needs attention.
                </p>
              </div>
            </div>
            <Button href="#features" variant="outline" size="sm" className="group shrink-0">
              See platform features
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default HowItWorks;
