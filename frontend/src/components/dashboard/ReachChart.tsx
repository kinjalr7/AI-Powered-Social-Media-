'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ReachChartProps {
  data: any[];
}

export default function ReachChart({ data }: ReachChartProps) {
  return (
    <div className="h-[300px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={100}
            paddingAngle={8}
            dataKey="value"
            animationBegin={200}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-foreground text-sm font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                      {payload[0].name}: {payload[0].value}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            content={({ payload }) => (
              <ul className="flex justify-center gap-6 mt-6">
                {payload?.map((entry: any, index: number) => (
                  <li key={`item-${index}`} className="flex items-center gap-2 group cursor-pointer">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-125" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">{entry.value}</span>
                  </li>
                ))}
              </ul>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] text-center pointer-events-none">
        <p className="text-3xl font-black text-foreground tracking-tight">82%</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Total Reach</p>
      </div>
    </div>
  );
}

