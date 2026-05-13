'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopicsBarChartProps {
  data: any[];
}

export default function TopicsBarChart({ data }: TopicsBarChartProps) {
  const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#3b82f6', '#ec4899'];

  // Ensure data is numeric
  const processedData = (data || []).map(item => ({
    ...item,
    count: typeof item.count === 'string' ? parseFloat(item.count.replace(/[^\d.]/g, '')) * (item.count.includes('K') ? 1000 : 1) : item.count
  }));

  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
        <p className="text-slate-500 text-sm font-medium">No trending topics detected</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            type="number" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11 }}
            hide
          />
          <YAxis 
            dataKey="topic" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#f1f5f9', fontSize: 13, fontWeight: 700 }}
            width={140}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl space-y-2 min-w-[180px]">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{item.topic}</p>
                    <div className="flex items-center gap-4 justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Mentions:</span>
                      <span className="text-sm font-black text-white">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                    {item.growth && (
                      <div className="flex items-center gap-4 justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Growth:</span>
                        <span className={`text-xs font-black ${item.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 6, 6, 0]} 
            barSize={24}
            isAnimationActive={false}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
