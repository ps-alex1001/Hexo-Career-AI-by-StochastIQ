import React from 'react';
import { ArrowRight, Brain, Search, CodeXml, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, RadarChart, Tooltip } from 'recharts';
import { SpaceBackground } from './SpaceBackground';

interface LandingScreenProps {
  onStartMapping: () => void;
  isDark: boolean;
}

const mockRadarData = [
  { attribute: 'Frontend', actual: 85, target: 90 },
  { attribute: 'Backend', actual: 60, target: 80 },
  { attribute: 'DevOps', actual: 40, target: 70 },
  { attribute: 'System Design', actual: 50, target: 75 },
  { attribute: 'Leadership', actual: 70, target: 85 },
  { attribute: 'Data Eng', actual: 30, target: 60 },
].sort((a, b) => b.actual - a.actual);

export function LandingScreen({ onStartMapping, isDark }: LandingScreenProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="dark:bg-black/70 bg-white/70 backdrop-blur-md border dark:border-white/10 border-black/20 p-3 rounded-xl shadow-xl z-50 min-w-[140px]">
          <p className="dark:text-white text-black font-bold mb-2 uppercase tracking-wider text-[10px] font-mono border-b dark:border-white/10 border-black/20 pb-1.5">{label}</p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="dark:text-white text-black font-medium">{entry.name}</span>
                </div>
                <span className="font-mono dark:text-white text-black font-bold">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Background Layer moved completely to SpaceBackground */}
      <SpaceBackground isDark={isDark} />

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-8 pb-24 relative flex-grow flex flex-col items-center text-center gap-8">
        <div className="absolute top-1/2 -left-32 md:-left-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 dark:bg-purple-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 -right-32 md:-right-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 dark:bg-blue-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="relative z-10">
          <motion.h1 
            animate={{ 
              filter: [
                "drop-shadow(0 0 0px rgba(0,0,0,0))",
                "drop-shadow(0 0 12px rgba(0,0,0,0.15))",
                "drop-shadow(0 0 0px rgba(0,0,0,0))"
              ]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 text-slate-800 dark:text-white leading-tight py-2"
          >
            Your Career, <br /> Built from Anywhere
          </motion.h1>
          <p className="dark:text-blue-100/70 text-slate-700 text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-medium tracking-tight">
            Hexo compares your skills with real job requirements and shows you what’s missing for the role you want.
            It turns your experience into a clear path forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pb-4">
            <button
              onClick={onStartMapping}
              className="relative overflow-hidden bg-gradient-to-r from-purple-100 to-fuchsia-200 dark:from-purple-600 dark:to-fuchsia-600 border border-purple-300 dark:border-fuchsia-400/30 px-10 py-4 rounded-xl text-lg font-bold inline-flex items-center gap-3 text-slate-800 dark:text-white shadow-[0_4px_20px_rgba(216,180,254,0.5)] dark:shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_8px_30px_rgba(216,180,254,0.8)] dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              Analyze Your Resume
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Value Prop Cards */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-32 z-10 relative">
        <div className="absolute top-1/2 -left-32 md:-left-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 dark:bg-blue-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 -right-32 md:-right-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 dark:bg-purple-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <div className="bg-white/60 dark:bg-[#120a1f]/60 backdrop-blur-xl border border-slate-200 dark:border-purple-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(180,0,255,0.08)] rounded-xl p-8 hover:bg-white/80 dark:hover:bg-[#1a0f2b]/80 transition-colors group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/5 dark:bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-lg bg-white/50 dark:bg-purple-900/30 backdrop-blur-xl border border-white/50 dark:border-purple-500/30 shadow-inner flex items-center justify-center mb-6 group-hover:bg-white/70 dark:group-hover:bg-purple-800/40 transition-all shrink-0">
              <Brain size={24} strokeWidth={1.5} className="dark:text-fuchsia-300 text-purple-600" />
            </div>
            <h3 className="text-xs font-mono uppercase tracking-[0.1em] dark:text-purple-100 text-slate-800 mb-4 opacity-80 group-hover:opacity-100 transition-opacity font-bold">
              Understand your skills
            </h3>
            <div className="text-sm dark:text-blue-100/70 text-slate-600 leading-relaxed font-sans space-y-2">
              <p>We break your resume into structured skills and compare them with real job requirements.</p>
              <p className="font-medium dark:text-purple-300 text-purple-700">So you know where you stand.</p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-[#0a0f1f]/60 backdrop-blur-xl border border-slate-200 dark:border-blue-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,150,255,0.08)] rounded-xl p-8 hover:bg-white/80 dark:hover:bg-[#0d142b]/80 transition-colors group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/5 dark:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-lg bg-white/50 dark:bg-blue-900/30 backdrop-blur-xl border border-white/50 dark:border-blue-500/30 shadow-inner flex items-center justify-center mb-6 group-hover:bg-white/70 dark:group-hover:bg-blue-800/40 transition-all shrink-0">
              <Search size={24} strokeWidth={1.5} className="dark:text-blue-300 text-blue-600" />
            </div>
            <h3 className="text-xs font-mono uppercase tracking-[0.1em] dark:text-blue-100 text-slate-800 mb-4 opacity-80 group-hover:opacity-100 transition-opacity font-bold">
              See what’s missing
            </h3>
            <div className="text-sm dark:text-blue-100/70 text-slate-600 leading-relaxed font-sans space-y-2">
              <p>Get a clear breakdown of the skills you need for your target role.</p>
              <p className="font-medium dark:text-blue-300 text-blue-700">So you know what to improve.</p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-[#120a1f]/60 backdrop-blur-xl border border-slate-200 dark:border-purple-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(180,0,255,0.08)] rounded-xl p-8 hover:bg-white/80 dark:hover:bg-[#1a0f2b]/80 transition-colors group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/5 dark:bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-lg bg-white/50 dark:bg-purple-900/30 backdrop-blur-xl border border-white/50 dark:border-purple-500/30 shadow-inner flex items-center justify-center mb-6 group-hover:bg-white/70 dark:group-hover:bg-purple-800/40 transition-all shrink-0">
              <CodeXml size={24} strokeWidth={1.5} className="dark:text-fuchsia-300 text-purple-600" />
            </div>
            <h3 className="text-xs font-mono uppercase tracking-[0.1em] dark:text-purple-100 text-slate-800 mb-4 opacity-80 group-hover:opacity-100 transition-opacity font-bold">
              Know what to build
            </h3>
            <div className="text-sm dark:text-blue-100/70 text-slate-600 leading-relaxed font-sans space-y-2">
              <p>We turn missing skills into practical project ideas you can actually work on.</p>
              <p className="font-medium dark:text-purple-300 text-purple-700">So you always know your next step.</p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-[#0a0f1f]/60 backdrop-blur-xl border border-slate-200 dark:border-blue-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,150,255,0.08)] rounded-xl p-8 hover:bg-white/80 dark:hover:bg-[#0d142b]/80 transition-colors group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/5 dark:bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-lg bg-white/50 dark:bg-blue-900/30 backdrop-blur-xl border border-white/50 dark:border-blue-500/30 shadow-inner flex items-center justify-center mb-6 group-hover:bg-white/70 dark:group-hover:bg-blue-800/40 transition-all shrink-0">
              <Target size={24} strokeWidth={1.5} className="dark:text-blue-300 text-blue-600" />
            </div>
            <h3 className="text-xs font-mono uppercase tracking-[0.1em] dark:text-blue-100 text-slate-800 mb-4 opacity-80 group-hover:opacity-100 transition-opacity font-bold">
              Stay aligned with the market
            </h3>
            <div className="text-sm dark:text-blue-100/70 text-slate-600 leading-relaxed font-sans space-y-2">
              <p>We use real job descriptions so your learning matches what companies are actually looking for.</p>
              <p className="font-medium dark:text-blue-300 text-blue-700">So you don’t waste time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Skill Analysis Section */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <div className="absolute top-1/2 -left-32 md:-left-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 dark:bg-purple-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 -right-32 md:-right-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 dark:bg-blue-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="flex flex-col lg:flex-row items-center gap-16 backdrop-blur-md dark:bg-blue-900/10 bg-white/10 rounded-3xl p-8 md:p-12 border dark:border-blue-500/20 border-white/40 dark:shadow-[0_0_50px_rgba(0,100,255,0.05)] shadow-2xl relative overflow-hidden">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-blue-50 text-slate-800">
              See your profile clearly
            </h2>
            <p className="text-lg dark:text-blue-100/70 text-slate-700 leading-relaxed">
              Upload your resume and a target job. Hexo turns it into a structured view of your skills. Our AI instantly maps your current capabilities against the required skills, generating an intuitive radar chart that highlights your specific strengths and critical gaps.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                "Skills you already match",
                "Skills you’re close to",
                "Skills you’re missing",
                "What matters most right now"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-slate-800 dark:bg-blue-500 text-white dark:text-black rounded-full p-1 border border-slate-800/30 dark:border-blue-300">
                    <ArrowRight size={12} className="rotate-45" />
                  </div>
                  <span className="dark:text-blue-100/80 text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 w-full max-w-md lg:max-w-none bg-white/20 dark:bg-[#0c0d15]/60 backdrop-blur-2xl border border-white/40 dark:border-blue-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,150,255,0.1)] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 left-4 flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-black/50 dark:bg-black"></div>
                 <div className="w-3 h-3 rounded-full bg-black/50 dark:bg-black"></div>
                 <div className="w-3 h-3 rounded-full bg-black/50 dark:bg-black"></div>
              </div>
              <div className="w-full h-[400px]" style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                      <PolarGrid stroke="var(--ink-border)" strokeOpacity={0.5} gridType="polygon" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="attribute" 
                        tick={{ fill: "var(--ink-color)", fontSize: 11, fontWeight: 600, fontFamily: 'monospace' }}
                        stroke="var(--ink-border)"
                        strokeOpacity={0.5}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--ink-bg)' }} />
                      <RechartsRadar
                        name="Required Skills"
                        dataKey="target"
                        stroke="var(--ink-color)"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        fill="transparent"
                      />
                      <RechartsRadar
                        name="Your Current Skills"
                        dataKey="actual"
                        stroke="var(--ink-color)"
                        strokeWidth={2}
                        fill="var(--ink-color)"
                        fillOpacity={0.15}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-32 relative z-10 text-center">
        <div className="absolute top-1/2 -left-32 md:-left-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 dark:bg-blue-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 -right-32 md:-right-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 dark:bg-purple-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <h2 className="text-4xl font-bold tracking-tight dark:text-purple-50 text-slate-800 mb-16 relative z-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {[
            { step: '01', title: 'Upload', desc: 'Add your resume and target job.' },
            { step: '02', title: 'Extract', desc: 'We break your experience into structured skills.' },
            { step: '03', title: 'Match', desc: 'We compare your profile against real job requirements.' },
            { step: '04', title: 'Find gaps', desc: 'We highlight what’s missing and what matters most.' },
            { step: '05', title: 'Build', desc: 'We generate project-based steps to close those gaps.' }
          ].map((item, i) => (
            <div key={i} className="relative group">
              <div className="text-6xl font-black text-purple-900/40 dark:text-purple-300 mb-4 transition-all group-hover:scale-105 dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                {item.step}
              </div>
              <h4 className="text-xl font-semibold dark:text-purple-100 text-slate-800 mb-2">{item.title}</h4>
              <p className="text-sm dark:text-blue-100/60 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full max-w-4xl mx-auto px-6 mb-32 relative z-10 text-center">
        <div className="absolute top-1/2 -left-32 md:-left-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/20 dark:bg-purple-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 -right-32 md:-right-64 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 dark:bg-blue-600/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="relative overflow-hidden py-10 z-10">
          <motion.h2 
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="text-3xl md:text-5xl font-extrabold tracking-tighter leading-tight mb-6 py-2"
          >
            Know your gap. <br className="sm:hidden" /> <span className="dark:text-white text-slate-800">Build the cell.</span>
          </motion.h2>
          <p className="text-base md:text-lg dark:text-blue-100/70 text-slate-700 mb-10 max-w-2xl mx-auto font-medium">
            Most people guess what to learn next. Hexo shows you what actually matters for the role you want — and what to build next to get there.
          </p>
          <button
            onClick={onStartMapping}
            className="relative overflow-hidden bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/20 px-10 py-4 rounded-xl text-lg font-bold inline-flex items-center gap-3 text-slate-800 dark:text-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:bg-purple-600 hover:text-white hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] dark:hover:bg-purple-600 dark:hover:border-purple-400 dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            Start Your Analysis
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Developers Section */}
      <section className="w-full border-y border-transparent py-16 dark:bg-[#111111]/5 bg-white/5 backdrop-blur-md overflow-hidden z-10 block relative">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center relative z-10">
          <h2 className="font-semibold text-xs tracking-widest uppercase dark:text-fuchsia-300/50 text-slate-500">
            developers
          </h2>
        </div>
        <div className="marquee-container relative flex items-center h-24 z-10">
          <div className="marquee-content flex gap-16 px-8 items-center">
            {[1, 2, 3].map((group) => (
              <div key={group} className="flex gap-16 items-center flex-shrink-0">
                <div className="text-2xl font-bold tracking-tighter dark:text-purple-300 text-slate-800">ALFIE ARELLANO</div>
                <div className="text-2xl font-bold tracking-tighter dark:text-blue-500/50 text-slate-300">·</div>
                <div className="text-2xl font-bold tracking-tighter dark:text-purple-300 text-slate-800">JASMIN ALI</div>
                <div className="text-2xl font-bold tracking-tighter dark:text-blue-500/50 text-slate-300">·</div>
                <div className="text-2xl font-bold tracking-tighter dark:text-purple-300 text-slate-800">PAUL ALEXANDER SAMSON</div>
                <div className="text-2xl font-bold tracking-tighter dark:text-blue-500/50 text-slate-300">·</div>
                <div className="text-2xl font-bold tracking-tighter dark:text-purple-300 text-slate-800">YOSHILLE RHIZ CASUAT</div>
                <div className="text-2xl font-bold tracking-tighter dark:text-blue-500/50 text-slate-300">·</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
