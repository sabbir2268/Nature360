import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import GlassCard from "../../../components/ui/GlassCard";
import Reveal from "../../../components/ui/Reveal";
import SectionHeading from "../../../components/ui/SectionHeading";
import { problems } from "../data/landingData";

function Problems() {
  return (
    <section className="relative overflow-hidden bg-[#F1F7F2] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.9),transparent_58%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-lime-200/20 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What we report"
          title={
            <>
              What Are We <span className="text-gradient">Fighting Against?</span>
            </>
          }
          description="Environmental problems are often local, repeated, and easy to miss. Nature360 gives each issue a clear place to be seen and followed."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <Reveal key={problem.title} delay={index * 0.07}>
                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }} className="h-full">
                  <GlassCard interactive className="group h-full overflow-hidden p-5">
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${problem.accent} opacity-70`} />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/75 shadow-sm ${problem.iconClass}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full border border-white/70 bg-white/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                          {problem.tag}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-[15px] font-bold tracking-[-0.02em] text-forest-950">
                        {problem.title}
                      </h3>
                      <p className="mt-2 text-[12px] leading-6 text-slate-600">{problem.description}</p>
                      <a
                        href="#how-it-works"
                        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[10px] font-bold text-forest-700 opacity-0 transition-all duration-300 group-hover:opacity-100"
                      >
                        Report this issue
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </GlassCard>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-500">
          <span>Every report starts with a location and evidence.</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
          <span>Every category follows a visible review path.</span>
        </Reveal>
      </div>
    </section>
  );
}

export default Problems;
