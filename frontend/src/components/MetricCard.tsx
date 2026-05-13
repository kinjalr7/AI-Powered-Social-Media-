import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  suffix?: string;
  description: string;
  index?: number;
  className?: string;
}

export default function MetricCard({ title, value, icon: Icon, trend, suffix, description, index = 0, className }: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "premium-card p-6 group cursor-default relative overflow-hidden", 
        "hover:bg-gradient-to-br hover:from-card/60 hover:to-primary/5 transition-all duration-500",
        className
      )}
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-colors duration-700" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</span>
        </div>
        <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="space-y-3 relative z-10">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-4xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors duration-300">
            {value}
          </h3>
          {suffix && <span className="text-sm font-black text-muted-foreground">{suffix}</span>}
        </div>
        
        <div className="flex items-center gap-3">
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider",
              isPositive 
                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                : "text-orange-500 bg-orange-500/10 border-orange-500/20"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{trend}%
            </div>
          )}
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">{description}</span>
        </div>
      </div>
    </motion.div>
  );
}


