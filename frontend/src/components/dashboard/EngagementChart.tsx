'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EngagementChartProps {
  data: any[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
            className="text-muted-foreground"
            dy={15}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
            className="text-muted-foreground"
            dx={-10}
          />
          <Tooltip 
            cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-foreground text-lg font-bold">
                      {payload[0].value.toLocaleString()} <span className="text-primary text-xs">interactions</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="engagement" 
            stroke="#8b5cf6" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorEngage)"
            animationDuration={2000}
            style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

