/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileSearch, 
  Cpu, 
  Map, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { motion } from 'motion/react';

interface HowItWorksScreenProps {
  onStartMapping: () => void;
}

export function HowItWorksScreen({ onStartMapping }: HowItWorksScreenProps) {
  const steps = [
    {
      icon: FileSearch,
      title: "Input your profile",
      description: "Upload your resume, connect your GitHub, or paste your experience summary. We extract and organize your skills into a structured profile."
    },
    {
      icon: Cpu,
      title: "Analyze your skills",
      description: "We compare your skill profile against real job descriptions and role requirements. This shows how your experience aligns with the market."
    },
    {
      icon: Map,
      title: "Identify gaps",
      description: "We highlight the exact skills you’re missing or underdeveloped for your target role. Both technical and non-technical areas are included."
    },
    {
      icon: CheckCircle2,
      title: "Build your path",
      description: "We turn those gaps into step-by-step project recommendations and learning actions. So you always know what to work on next."
    }
  ];

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold dark:text-purple-50 text-slate-800 mb-4 tracking-tight">How Hexo Works</h2>
        <p className="dark:text-blue-100/70 text-slate-600 text-lg max-w-2xl">
          A simple system that turns your experience into a structured path toward your target role.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card border border-purple-100 dark:border-purple-500/20 bg-white/60 dark:bg-purple-900/10 rounded-2xl p-8 flex gap-6 hover:border-purple-200 dark:hover:border-purple-500/40 transition-all group"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold dark:text-purple-100 text-slate-800 mb-2 font-sans">{step.title}</h3>
                <p className="dark:text-blue-100/60 text-slate-600 leading-relaxed text-sm font-sans">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 p-8 rounded-2xl bg-white/40 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/20 text-center w-full glass-card relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-30"></div>
        <h3 className="dark:text-blue-100/90 text-slate-800 mb-6 font-semibold text-xl">Ready to get clarity on your next role?</h3>
        <button 
          onClick={onStartMapping}
          className="relative overflow-hidden bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/20 px-10 py-4 rounded-xl text-lg font-bold inline-flex items-center gap-3 text-slate-800 dark:text-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:bg-purple-600 hover:text-white hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] dark:hover:bg-purple-600 dark:hover:border-purple-400 dark:hover:shadow-[0_0_30_rgba(168,85,247,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          Start Your Analysis
          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
