'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ReachChartProps {
  data: any[];
}

export default function ReachChart({ data }: ReachChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  const PLATFORM_COLORS: Record<string, string> = {
    'Twitter': '#0ea5e9',
    'LinkedIn': '#0284c7',
    'Facebook': '#2563eb',
    'Instagram': '#f43f5e',
  };

  const chartData = data.map(item => ({
    ...item,
    color: PLATFORM_COLORS[item.name] || item.color
  }));

  return (
    <div className="h-full w-full min-h-[350px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={85}
            outerRadius={115}
            paddingAngle={6}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={800}
            cornerRadius={8}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#grad-${index})`}
                className="hover:opacity-90 transition-opacity cursor-pointer outline-none"
                style={{ filter: `drop-shadow(0 0 15px ${entry.color}44)` }}
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.name}</p>
                    <p className="text-sm font-black text-white tabular-nums">
                      {data.value.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            content={({ payload }) => (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6 px-6">
                {chartData.map((entry: any, index: number) => (
                  <div key={`item-${index}`} className="flex items-center gap-3 group cursor-pointer">
                    <div 
                      className="w-3 h-3 rounded-full transition-all group-hover:scale-125 shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                      style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}66` }} 
                    />
                    <span className="text-[11px] font-black text-gray-400 group-hover:text-white transition-colors uppercase tracking-[0.15em]">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text Overlays */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-4xl font-black text-white tracking-tighter leading-none mb-1 shadow-primary/20 drop-shadow-2xl">
            {formatValue(totalValue)}
          </p>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] opacity-80">Total Reach</p>
        </motion.div>
      </div>
    </div>
  );
}

