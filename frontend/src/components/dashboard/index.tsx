"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  Activity, 
  Zap,
  Globe,
  Share2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export function StatsGrid({ stats }: { stats: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-8 glass-card-hover border-white/5 relative group"
        >
          <div className={`absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r ${
            stat.color === 'purple' ? 'from-primary to-accent' : 
            stat.color === 'pink' ? 'from-secondary to-primary' : 'from-accent to-secondary'
          }`} />
          
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "p-4 rounded-2xl transition-all duration-300",
              stat.color === 'purple' ? 'bg-primary/20 text-primary shadow-neon-purple' : 
              stat.color === 'pink' ? 'bg-secondary/20 text-secondary shadow-neon-pink' : 
              'bg-accent/20 text-accent shadow-neon-cyan'
            )}>
              {stat.label.includes('ENGAGEMENT') ? <Heart className="w-6 h-6" /> : 
               stat.label.includes('SENTIMENT') ? <Zap className="w-6 h-6" /> : 
               stat.label.includes('NODES') ? <Users className="w-6 h-6" /> : 
               <Activity className="w-6 h-6" />}
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-black ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {stat.trend.startsWith('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stat.trend}
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
          <h3 className="text-4xl font-black tracking-tighter">{stat.value}</h3>
        </motion.div>
      ))}
    </div>
  );
}

const dummyTrends = [
  { name: '00:00', value: 400 },
  { name: '04:00', value: 300 },
  { name: '08:00', value: 600 },
  { name: '12:00', value: 800 },
  { name: '16:00', value: 500 },
  { name: '20:00', value: 900 },
  { name: '23:59', value: 1100 },
];

export function EngagementChart({ data }: { data: any[] }) {
  const chartData = data.length > 0 ? data : dummyTrends;

  return (
    <div className="h-[400px] w-full min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0A0A1A', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#fff',
              backdropFilter: 'blur(10px)'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#8B5CF6" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorPrimary)" 
            animationDuration={2000}
          />
          <Area 
            type="monotone" 
            dataKey="value2" 
            stroke="#EC4899" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorSecondary)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const dummySentiment = [
  { name: 'Positive', value: 65, color: '#8B5CF6' },
  { name: 'Neutral', value: 25, color: '#06B6D4' },
  { name: 'Negative', value: 10, color: '#EC4899' },
];

export function SentimentPieChart({ data }: { data: any[] }) {
  const chartData = data.length > 0 ? data : dummySentiment;

  return (
    <div className="h-[300px] w-full min-h-[300px] flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={10}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0A0A1A', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-6">
        {chartData.map((item: any) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.name}</span>
            <span className="text-xs font-bold text-white">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentPostsTable({ posts }: { posts: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/[0.05] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <th className="px-8 py-6">Transmission Content</th>
            <th className="px-8 py-6">Protocol</th>
            <th className="px-8 py-6 text-center">Neural Sync</th>
            <th className="px-8 py-6">Sync Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {(posts.length > 0 ? posts : [1,2,3,4,5]).map((post: any, i: number) => (
            <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
              <td className="px-8 py-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-white transition-colors">
                    {post.content || "Neural transmission encrypted. Decoding successful. Cluster 7 reporting high engagement."}
                  </p>
                  <span className="text-[10px] text-gray-600 font-bold uppercase">Hash: #8293-AX-92</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${i % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {i % 2 === 0 ? <Globe className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{i % 2 === 0 ? 'Global' : 'Direct'}</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-black text-white">{post.engagement || "4,821"}</span>
                  <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary neon-glow-purple w-[70%]" />
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Synced
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
