'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformData {
  platform: string;
  engagement: number;
  growth: number;
  color: string;
}

export default function PlatformPerformance({ data }: { data: PlatformData[] }) {
  if (!data) return null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="platform" 
              type="category" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              width={80}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px'
              }}
            />
            <Bar dataKey="engagement" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {data.slice(0, 4).map((item) => (
          <div key={item.platform} className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.platform}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-white">{item.engagement.toLocaleString()}</span>
              <span className={cn(
                "text-[10px] font-bold flex items-center",
                item.growth > 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {item.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(item.growth)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
