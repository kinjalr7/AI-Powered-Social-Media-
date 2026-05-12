import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  suffix?: string;
  description: string;
  index?: number;
}

export default function MetricCard({ title, value, icon: Icon, trend, suffix, description, index = 0 }: MetricCardProps) {
  const isPositive = trend && trend > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="premium-card p-5 hover:shadow-xl transition-shadow group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="text-muted-foreground group-hover:text-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        
        {trend !== undefined ? (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{trend}%
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">from yesterday</span>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground font-medium">{description}</p>
        )}
      </div>
    </motion.div>
  );
}


