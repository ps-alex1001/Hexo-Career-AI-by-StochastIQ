import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ArrowRight,
  Award,
  Target,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface DashboardScreenProps {
  data: any;
  onViewBlueprint: (projectIndex: number) => void;
  onNewAnalysis: () => void;
  onGenerateBlueprint?: () => void;
  isGeneratingBlueprint?: boolean;
}

export function DashboardScreen({
  data,
  onViewBlueprint,
  onNewAnalysis,
  onGenerateBlueprint,
  isGeneratingBlueprint,
}: DashboardScreenProps) {
  if (!data) return null;

  // Calculate match percentage and find max gap for node focus
  const totalActual = data.skills.radarData.reduce(
    (acc: number, d: any) => acc + (d.actual || d.user || 0),
    0,
  );
  const totalTarget = data.skills.radarData.reduce(
    (acc: number, d: any) => acc + (d.target || 100),
    0,
  );
  const matchPercentage =
    data.matchPercentage !== undefined
      ? data.matchPercentage
      : Math.round((totalActual / totalTarget) * 100);

  // Find the axis with the largest gap for the glowing focal point
  const radarData = data.skills.radarData
    .map((d: any) => ({
      ...d,
      attribute: d.attribute || d.axis,
      actual: d.actual || d.user,
      target: d.target,
    }))
    .sort((a: any, b: any) => b.actual - a.actual);

  const maxGapNode = [...radarData].sort(
    (a: any, b: any) => b.target - b.actual - (a.target - a.actual),
  )[0];

  const getClassification = (score: number) => {
    if (score >= 80)
      return {
        label: "STRONG MATCH",
        color:
          "bg-purple-900 dark:bg-purple-50 text-white dark:text-purple-900 border-purple-200 dark:border-purple-400/30",
        hover: "Highly qualified with excellent core competency match.",
      };
    if (score >= 63)
      return {
        label: "COMPETITIVE",
        color:
          "bg-purple-900 dark:bg-purple-50 text-white dark:text-purple-900 border-purple-200 dark:border-purple-400/30",
        hover: "Solid candidate with minimal gaps to bridge.",
      };
    if (score >= 45)
      return {
        label: "DEVELOPING",
        color:
          "bg-purple-100/50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-500/20",
        hover: "Has foundational skills but needs specific upskilling.",
      };
    if (score >= 25)
      return {
        label: "EMERGING",
        color:
          "bg-purple-100/50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-500/20",
        hover: "Initial signs of potential, but requires significant training.",
      };
    return {
      label: "MISALIGNED",
      color:
        "bg-purple-900 dark:bg-purple-50 text-white dark:text-purple-900 border-purple-200 dark:border-purple-400/30",
      hover: "Significant skill gaps exist for this role.",
    };
  };

  const matchClassification = getClassification(matchPercentage);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = radarData.find(
        (d: any) => d.attribute === label || d.axis === label,
      );
      const reasoning = dataPoint?.reasoning;

      const tier = dataPoint?.tier || "supporting";
      const userScore = dataPoint?.actual || 0;

      // Tier-specific benchmark ranges
      const getRanges = (tierType: string) => {
        if (tierType === "core") {
          return [
            {
              label: "Entry",
              min: 0,
              max: 45,
              color: "bg-purple-200 dark:bg-purple-900/40",
            },
            {
              label: "Jr",
              min: 45,
              max: 65,
              color: "bg-purple-300 dark:bg-purple-800/50",
            },
            {
              label: "Mid",
              min: 65,
              max: 80,
              color: "bg-purple-500 dark:bg-purple-600/70",
            },
            {
              label: "Sr",
              min: 80,
              max: 92,
              color: "bg-purple-700 dark:bg-purple-400/80",
            },
            {
              label: "Staff+",
              min: 92,
              max: 100,
              color: "bg-purple-900 dark:bg-purple-100",
            },
          ];
        }
        if (tierType === "supporting") {
          return [
            {
              label: "Entry",
              min: 0,
              max: 35,
              color: "bg-purple-200 dark:bg-purple-900/40",
            },
            {
              label: "Jr",
              min: 35,
              max: 55,
              color: "bg-purple-300 dark:bg-purple-800/50",
            },
            {
              label: "Mid",
              min: 55,
              max: 70,
              color: "bg-purple-500 dark:bg-purple-600/70",
            },
            {
              label: "Sr",
              min: 70,
              max: 85,
              color: "bg-purple-700 dark:bg-purple-400/80",
            },
            {
              label: "Staff+",
              min: 85,
              max: 100,
              color: "bg-purple-900 dark:bg-purple-100",
            },
          ];
        }
        // Contextual
        return [
          {
            label: "Entry",
            min: 0,
            max: 30,
            color: "bg-purple-200/50 dark:bg-purple-900/40",
          },
          {
            label: "Jr",
            min: 30,
            max: 45,
            color: "bg-purple-300/60 dark:bg-purple-800/50",
          },
          {
            label: "Mid",
            min: 45,
            max: 60,
            color: "bg-purple-400/70 dark:bg-purple-700/60",
          },
          {
            label: "Sr",
            min: 60,
            max: 75,
            color: "bg-purple-600/80 dark:bg-purple-500/80",
          },
          {
            label: "Staff+",
            min: 75,
            max: 100,
            color: "bg-purple-800 dark:bg-purple-300",
          },
        ];
      };

      const ranges = getRanges(tier);
      const currentLevel =
        ranges.find((r) => userScore >= r.min && userScore <= r.max) ||
        ranges[0];

      return (
        <div className="dark:bg-black/70 bg-white/70 backdrop-blur-md border dark:border-white/10 border-black/20 p-4 rounded-xl shadow-xl z-50 max-w-[300px]">
          <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b dark:border-white/10 border-black/20">
            <p className="dark:text-white text-black font-bold uppercase tracking-wider text-[11px] font-mono">
              {label}
            </p>
            <span
              className={cn(
                "text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold",
                tier === "core"
                  ? "bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20"
                  : tier === "supporting"
                    ? "bg-black dark:bg-white text-white dark:text-black border border-black/20 dark:border-white/20"
                    : "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 border border-black/20 dark:border-white/20",
              )}
            >
              {tier}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-6 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="dark:text-white text-black font-semibold">
                    {entry.name}
                  </span>
                </div>
                <span className="font-mono dark:text-white text-black font-bold">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t dark:border-white/10 border-black/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-mono font-bold text-black/60 dark:text-white/60">
                Benchmark: {currentLevel.label} level
              </span>
            </div>

            <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-black/5 dark:bg-black/90 mb-2 relative">
              {ranges.map((r, i) => (
                <div
                  key={i}
                  className={cn("h-full transition-all duration-500", r.color)}
                  style={{ width: `${r.max - r.min}%` }}
                />
              ))}

              {/* User score indicator */}
              <div
                className="absolute top-0 bottom-0 w-[4px] bg-white dark:bg-black/10 rounded-full shadow-sm border border-black/40 -translate-x-1/2 z-10"
                style={{ left: `${Math.min(100, Math.max(0, userScore))}%` }}
              />
            </div>

            <div className="relative w-full h-4">
              {ranges.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute text-[8px] font-mono -translate-x-1/2 whitespace-nowrap transition-colors",
                    userScore >= r.min && userScore <= r.max
                      ? "text-black dark:text-white font-bold underline"
                      : "text-black/40 dark:text-white/40 font-medium",
                  )}
                  style={{ left: `${(r.min + r.max) / 2}%` }}
                >
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          {reasoning && (
            <div className="pt-4 border-t dark:border-white/10 border-black/20 mt-2">
              <p className="text-xs dark:text-white/50 text-black/60 leading-relaxed italic">
                {reasoning}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-grow flex flex-col items-center p-6 bg-transparent relative z-10 w-full pt-10">
      <div className="w-full max-w-6xl flex flex-col gap-8 pb-24">
        {/* Intelligence Radar Terminal */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
            {/* Left Column: Metrics */}
            <div className="lg:col-span-4 border-r border-purple-100 dark:border-purple-500/20 p-8 flex flex-col gap-8 dark:bg-purple-900/10 bg-white/60 backdrop-blur-md">
              {/* Target Role Card */}
              <div className="relative pl-6 border-l-4 border-purple-600 dark:border-purple-400 py-2">
                <span className="text-[10px] font-mono dark:text-purple-300/50 text-purple-900/50 uppercase tracking-widest block mb-1">
                  Target Role
                </span>
                <h3 className="text-2xl font-bold dark:text-purple-50 text-slate-900 tracking-tight leading-tight">
                  {data.targetRole || "Technical Architect"}
                </h3>
              </div>

              {/* Current Match Card */}
              <div className="relative pl-6 border-l-4 border-purple-600 dark:border-purple-400 py-2">
                <span className="text-[10px] font-mono dark:text-purple-300/50 text-purple-900/50 uppercase tracking-widest block mb-1">
                  Current Match
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black dark:text-purple-50 text-slate-900 tracking-tighter">
                    {matchPercentage}%
                  </span>
                  <div className="group/tag relative cursor-help flex">
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2.5 py-1 rounded border uppercase tracking-wider",
                        matchClassification.color,
                      )}
                    >
                      {matchClassification.label}
                    </span>
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-purple-900 text-white text-xs rounded shadow-xl opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none z-50">
                      {matchClassification.hover}
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-purple-900"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Gaps List */}
              <div className="pt-6 border-t border-purple-100 dark:border-purple-500/20">
                <span className="text-[10px] font-mono dark:text-purple-300/50 text-purple-900/50 uppercase tracking-widest block mb-4">
                  Critical Gaps
                </span>
                <div className="space-y-4">
                  {radarData
                    .filter((s: any) => s.target - s.actual > 15)
                    .sort(
                      (a: any, b: any) =>
                        (b.target - b.actual) / (b.target || 100) -
                        (a.target - a.actual) / (a.target || 100),
                    )
                    .slice(0, 4)
                    .map((skill: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between group"
                      >
                        <span className="dark:text-blue-100/60 text-slate-600 text-xs font-semibold group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors uppercase tracking-wider">
                          {skill.attribute}
                        </span>
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
                          -
                          {Math.round(
                            ((skill.target - skill.actual) /
                              (skill.target || 100)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column: Visualization */}
            <div className="lg:col-span-8 p-10 flex flex-col items-center justify-center relative overflow-hidden dark:bg-purple-900/5 bg-white/40 backdrop-blur-md">
              <div className="w-full h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={radarData}
                  >
                    <PolarGrid
                      stroke="var(--ink-border)"
                      strokeOpacity={0.5}
                      gridType="polygon"
                      strokeWidth={1}
                    />
                    <PolarAngleAxis
                      dataKey="attribute"
                      tick={{
                        fill: "var(--ink-color)",
                        fontSize: 10,
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                      stroke="var(--ink-border)"
                      strokeOpacity={0.5}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "var(--ink-bg)" }}
                    />
                    {/* Shadow Layer for Requirement */}
                    <Radar
                      name="Standard"
                      dataKey="target"
                      stroke="var(--ink-color)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fill="transparent"
                    />
                    {/* Vibrant Current Profile */}
                    <Radar
                      name="Current Profile"
                      dataKey="actual"
                      stroke="var(--ink-color)"
                      strokeWidth={2}
                      fill="var(--ink-color)"
                      fillOpacity={0.15}
                      dot={(props: any) => {
                        const isMaxGap =
                          props.payload.attribute === maxGapNode.attribute;
                        return (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={isMaxGap ? 5 : 3}
                            fill="var(--ink-color)"
                            className={isMaxGap ? "animate-pulse" : ""}
                          />
                        );
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths and Gaps Secondary Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Verified Strengths Card */}
          <div className="glass-card rounded-xl overflow-hidden group border border-purple-100 dark:border-purple-500/20 transition-all hover:border-purple-300 dark:hover:border-purple-500/40 bg-white/30 dark:bg-purple-900/10">
            <div className="bg-purple-600 dark:bg-purple-500/20 border-b border-purple-400 dark:border-purple-500/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-white" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
                  Core Competences
                </h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></div>
            </div>
            <div className="p-8 space-y-5 bg-white/30 dark:bg-purple-900/10 backdrop-blur-md">
              {data.skills.strengths.map(
                (str: { name: string; matchRatio: number }, i: number) => {
                  return (
                    <div key={i} className="flex gap-4 items-start group/item">
                      <div
                        className={cn(
                          "mt-1.5 w-1.5 h-1.5 rounded-full transition-transform group-hover/item:scale-150 shadow-sm bg-purple-600 dark:bg-purple-400",
                        )}
                      ></div>
                      <div className="flex flex-col">
                        <p className="dark:text-purple-100 text-slate-700 text-sm font-medium leading-relaxed tracking-wide flex items-center gap-2">
                          {str.name}
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Critical Gaps Card */}
          <div className="glass-card rounded-xl overflow-hidden group border border-purple-100 dark:border-purple-500/20 transition-all hover:border-purple-300 dark:hover:border-purple-500/40 bg-white/30 dark:bg-purple-900/10">
            <div className="bg-purple-800 dark:bg-purple-900/40 border-b border-purple-600 dark:border-purple-500/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-white" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] font-mono">
                  Areas for Improvement
                </h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></div>
            </div>
            <div className="p-8 space-y-5 bg-white/30 dark:bg-purple-900/10 backdrop-blur-md">
              {data.skills.gaps.map((gap: string, i: number) => {
                const isCritical = gap.includes("!!CRITICAL!!");
                const cleanGap = gap.replace(" !!CRITICAL!!", "");
                return (
                  <div key={i} className="flex gap-4 items-start group/item">
                    <div
                      className={cn(
                        "mt-1.5 w-1.5 h-1.5 rounded-full group-hover/item:scale-150 transition-transform shadow-sm",
                        "bg-purple-600 dark:bg-purple-400",
                        isCritical && "animate-pulse",
                      )}
                    ></div>
                    <div className="flex flex-col">
                      <p className="dark:text-purple-100 text-slate-700 text-sm font-medium leading-relaxed tracking-wide flex items-center gap-2">
                        {cleanGap}
                        {isCritical && (
                          <span className="flex items-center gap-1 text-[10px] font-bold font-mono animate-pulse uppercase tracking-tighter bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 px-1 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
                            <AlertTriangle size={10} />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Project Section */}
        <div className="mt-8 pt-12 border-t border-purple-100 dark:border-purple-500/20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center border border-purple-500/20 shadow-lg">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold dark:text-purple-50 text-slate-900 tracking-tight">
                Personalized Projects
              </h3>
              <p className="text-xs dark:text-purple-300/50 text-purple-900/50 font-mono uppercase tracking-[0.2em] mt-1">
                Closing identified gaps through execution
              </p>
            </div>
          </div>

          {!data.projects || data.projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-purple-200 dark:border-purple-500/20 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-6">
                <Terminal
                  size={32}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h4 className="text-xl font-bold dark:text-purple-50 text-slate-900 mb-3">
                Generate Learning Blueprint
              </h4>
              <p className="text-sm dark:text-purple-300/70 text-slate-600 max-w-lg mb-8">
                Get a personalized 3-project action plan specifically designed
                to close your skill gaps for the target role.
              </p>
              <button
                onClick={onGenerateBlueprint}
                disabled={isGeneratingBlueprint}
                className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-sans text-sm font-bold tracking-tight transition-all shadow-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {isGeneratingBlueprint ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    GENERATING...
                  </>
                ) : (
                  <>
                    GENERATE ACTION PLAN
                    <Zap size={16} className="fill-current" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.projects.map((project: any, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.03,
                    y: -5,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "glass-card border border-purple-100 dark:border-purple-500/20 rounded-xl p-8 flex flex-col transition-all duration-300 group/card relative overflow-hidden",
                    "border-t-2 border-t-purple-600 dark:border-t-purple-400 dark:bg-purple-900/10 bg-white/60 dark:text-purple-50 text-slate-900 hover:shadow-xl",
                  )}
                >
                  {/* Background Accent */}
                  <div
                    className={cn(
                      "absolute -right-12 -top-12 w-32 h-32 blur-[80px] opacity-10 group-hover/card:opacity-30 transition-opacity",
                      "bg-purple-600 dark:bg-purple-400",
                    )}
                  ></div>

                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span
                      className={cn(
                        "text-[10px] font-bold font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/20 text-purple-900 dark:text-purple-100",
                      )}
                    >
                      {project.difficultyLabel}
                    </span>
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${i < project.difficultyLevel ? "bg-purple-600/50 dark:bg-purple-400/50" : "bg-purple-100 dark:bg-purple-900/80"}`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <h4 className="text-xl font-bold dark:text-purple-50 text-slate-900 mb-4 min-h-[64px] leading-tight relative z-10 transition-colors">
                    {project.title}
                  </h4>

                  <p className="dark:text-blue-100/60 text-slate-600 text-sm mb-8 flex-grow leading-relaxed line-clamp-4 relative z-10">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                    {project.techStack
                      .slice(0, 3)
                      .map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-500/20 rounded text-[10px] font-mono uppercase tracking-wider"
                        >
                          {tech}
                        </span>
                      ))}
                    {project.techStack.length > 3 && (
                      <span className="text-[10px] dark:text-purple-300 text-purple-900/50 self-center">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onViewBlueprint(index)}
                    className="w-full mt-auto py-3 rounded-lg bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-400 text-[10px] font-bold font-mono tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 group/btn relative z-10 shadow-md border border-purple-500/20"
                  >
                    EXECUTE_BLUEPRINT
                    <ArrowRight
                      size={14}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
