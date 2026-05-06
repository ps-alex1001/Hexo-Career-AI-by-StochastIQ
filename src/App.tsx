/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Bell,
  Settings,
  Sun,
  Moon,
  ArrowLeft,
  Printer,
  Download,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { LandingScreen } from "./components/LandingScreen";
import { WorkspaceScreen } from "./components/WorkspaceScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { BlueprintScreen } from "./components/BlueprintScreen";
import { HowItWorksScreen } from "./components/HowItWorksScreen";
import { HexoLogo } from "./components/HexoLogo";
import {
  analyzeResumeAndJob,
  AnalysisResponse,
} from "./services/geminiService";
import { cn } from "./lib/utils";
import { motion } from "motion/react";

type AppState =
  | "landing"
  | "workspace"
  | "dashboard"
  | "blueprint"
  | "how-it-works";

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<AppState>("landing");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(
    null,
  );
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFooterModal, setActiveFooterModal] = useState<
    "privacy" | "terms" | "changelog" | "status" | null
  >(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const resetAnalysis = () => {
    setAnalysisData(null);
    setCurrentScreen("workspace");
    setError(null);
  };

  const startAnalysis = async (
    resume: string,
    targetType: string,
    targetContent: string,
    githubData?: string,
  ) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setStatusText("Analyzing skills and experience...");

    try {
      const data = await analyzeResumeAndJob(
        resume,
        targetType,
        targetContent,
        githubData,
      );

      setProgress(100);
      setStatusText("Done!");
      // Let the user see it briefly hit 100%
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisData(data);
      setCurrentScreen("dashboard");
    } catch (err) {
      console.error("Error analyzing:", err);
      setError(
        "Analysis failed. Please ensure your inputs are descriptive and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  const handleGenerateBlueprint = async () => {
    if (!analysisData) return;
    setIsGeneratingBlueprint(true);
    try {
      const { generateBlueprintData } =
        await import("./services/geminiService");
      const newProjects = await generateBlueprintData(
        analysisData.targetRole,
        analysisData.skills.gaps,
      );
      setAnalysisData((prev) =>
        prev ? { ...prev, projects: newProjects } : prev,
      );
      setCurrentScreen("blueprint");
      setSelectedProjectIndex(0);
      setScrollProgress(0);
    } catch (err: any) {
      console.error("Error generating blueprint:", err);
      // Optional: show a toast or error
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleViewBlueprint = (index: number) => {
    setSelectedProjectIndex(index);
    setCurrentScreen("blueprint");
    setScrollProgress(0);
  };

  useEffect(() => {
    if (currentScreen !== "blueprint") {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      const scrollTotal =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (scrollTotal > 0) {
        setScrollProgress((window.scrollY / scrollTotal) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentScreen]);

  return (
    <div
      className={`font-sans text-base antialiased min-h-screen flex flex-col relative transition-colors duration-300 ${isDark ? "dark app-background text-white" : "app-background text-slate-800"}`}
    >
      {/* TopNavBar */}
      <nav
        className={cn(
          "fixed top-3 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl border dark:border-purple-500/20 border-black/10 dark:bg-[#090a0f]/80 bg-white/70 backdrop-blur-md z-50 transition-all duration-300 shadow-lg dark:shadow-[0_4px_30px_rgba(140,60,255,0.1)] overflow-hidden print:hidden",
          currentScreen === "blueprint"
            ? "h-28 rounded-2xl"
            : "h-14 rounded-full",
        )}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-8 h-14 w-full z-10 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentScreen("landing")}
              className="flex items-center outline-none"
            >
              <HexoLogo isDark={isDark} className="scale-75 -ml-4 mr-4" />
            </button>
          </div>

          <div className="hidden md:flex gap-6 h-full items-center justify-center">
            <button
              onClick={() => setCurrentScreen("workspace")}
              className={`font-sans text-sm font-medium tracking-tight transition-all duration-200 ${currentScreen === "workspace" ? "dark:text-purple-100 text-purple-900 underline underline-offset-8 decoration-2 decoration-purple-600" : "dark:text-purple-300/50 text-slate-600 hover:text-purple-900 dark:hover:text-purple-100"}`}
            >
              Analyze
            </button>
            <button
              onClick={() => setCurrentScreen("dashboard")}
              disabled={!analysisData}
              className={`font-sans text-sm font-medium tracking-tight transition-all duration-200 ${currentScreen === "dashboard" ? "dark:text-purple-100 text-purple-900 underline underline-offset-8 decoration-2 decoration-purple-600" : "dark:text-purple-300/50 text-slate-600 hover:text-purple-900 dark:hover:text-purple-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              My Results
            </button>
            <button
              onClick={() => setCurrentScreen("blueprint")}
              disabled={!analysisData?.projects?.length}
              className={`font-sans text-sm font-medium tracking-tight transition-all duration-200 ${currentScreen === "blueprint" ? "dark:text-purple-100 text-purple-900 underline underline-offset-8 decoration-2 decoration-purple-600" : "dark:text-purple-300/50 text-slate-600 hover:text-purple-900 dark:hover:text-purple-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Blueprint
            </button>
            <button
              onClick={() => setCurrentScreen("how-it-works")}
              className={`font-sans text-sm font-medium tracking-tight transition-all duration-200 ${currentScreen === "how-it-works" ? "dark:text-purple-100 text-purple-900 underline underline-offset-8 decoration-2 decoration-purple-600" : "dark:text-purple-300/50 text-slate-600 hover:text-purple-900 dark:hover:text-purple-100"}`}
            >
              How It Works
            </button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="hidden md:flex dark:text-purple-300/50 text-purple-900/60 hover:text-purple-900 dark:hover:text-purple-300 transition-colors duration-200 scale-95 active:scale-90 items-center justify-center"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setCurrentScreen("workspace")}
              className="hidden md:block bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full font-sans text-xs font-bold tracking-tight hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all shadow-sm border border-purple-400/20"
            >
              GET STARTED
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center dark:text-white/80 text-black/80 hover:text-black dark:hover:text-white transition-colors justify-self-end"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Blueprint Sub-Nav (Combined) */}
        {currentScreen === "blueprint" && analysisData && (
          <div className="h-14 flex items-center justify-between w-full px-4 md:px-8 dark:bg-purple-900/20 bg-purple-50 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 relative overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-3 md:gap-6 shrink-0">
              <button
                onClick={() => setCurrentScreen("dashboard")}
                className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold uppercase tracking-tight dark:text-purple-300/50 text-purple-900/60 hover:text-purple-600 dark:hover:text-purple-300 transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back</span>
              </button>

              <div className="h-6 w-px dark:bg-purple-500/10 bg-purple-200/50 hidden sm:block shrink-0"></div>

              {/* Project Selection Tabs */}
              <div className="flex items-center gap-1.5 md:gap-2">
                {analysisData.projects?.map((project: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedProjectIndex(idx);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={cn(
                      "px-2 md:px-3 py-1 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-tight transition-all shrink-0 whitespace-nowrap",
                      selectedProjectIndex === idx
                        ? "bg-purple-600 dark:bg-purple-500 text-white border border-purple-400 dark:border-purple-300 shadow-sm"
                        : "dark:text-purple-400/50 text-purple-900/40 border border-transparent dark:hover:text-purple-100 hover:text-purple-900 hover:bg-purple-100/50",
                    )}
                  >
                    {project.title.length > 15
                      ? `${project.title.substring(0, 15)}...`
                      : project.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0 pl-4">
              <button
                onClick={() => window.print()}
                className="p-1.5 md:p-2 dark:text-purple-300/50 text-purple-900/60 hover:text-purple-600 dark:hover:text-purple-300 transition-colors rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40"
                title="Print format"
              >
                <Printer size={16} />
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-purple-600 dark:bg-purple-600 text-white font-bold text-[9px] md:text-[10px] uppercase tracking-tight rounded-lg hover:bg-purple-700 dark:hover:bg-purple-500 transition-colors shadow-sm whitespace-nowrap"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>

            {/* Horizontal Progress Bar - NOW INSIDE OVERFLOW-HIDDEN HEADER */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-100 dark:bg-purple-900/20">
              <motion.div
                className="h-full bg-purple-600 dark:bg-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${scrollProgress}%` }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
              />
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-sm rounded-2xl dark:bg-[#151515]/95 bg-[#fafafa]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 flex flex-col gap-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              setCurrentScreen("workspace");
              setIsMobileMenuOpen(false);
            }}
            className={`font-sans text-left text-base font-medium tracking-tight transition-all duration-200 px-4 py-3 rounded-lg ${currentScreen === "workspace" ? "dark:bg-white/10 bg-black/5 dark:text-white text-black" : "dark:text-white/60 text-black/60 hover:dark:text-white hover:text-black dark:hover:bg-white/5 hover:bg-black/5"}`}
          >
            Analyze
          </button>
          <button
            onClick={() => {
              setCurrentScreen("dashboard");
              setIsMobileMenuOpen(false);
            }}
            disabled={!analysisData}
            className={`font-sans text-left text-base font-medium tracking-tight transition-all duration-200 px-4 py-3 rounded-lg ${currentScreen === "dashboard" ? "dark:bg-white/10 bg-black/5 dark:text-white text-black" : "dark:text-white/60 text-black/60 hover:dark:text-white hover:text-black dark:hover:bg-white/5 hover:bg-black/5"} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            My Results
          </button>
          <button
            onClick={() => {
              setCurrentScreen("blueprint");
              setIsMobileMenuOpen(false);
            }}
            disabled={!analysisData?.projects?.length}
            className={`font-sans text-left text-base font-medium tracking-tight transition-all duration-200 px-4 py-3 rounded-lg ${currentScreen === "blueprint" ? "dark:bg-white/10 bg-black/5 dark:text-white text-black" : "dark:text-white/60 text-black/60 hover:dark:text-white hover:text-black dark:hover:bg-white/5 hover:bg-black/5"} disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Blueprint
          </button>
          <button
            onClick={() => {
              setCurrentScreen("how-it-works");
              setIsMobileMenuOpen(false);
            }}
            className={`font-sans text-left text-base font-medium tracking-tight transition-all duration-200 px-4 py-3 rounded-lg ${currentScreen === "how-it-works" ? "dark:bg-white/10 bg-black/5 dark:text-white text-black" : "dark:text-white/60 text-black/60 hover:dark:text-white hover:text-black dark:hover:bg-white/5 hover:bg-black/5"}`}
          >
            How It Works
          </button>
          <div className="border-t border-black/10 dark:border-white/10 mt-2 pt-4 px-2 flex items-center justify-between">
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-2 dark:text-white/80 text-black/80 font-medium text-sm hover:dark:text-white hover:text-black transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={() => {
                setCurrentScreen("workspace");
                setIsMobileMenuOpen(false);
              }}
              className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-sans text-xs font-bold tracking-tight shadow-sm hover:opacity-90 transition-opacity"
            >
              START
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow relative flex flex-col items-center w-full pt-16">
        {currentScreen === "landing" && (
          <LandingScreen
            onStartMapping={() => setCurrentScreen("workspace")}
            isDark={isDark}
          />
        )}
        {currentScreen === "workspace" && (
          <div className="w-full flex flex-col items-center">
            {error && (
              <div className="w-full max-w-[900px] mt-24 mb-[-80px] z-20 px-6">
                <div className="bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20 px-4 py-3 rounded-lg text-sm flex items-center gap-3 shadow-lg">
                  <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-pulse"></div>
                  {error}
                </div>
              </div>
            )}
            <WorkspaceScreen
              onAnalyze={startAnalysis}
              isLoading={isLoading}
              progress={progress}
              statusText={statusText}
            />
          </div>
        )}
        {currentScreen === "dashboard" && analysisData && (
          <DashboardScreen
            data={analysisData}
            onViewBlueprint={handleViewBlueprint}
            onNewAnalysis={resetAnalysis}
            onGenerateBlueprint={handleGenerateBlueprint}
            isGeneratingBlueprint={isGeneratingBlueprint}
          />
        )}
        {currentScreen === "blueprint" && analysisData && (
          <BlueprintScreen
            data={analysisData}
            initialProjectIndex={selectedProjectIndex}
            onBack={() => setCurrentScreen("dashboard")}
            scrollProgress={scrollProgress}
            onProjectChange={setSelectedProjectIndex}
          />
        )}
        {currentScreen === "how-it-works" && (
          <HowItWorksScreen
            onStartMapping={() => setCurrentScreen("workspace")}
          />
        )}
      </main>

      {/* Footer */}
      {(currentScreen === "landing" ||
        currentScreen === "workspace" ||
        currentScreen === "how-it-works") && (
        <footer className="w-full border-t border-black/10 dark:border-white/10 py-6 md:py-8 dark:bg-black/40 bg-white/40 backdrop-blur-md mt-auto z-10 relative flex-shrink-0 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-4 md:gap-0">
            <div className="flex items-center">
              <HexoLogo isDark={isDark} className="scale-75 -ml-8" />
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => setActiveFooterModal("privacy")}
                className="dark:text-white/50 text-black/50 hover:text-black dark:text-white dark:hover:text-white text-xs transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveFooterModal("terms")}
                className="dark:text-white/50 text-black/50 hover:text-black dark:text-white dark:hover:text-white text-xs transition-colors"
              >
                Terms
              </button>
              <button
                onClick={() => setActiveFooterModal("changelog")}
                className="dark:text-white/50 text-black/50 hover:text-black dark:text-white dark:hover:text-white text-xs transition-colors"
              >
                Changelog
              </button>
              <button
                onClick={() => setActiveFooterModal("status")}
                className="dark:text-white/50 text-black/50 hover:text-black dark:text-white dark:hover:text-white text-xs transition-colors"
              >
                Status
              </button>
            </div>
            <div className="text-xs dark:text-white/50 text-black/50">
              © 2026 Hexo. Skill-to-role mapping system.
            </div>
          </div>
        </footer>
      )}

      {/* Footer Modals */}
      {activeFooterModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveFooterModal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl dark:bg-[#151515]/90 bg-white/90 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveFooterModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full dark:text-white/50 text-black/50 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {activeFooterModal === "privacy" && (
              <div className="prose prose-sm dark:prose-invert">
                <h2 className="text-2xl font-bold mb-6 dark:text-white text-black">
                  Privacy Policy
                </h2>
                <p className="dark:text-white/70 text-black/70 mb-4 font-medium">
                  Effective Date: May 2026
                </p>
                <h3 className="text-lg font-bold mt-6 mb-2 dark:text-white text-black">
                  1. Data Collection
                </h3>
                <p className="dark:text-white/70 text-black/70 mb-4">
                  We collect your resume and target job descriptions purely to
                  perform the requested analysis. No data is stored long-term
                  without explicit consent.
                </p>
                <h3 className="text-lg font-bold mt-6 mb-2 dark:text-white text-black">
                  2. AI Processing
                </h3>
                <p className="dark:text-white/70 text-black/70 mb-4">
                  Your information is securely processed using advanced AI
                  models. We do not use your inputs to train public models.
                </p>
                <h3 className="text-lg font-bold mt-6 mb-2 dark:text-white text-black">
                  3. Third-party Logging
                </h3>
                <p className="dark:text-white/70 text-black/70 mb-4">
                  We use anonymous telemetry and error logging to ensure the
                  quality of our service. Personal Identifiable Information
                  (PII) is obfuscated before transit.
                </p>
              </div>
            )}

            {activeFooterModal === "terms" && (
              <div className="prose prose-sm dark:prose-invert">
                <h2 className="text-2xl font-bold mb-6 dark:text-white text-black">
                  Terms of Service
                </h2>
                <p className="dark:text-white/70 text-black/70 mb-4 font-medium">
                  Effective Date: May 2026
                </p>
                <h3 className="text-lg font-bold mt-6 mb-2 dark:text-white text-black">
                  1. Acceptance
                </h3>
                <p className="dark:text-white/70 text-black/70 mb-4">
                  By using StochastIQ or Hexo, you agree to these minimum viable
                  terms. Do not use the service for illegal or malicious
                  purposes.
                </p>
                <h3 className="text-lg font-bold mt-6 mb-2 dark:text-white text-black">
                  2. Service Limitations
                </h3>
                <p className="dark:text-white/70 text-black/70 mb-4">
                  The career blueprints generated are suggestions based on AI
                  inferences, not guaranteed career advice. Use them as
                  educational frameworks.
                </p>
                <h3 className="text-lg font-bold mt-6 mb-2 dark:text-white text-black">
                  3. Warranty
                </h3>
                <p className="dark:text-white/70 text-black/70 mb-4">
                  This tool is provided "as is" without warranty of any kind. We
                  are not liable for employment outcomes influenced by this
                  tool.
                </p>
              </div>
            )}

            {activeFooterModal === "changelog" && (
              <div className="prose prose-sm dark:prose-invert">
                <h2 className="text-2xl font-bold mb-6 dark:text-white text-black">
                  Changelog
                </h2>
                <div className="mb-6 pb-6 border-b dark:border-white/10 border-black/10">
                  <span className="inline-block px-2 py-1 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded mb-2">
                    v.2.1.0
                  </span>
                  <h3 className="text-lg font-bold mt-1 mb-2 dark:text-white text-black">
                    PDF Export & Layout Refinements
                  </h3>
                  <p className="dark:text-white/70 text-black/70 mb-2 mt-2">
                    Added clean "Export PDF" function to blueprints, stripped
                    out UI elements from print formats, and introduced a
                    responsive mobile menu structure.
                  </p>
                </div>
                <div className="mb-6 pb-6 border-b dark:border-white/10 border-black/10">
                  <span className="inline-block px-2 py-1 text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded mb-2">
                    v.2.0.0
                  </span>
                  <h3 className="text-lg font-bold mt-1 mb-2 dark:text-white text-black">
                    The "Blueprint" Update
                  </h3>
                  <p className="dark:text-white/70 text-black/70 mb-2 mt-2">
                    Introduced full structured learning blueprints parsing from
                    Gemini models. Multi-project switching mechanism added for
                    multiple gap assessments.
                  </p>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded mb-2">
                    v.1.0.0
                  </span>
                  <h3 className="text-lg font-bold mt-1 mb-2 dark:text-white text-black">
                    Initial Launch
                  </h3>
                  <p className="dark:text-white/70 text-black/70 mb-2 mt-2">
                    Core analyzer mapping experience created with dark/light
                    mode integration.
                  </p>
                </div>
              </div>
            )}

            {activeFooterModal === "status" && (
              <div className="prose prose-sm dark:prose-invert">
                <h2 className="text-2xl font-bold mb-6 dark:text-white text-black">
                  System Status
                </h2>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-green-500/30 bg-green-500/10 mb-6">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                  <div className="flex-col">
                    <span className="font-bold text-green-700 dark:text-green-400 block">
                      All Systems Operational
                    </span>
                    <span className="text-xs text-green-600/80 dark:text-green-400/80">
                      Updated just now
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span className="font-medium dark:text-white text-black">
                      Analysis Engine (Gemini)
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span className="font-medium dark:text-white text-black">
                      Web Interface
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span className="font-medium dark:text-white text-black">
                      PDF Export Service
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
