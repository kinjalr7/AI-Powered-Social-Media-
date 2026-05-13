'use client';

import { Sparkles, ArrowUpRight } from "lucide-react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

interface AnalysisBannerProps {
  insights?: string;
  loading?: boolean;
}

export default function AnalysisBanner({ insights, loading }: AnalysisBannerProps) {
  const router = useRouter();

  const defaultInsight = (
    <>
      Your engagement is up by <span className="text-emerald-500 font-bold">15%</span> this week. We found <span className="text-primary font-bold">3 new viral trends</span> in your niche that could boost your reach by 25%.
    </>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="w-full bg-gradient-to-r from-purple-600/20 via-blue-600/10 to-transparent border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl -mr-32 -mt-32 rounded-full group-hover:bg-purple-500/10 transition-colors duration-700" />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 group-hover:scale-110 transition-transform duration-500">
          <Sparkles className="text-white w-7 h-7 animate-pulse" />
        </div>
        <div>
          <h2 className="text-foreground font-black text-xl tracking-tight mb-1">AI Intelligence Insight</h2>
          <div className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xl">
            {loading ? (
              <div className="flex gap-2 items-center">
                <div className="h-4 w-48 bg-white/5 animate-pulse rounded" />
              </div>
            ) : (
              insights || defaultInsight
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={() => router.push('/analytics')}
        className="premium-card bg-muted hover:bg-accent px-6 py-3 rounded-xl text-sm font-bold text-foreground flex items-center gap-2 transition-all group relative z-10 whitespace-nowrap active:scale-95"
      >
        Explore Analysis
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}

