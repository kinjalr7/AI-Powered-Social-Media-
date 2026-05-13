'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EngagementChartProps {
  data: any[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-full w-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 700 }}
            dy={15}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 700 }}
            dx={-10}
          />
          <Tooltip 
            cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '6 6' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-4 min-w-[180px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
                    <div className="space-y-3">
                      {payload.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}` }} />
                            <span className="text-xs font-black text-white capitalize tracking-wide">{item.name}</span>
                          </div>
                          <span className="text-sm font-black text-white tabular-nums">
                            {item.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="engagement" 
            name="Engagement"
            stroke="#8b5cf6" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorEngage)"
            animationDuration={2500}
            style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.5))' }}
            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="reach" 
            name="Reach"
            stroke="#06b6d4" 
            strokeWidth={3}
            strokeDasharray="8 5"
            fillOpacity={1} 
            fill="url(#colorReach)"
            animationDuration={3000}
            style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.3))' }}
            activeDot={{ r: 5, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

