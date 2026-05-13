'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentBreakdownProps {
  data: {
    overall: number;
    segments: Array<{ name: string; value: number; color: string }>;
  };
}

export default function SentimentBreakdownChart({ data }: SentimentBreakdownProps) {
  if (!data) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.segments}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-white/5 text-center">
        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Health Score</div>
        <div className="text-3xl font-extrabold text-emerald-400">{data.overall}%</div>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Aggregate emotional resonance across all channels</p>
      </div>
    </div>
  );
}
