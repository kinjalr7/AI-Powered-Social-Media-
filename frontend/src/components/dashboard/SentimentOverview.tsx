'use client';

import { motion } from "framer-motion";

interface SentimentOverviewProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export default function SentimentOverview({ data }: SentimentOverviewProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-1">Overall Mood</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground tracking-tighter">{data.positive}%</span>
            <span className="text-sm font-bold text-emerald-500">Positive</span>
          </div>
        </div>
        <div className="relative w-14 h-14">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(16, 185, 129, 0.1)"
              strokeWidth="3"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: data.positive / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="100, 100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <SentimentBar label="Positive" value={data.positive} color="bg-emerald-500" glow="shadow-emerald-500/20" />
        <SentimentBar label="Neutral" value={data.neutral} color="bg-blue-500" glow="shadow-blue-500/20" />
        <SentimentBar label="Negative" value={data.negative} color="bg-orange-500" glow="shadow-orange-500/20" />
      </div>
    </div>
  );
}

function SentimentBar({ label, value, color, glow }: { label: string, value: number, color: string, glow: string }) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-sm font-black text-foreground">{value}%</span>
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full relative", color, glow, "shadow-[0_0_10px_rgba(0,0,0,0.1)]")}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

