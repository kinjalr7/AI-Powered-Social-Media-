'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, TrendingUp } from "lucide-react";

interface HiringData {
  month: string;
  count: number;
}

export default function HiringInsights({ data }: { data: HiringData[] }) {
  if (!data) return null;

  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  const latest = data[data.length - 1].count;
  const previous = data[data.length - 2]?.count || 0;
  const growth = previous > 0 ? ((latest - previous) / previous * 100).toFixed(0) : 100;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Total Signals</span>
          </div>
          <div className="text-2xl font-black text-white">{total}</div>
        </div>
        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Growth</span>
          </div>
          <div className="text-2xl font-black text-white">+{growth}%</div>
        </div>
      </div>

      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={5}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px'
              }}
            />
            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic text-center">
        Detection based on "hiring", "recruiting", and "join our team" keywords in social narratives.
      </p>
    </div>
  );
}
