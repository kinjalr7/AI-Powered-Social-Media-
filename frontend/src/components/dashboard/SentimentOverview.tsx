'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SentimentOverviewProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export default function SentimentOverview({ data }: SentimentOverviewProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-emerald-500/20 transition-colors duration-700" />
        
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-[0.25em] mb-2">Neural Sentiment</span>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-white tracking-tighter shadow-emerald-500/20 drop-shadow-2xl">{data.positive}%</span>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Positive</span>
          </div>
        </div>
        
        <div className="relative w-20 h-20 z-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(16, 185, 129, 0.05)"
              strokeWidth="4"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: data.positive / 100 }}
              transition={{ duration: 2, ease: "circOut" }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="100, 100"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <SentimentBar label="Positive Spectrum" value={data.positive} color="bg-emerald-500" glow="shadow-emerald-500/40" />
        <SentimentBar label="Neutral Zone" value={data.neutral} color="bg-cyan-500" glow="shadow-cyan-500/40" />
        <SentimentBar label="Negative Drift" value={data.negative} color="bg-rose-500" glow="shadow-rose-500/40" />
      </div>
    </div>
  );
}

function SentimentBar({ label, value, color, glow }: { label: string, value: number, color: string, glow: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</span>
        <span className="text-xs font-black text-white tabular-nums tracking-widest">{value}%</span>
      </div>
      <div className="h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05] p-[2px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={cn("h-full rounded-full relative", color, glow, "shadow-[0_0_15px_rgba(0,0,0,0.2)]")}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </motion.div>
      </div>
    </div>
  );
}


