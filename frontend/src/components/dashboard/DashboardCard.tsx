import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function DashboardCard({ title, subtitle, children, className, delay = 0 }: DashboardCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn("premium-card flex flex-col bg-slate-900/40", className)}
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between group/card">
        <div className="flex flex-col gap-1">
          <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] group-hover/card:text-primary transition-colors">{title}</h3>
          {subtitle && <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow" />
      </div>
      <div className="flex-1 p-6">
        {children}
      </div>
    </motion.div>
  );
}

