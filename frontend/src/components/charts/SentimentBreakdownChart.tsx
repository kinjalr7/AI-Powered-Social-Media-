'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentBreakdownChartProps {
  data: {
    overall: number;
    segments: any[];
  };
}

export default function SentimentBreakdownChart({ data }: SentimentBreakdownChartProps) {
  if (!data || !data.segments || data.segments.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-slate-500 text-sm">No sentiment data</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[300px] flex flex-col items-center justify-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <span className="block text-3xl font-bold text-white">{data.overall}%</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Positive</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.segments}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.segments.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl min-w-[120px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="text-xs font-black text-gray-200 uppercase tracking-widest">{item.name}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Count:</span>
                      <span className="text-sm font-black text-white">{item.value.toLocaleString()}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center" 
            iconType="circle"
            formatter={(value) => <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{value}</span>}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
