'use client';

import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

interface TopTopicsProps {
  data: any[];
  timeframe: string;
}

export default function TopTopics({ data, timeframe }: TopTopicsProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <motion.div 
          key={index} 
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          viewport={{ once: true }}
          className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm group-hover:scale-110 transition-transform">
              #{index + 1}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-0.5">{item.topic}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.count} mentions</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xs font-black tracking-tight ${
              (typeof item.growth === 'string' && item.growth.startsWith('+')) || 
              (typeof item.growth === 'number' && item.growth >= 0) 
                ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {typeof item.growth === 'number' ? (item.growth >= 0 ? `+${item.growth}%` : `${item.growth}%`) : item.growth}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">vs last {timeframe}</p>
          </div>
        </motion.div>
      ))}
      <button 
        onClick={() => router.push('/analytics')}
        className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all border-t border-border mt-4 hover:bg-muted/30"
      >
        Explore Trends
      </button>
    </div>
  );
}

