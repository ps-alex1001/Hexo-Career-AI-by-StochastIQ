import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Printer,
  Download,
  Layers,
  BookOpen,
  X,
  ExternalLink,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface BlueprintScreenProps {
  data: any;
  initialProjectIndex?: number;
  onBack: () => void;
  scrollProgress?: number;
  onProjectChange?: (index: number) => void;
  onGenerate?: (index: number) => void;
  generatingIndices?: number[];
}

export function BlueprintScreen({
  data,
  initialProjectIndex = 0,
  onBack,
  scrollProgress = 0,
  onProjectChange,
  onGenerate,
  generatingIndices = [],
}: BlueprintScreenProps) {
  const [activeProjectIdx, setActiveProjectIdx] = useState(initialProjectIndex);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedResourcesStep, setSelectedResourcesStep] = useState<
    any | null
  >(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const activeProject = data.projects[activeProjectIdx];
  const isGenerating = generatingIndices.includes(activeProjectIdx);
  const hasBlueprint = activeProject?.blueprint && activeProject.blueprint.length > 0;

  // Sync internal state with prop if it changes from outside
  useEffect(() => {
    setActiveProjectIdx(initialProjectIndex);
  }, [initialProjectIndex]);

  useEffect(() => {
    // Force scroll to top on mount and project switch
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (hasBlueprint) {
      setActiveSectionId(`step-${activeProject.blueprint[0].id}`);
    } else {
      setActiveSectionId(null);
    }
  }, [activeProjectIdx, activeProject, hasBlueprint]);

  useEffect(() => {
    const handleScroll = () => {
      // Step highlighting
      const sections = document.querySelectorAll(
        'section[id^="step-"], section#expected-outcome',
      );
      let currentSectionId = activeSectionId;

      // We look for the last section whose top is above a certain threshold
      Array.from(sections).forEach((section) => {
        const rect = section.getBoundingClientRect();
        // 180px is a good threshold considering the expanded header
        if (rect.top <= 200) {
          currentSectionId = section.id;
        }
      });
      // Check if we are at the very bottom of the page
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        // If at bottom and there is an expected outcome, highlight it
        if (activeProject?.expectedOutcome) {
          currentSectionId = "expected-outcome";
        } else if (activeProject?.blueprint?.length > 0) {
          currentSectionId = `step-${activeProject.blueprint[activeProject.blueprint.length - 1].id}`;
        }
      }

      if (currentSectionId && currentSectionId !== activeSectionId) {
        setActiveSectionId(currentSectionId);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeProjectIdx, activeSectionId]);

  useEffect(() => {
    // We can remove the IntersectionObserver completely
  }, [activeProjectIdx, activeProject]);

  if (!data) return null;

  return (
    <div className="flex-grow flex flex-col bg-transparent w-full pt-4 print:pt-0">
      <div className="flex-grow flex items-start max-w-7xl w-full mx-auto relative px-6 lg:px-0">
        {/* Sidebar Navigation - FIXED */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-purple-100 dark:border-purple-500/20 py-12 px-8 sticky top-[136px] self-start max-h-[calc(100vh-160px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] print:hidden">
          <div className="mb-8">
            <div className="flex items-center gap-2 dark:text-purple-300/50 text-purple-900/50 mb-2">
              <Layers size={14} />
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase">
                Project Outline
              </h4>
            </div>
            <p className="dark:text-purple-100 text-slate-800 font-semibold text-sm leading-snug">
              {activeProject.title}
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {hasBlueprint && activeProject.blueprint.map((step: any, idx: number) => {
              const isActive = activeSectionId === `step-${step.id}`;
              return (
                <a
                  key={step.id}
                  href={`#step-${step.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSectionId(`step-${step.id}`);
                    const element = document.getElementById(`step-${step.id}`);
                    if (element) {
                      const yOffset = -180; // Match scroll-mt
                      const y =
                        element.getBoundingClientRect().top +
                        window.pageYOffset +
                        yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                  className={cn(
                    "group flex items-start gap-4 py-2 border-l-2 transition-all pl-4",
                    isActive
                      ? "border-purple-600 dark:border-purple-400 text-purple-900 dark:text-purple-900 bg-purple-50 dark:bg-purple-50 backdrop-blur-sm shadow-sm"
                      : "border-transparent dark:text-purple-300 text-slate-600 hover:text-purple-900 dark:hover:text-purple-100 dark:hover:bg-purple-900/20 hover:bg-purple-100/50",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] mt-0.5",
                      isActive
                        ? "text-purple-900"
                        : "dark:text-purple-300/50 text-purple-900/50",
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-medium leading-tight">
                    {step.title}
                  </span>
                </a>
              );
            })}

            {activeProject.expectedOutcome && (
              <a
                href="#expected-outcome"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSectionId("expected-outcome");
                  const element = document.getElementById("expected-outcome");
                  if (element) {
                    const yOffset = -180;
                    const y =
                      element.getBoundingClientRect().top +
                      window.pageYOffset +
                      yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
                className={cn(
                  "group flex items-start gap-4 py-2 border-l-2 transition-all pl-4",
                  activeSectionId === "expected-outcome"
                    ? "border-black dark:border-white text-black dark:text-black bg-black/10 dark:bg-white backdrop-blur-sm shadow-sm"
                    : "border-transparent dark:text-white/50 text-black/60 hover:text-black dark:hover:text-white dark:hover:bg-white/5 hover:bg-white/40 hover:backdrop-blur-sm",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] mt-0.5",
                    activeSectionId === "expected-outcome"
                      ? "text-black"
                      : "text-black dark:text-white",
                  )}
                >
                  ★
                </span>
                <span className="text-xs font-medium leading-tight">
                  Expected Outcome
                </span>
              </a>
            )}
          </nav>

          <div className="mt-12 pt-8 border-t border-purple-100 dark:border-purple-500/20">
            <div className="p-4 rounded-lg dark:bg-purple-900/20 bg-white/60 border border-purple-100 dark:border-purple-500/20 backdrop-blur-sm">
              <p className="text-[10px] dark:text-purple-300 text-purple-900/60 font-mono mb-2 uppercase tracking-widest">
                Difficulty
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i < activeProject.difficultyLevel ? "bg-purple-600 dark:bg-purple-400" : "dark:bg-purple-900 bg-purple-100"}`}
                    ></div>
                  ))}
                </div>
                <span className="text-xs dark:text-purple-300 text-purple-900/60">
                  {activeProject.difficultyLabel}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 py-12 px-6 lg:px-20 max-w-5xl prose prose-invert prose-zinc max-w-none print:w-full print:max-w-full print:px-0 print:py-0">
          <div className="mb-12">
            <span className="text-purple-900 dark:text-purple-300 font-mono text-sm tracking-widest uppercase mb-4 block">
              Blueprint / Implementation
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-purple-50 text-slate-900">
              {activeProject.title}
            </h1>

            {!hasBlueprint ? (
              <div className="mt-12 p-8 rounded-3xl border border-dashed border-purple-200 dark:border-purple-500/30 dark:bg-purple-900/10 bg-purple-50/50 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-2xl dark:bg-purple-500/20 bg-purple-100 flex items-center justify-center">
                  <Layers className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-purple-50 text-slate-900 mb-2">
                    {isGenerating ? "Generating Detailed Blueprint..." : "Blueprint Not Generated Yet"}
                  </h3>
                  <p className="dark:text-purple-300/70 text-slate-600 max-w-md mx-auto leading-relaxed">
                    {isGenerating 
                      ? "Our AI is crafting a custom project plan designed specifically to bridge your identified skill gaps. This usually takes 15-30 seconds."
                      : "You've identified this project as a match. Now, generate a step-by-step technical blueprint to start building your evidence."}
                  </p>
                </div>
                {!isGenerating && (
                  <button
                    onClick={() => onGenerate?.(activeProjectIdx)}
                    className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95"
                  >
                    <Layers size={20} />
                    GENERATE BLUEPRINT
                  </button>
                )}
                {isGenerating && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-1.5 item-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono dark:text-purple-400 text-purple-600 uppercase tracking-widest animate-pulse">Processing Evidence...</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-3 mb-8">
                  {activeProject.techStack?.map((tech: string, i: number) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 dark:bg-purple-50 bg-purple-900 text-white dark:text-purple-900 border border-purple-200 dark:border-purple-400/30 rounded-full text-xs font-medium tracking-wide shadow-sm"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>

                <div className="text-xl dark:text-purple-50 text-slate-800 leading-relaxed mb-4 markdown-body">
                  <ReactMarkdown>{activeProject.description}</ReactMarkdown>
                </div>
              </>
            )}
          </div>

          <div className="space-y-24 pb-[70vh]">
            {hasBlueprint && activeProject.blueprint.map((step: any, idx: number) => (
              <section
                key={step.id}
                id={`step-${step.id}`}
                className="scroll-mt-[180px]"
              >
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-500/20 pb-4 mb-8">
                  <div className="flex items-baseline gap-4">
                    <span className="text-purple-600 dark:text-purple-400 font-mono text-xl font-bold">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-2xl font-bold dark:text-white text-slate-800 m-0">
                      {step.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedResourcesStep(step)}
                    className="flex items-center gap-2 px-4 py-1.5 dark:bg-purple-900/30 bg-white/60 backdrop-blur-sm hover:bg-white dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-500/20 rounded-lg text-sm dark:text-purple-300 text-purple-900 transition-all font-medium print:hidden shadow-sm"
                  >
                    <BookOpen
                      size={16}
                      className="text-purple-600 dark:text-purple-400"
                    />
                    Resources
                  </button>
                </div>

                <div className="dark:text-purple-50 text-slate-800 leading-relaxed text-lg mb-8 markdown-body">
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const { children, className, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        // If it's a code block (has language- class), don't render it
                        // Inline code usually doesn't have a language class
                        return !match ? (
                          <code
                            {...rest}
                            className={cn(
                              "bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded text-sm font-mono text-purple-900 dark:text-purple-200",
                              className,
                            )}
                          >
                            {children}
                          </code>
                        ) : null;
                      },
                      pre() {
                        // Completely hide pre elements which contain code blocks
                        return null;
                      },
                    }}
                  >
                    {step.content}
                  </ReactMarkdown>
                </div>
              </section>
            ))}

            {activeProject.expectedOutcome && (
              <section id="expected-outcome" className="scroll-mt-[180px]">
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-500/20 pb-4 mb-8">
                  <div className="flex items-baseline gap-4">
                    <span className="text-purple-600 dark:text-purple-400 font-mono text-xl font-bold">
                      ★
                    </span>
                    <h2 className="text-2xl font-bold dark:text-white text-slate-800 m-0">
                      Expected Outcome
                    </h2>
                  </div>
                </div>

                <div className="dark:text-purple-50 text-slate-800 leading-relaxed text-lg mb-8 markdown-body">
                  <ReactMarkdown>{activeProject.expectedOutcome}</ReactMarkdown>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Resource Drawer */}
      <AnimatePresence>
        {selectedResourcesStep && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResourcesStep(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md dark:bg-[#0c0119]/90 bg-purple-50/95 backdrop-blur-2xl border-l border-purple-200 dark:border-white/10 z-[60] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-purple-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <BookOpen
                      size={20}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold dark:text-white text-slate-900">
                      Step Resources
                    </h3>
                    <p className="text-[10px] dark:text-purple-300/50 text-purple-900/60 font-mono uppercase tracking-[0.2em]">
                      {selectedResourcesStep.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResourcesStep(null)}
                  className="p-2 hover:bg-purple-100 dark:hover:bg-white/10 rounded-xl dark:text-white/70 text-purple-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Free Resources Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="bg-purple-600 dark:bg-purple-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md shadow-sm">
                      Free Resources
                    </span>
                    <div className="flex-1 h-px bg-purple-200 dark:bg-white/10 opacity-50"></div>
                  </div>
                  <div className="space-y-6">
                    {selectedResourcesStep.resources?.free?.map(
                      (res: any, idx: number) => (
                        <div
                          key={idx}
                          className="group p-5 rounded-2xl dark:bg-white/5 bg-white border border-purple-100 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-[10px] dark:text-purple-400 text-purple-900/50 font-mono uppercase tracking-[0.2em] font-bold">
                              {res.type}
                            </span>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="dark:text-white/30 text-purple-900/50 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                          <h4 className="dark:text-white text-slate-900 font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm tracking-tight leading-snug">
                            {res.name}
                          </h4>
                          <p className="dark:text-white/60 text-slate-600 text-xs mb-4 leading-relaxed line-clamp-3">
                            {res.whyItHelps}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] dark:text-purple-300/70 text-purple-900/60 font-mono font-medium">
                            <Clock size={12} className="text-purple-500" />
                            {res.estimatedTime}
                          </div>
                        </div>
                      ),
                    )}
                    {(!selectedResourcesStep.resources?.free ||
                      selectedResourcesStep.resources.free.length === 0) && (
                      <p className="dark:text-purple-300/50 text-purple-900/50 text-sm italic">
                        No free resources found for this step.
                      </p>
                    )}
                  </div>
                </div>

                {/* Premium Resources Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="bg-pink-600 dark:bg-pink-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md shadow-sm">
                      Premium Resources
                    </span>
                    <div className="flex-1 h-px bg-purple-200 dark:bg-white/10 opacity-50"></div>
                  </div>
                  <div className="space-y-6">
                    {selectedResourcesStep.resources?.premium?.map(
                      (res: any, idx: number) => (
                        <div
                          key={idx}
                          className="group p-5 rounded-2xl dark:bg-white/5 bg-white border border-purple-100 dark:border-white/10 hover:border-purple-300 dark:hover:border-pink-500/40 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-[10px] dark:text-pink-400 text-purple-900/50 font-mono uppercase tracking-[0.2em] font-bold">
                              {res.type}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold uppercase tracking-tight">
                                {res.cost}
                              </span>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dark:text-white/30 text-purple-900/50 hover:text-purple-600 dark:hover:text-pink-400 transition-colors"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                          <h4 className="dark:text-white text-slate-900 font-bold mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors text-sm tracking-tight leading-snug">
                            {res.name}
                          </h4>
                          <p className="dark:text-white/60 text-slate-600 text-xs mb-4 leading-relaxed line-clamp-3">
                            {res.whyItHelps}
                          </p>
                          <div className="bg-purple-100/50 dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-purple-900 dark:text-pink-400 mb-1.5">
                              <ShieldCheck size={14} />
                              <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                                Strategic Value
                              </span>
                            </div>
                            <p className="text-[11px] dark:text-white/60 text-purple-900/80 italic leading-normal">
                              {res.worthItIf}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                    {(!selectedResourcesStep.resources?.premium ||
                      selectedResourcesStep.resources.premium.length === 0) && (
                      <p className="dark:text-purple-300/50 text-purple-900/50 text-sm italic">
                        No premium resources found for this step.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 dark:bg-black/50 bg-white/80 backdrop-blur-md">
                <button
                  onClick={() => setSelectedResourcesStep(null)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]"
                >
                  Back to Blueprint
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
