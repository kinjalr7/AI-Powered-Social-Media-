'use client';

import { motion } from "framer-motion";
import { Zap, Smile, Users, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryItem {
  id: string;
  title: string;
  value: string;
  trend: number;
  description: string;
  status: 'positive' | 'negative' | 'neutral';
}

interface AnalyticsSummaryProps {
  items: SummaryItem[];
  loading?: boolean;
}

export default function AnalyticsSummary({ items, loading }: AnalyticsSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getIcon = (id: string) => {
    switch (id) {
      case 'engagement': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'sentiment': return <Smile className="w-5 h-5 text-emerald-400" />;
      case 'reach': return <Users className="w-5 h-5 text-blue-400" />;
      case 'hiring': return <Target className="w-5 h-5 text-purple-400" />;
      default: return <Zap className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="premium-card p-6 relative overflow-hidden group hover:border-primary/40 transition-all duration-300"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-slate-800/50 rounded-xl border border-white/5">
              {getIcon(item.id)}
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
              item.trend > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            )}>
              {item.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(item.trend)}%
            </div>
          </div>

          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{item.title}</h3>
            <div className="text-3xl font-extrabold text-white tracking-tight">{item.value}</div>
            <p className="text-slate-500 text-[11px] mt-2 font-medium line-clamp-1">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
