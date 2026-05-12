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
      className={cn("premium-card flex flex-col", className)}
    >
      <div className="p-5 border-b border-border flex flex-col gap-1">
        <h3 className="text-foreground font-bold text-base tracking-tight">{title}</h3>
        {subtitle && <p className="text-muted-foreground text-xs font-medium">{subtitle}</p>}
      </div>
      <div className="flex-1 p-5">
        {children}
      </div>
    </motion.div>
  );
}

