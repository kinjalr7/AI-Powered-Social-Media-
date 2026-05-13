'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface PlatformComparisonChartProps {
  data: any[];
}

export default function PlatformComparisonChart({ data }: PlatformComparisonChartProps) {
  // Enhanced validation
  if (!data || data.length < 2) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
        <p className="text-slate-500 text-sm font-medium">Insufficient platform variety for radar analysis</p>
      </div>
    );
  }

  // Radar charts look better when values are normalized or on similar scales
  // Here we just ensure we have numeric values
  const processedData = data.map(item => ({
    ...item,
    engagement: Number(item.engagement) || 0,
    reach: Number(item.reach) || 0,
    posts: Number(item.posts) || 0
  }));

  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="85%" data={processedData}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: '#f1f5f9', fontSize: 12, fontWeight: 700 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'auto']} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl space-y-3 min-w-[180px]">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{item.name}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Engagement:</span>
                        <span className="text-sm font-black text-white tabular-nums">{item.engagement.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Reach:</span>
                        <span className="text-sm font-black text-cyan-400 tabular-nums">{item.reach.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Posts:</span>
                        <span className="text-sm font-black text-orange-400 tabular-nums">{item.posts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            name="Engagement"
            dataKey="engagement"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.4}
            isAnimationActive={false}
          />
          <Radar
            name="Reach"
            dataKey="reach"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="#06b6d4"
            fillOpacity={0.2}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
