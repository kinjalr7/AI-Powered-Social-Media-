'use client';

import { useEffect, useState } from "react";
import { 
  Share2, Plus, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Globe, 
  Instagram, Twitter, Linkedin, Facebook, MessageCircle 
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { socialService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SocialDataPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPlatformIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('instagram')) return <Instagram className="w-5 h-5" />;
    if (n.includes('twitter') || n.includes(' x')) return <Twitter className="w-5 h-5" />;
    if (n.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (n.includes('facebook')) return <Facebook className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await socialService.getAccounts();
      const fetched = res.data;
      const allPlatforms = [
        ...fetched,
        ...['Instagram', 'Twitter', 'LinkedIn', 'Facebook'].filter(name => !fetched.find((f: any) => f.platform.toLowerCase() === name.toLowerCase())).map(name => ({
          name,
          platform: name,
          status: 'Disconnected',
          account: 'Not Connected',
          posts: 0,
          lastSync: 'Never'
        }))
      ];
      
      setPlatforms(allPlatforms);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load social accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading && platforms.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64 bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 w-full bg-slate-800 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Share2 className="w-6 h-6 text-indigo-500" />
              Social Connections
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Manage your connected social media platforms and sync status</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAccounts}
              className="p-2 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-all text-slate-400 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" />
              Connect Platform
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((p) => {
            const platformName = p.name || p.platform || 'Unknown';
            return (
              <div key={platformName} className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 space-y-4 hover:border-indigo-500/40 transition-all group cursor-pointer shadow-lg">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                    p.status === 'Connected' ? "text-indigo-400" : "text-slate-500"
                  )}>
                    {getPlatformIcon(platformName)}
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    p.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  )}>
                    {p.status}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold group-hover:text-indigo-400 transition-colors">{platformName}</h3>
                  <p className="text-xs font-medium text-slate-500">{p.account}</p>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Total Posts</p>
                    <p className="text-sm font-bold text-white tracking-tight">{p.posts}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Last Sync</p>
                    <p className="text-sm font-bold text-white tracking-tight">{p.lastSync}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DashboardCard title="Real-time Sync Activity" subtitle="Historical record of data imports and platform updates">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-bold group-hover:text-indigo-400 transition-colors">Successfully synced data</p>
                    <p className="text-xs text-slate-500 font-medium">Imported new posts and interaction metrics</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">May 11, 2024</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

