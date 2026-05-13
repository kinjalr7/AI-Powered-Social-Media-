'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Users, Smile, Target, Download, RefreshCw, AlertCircle, Filter, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import MetricCard from '@/components/MetricCard';
import AnalysisBanner from '@/components/dashboard/AnalysisBanner';
import DashboardCard from '@/components/dashboard/DashboardCard';

// Dynamic imports for heavy components
const EngagementChart = dynamic(() => import('@/components/dashboard/EngagementChart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground/20 font-black text-xs uppercase tracking-widest">Loading Analytics...</div>
});
const ReachChart = dynamic(() => import('@/components/dashboard/ReachChart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-xl flex items-center justify-center text-muted-foreground/20 font-black text-xs uppercase tracking-widest">Mapping Reach...</div>
});
const SentimentOverview = dynamic(() => import('@/components/dashboard/SentimentOverview'), { 
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse bg-white/5 rounded-xl" />
});
const TopTopics = dynamic(() => import('@/components/dashboard/TopTopics'), { 
  ssr: false,
  loading: () => <div className="h-[250px] animate-pulse bg-white/5 rounded-xl" />
});
const RecentPosts = dynamic(() => import('@/components/dashboard/RecentPosts'), { 
  ssr: false,
  loading: () => <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse bg-white/5 rounded-xl" />)}</div>
});

import { dashboardService, reportsService } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { isDemoMode } from '@/lib/seedData';

export default function DashboardPage() {
  const router = useRouter();
  
  // Granular loading states for parallel fetching
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    engagement: true,
    reach: true,
    sentiment: true,
    topics: true,
    posts: true
  });
  
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    stats: null,
    engagement: null,
    reach: null,
    sentiment: null,
    topics: null,
    posts: null
  });
  
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [isExporting, setIsExporting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const fetchDashboardPart = async (key: string, fetchFn: () => Promise<any>) => {
    try {
      const res = await fetchFn();
      setData(prev => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      // We don't set a global error here to allow partial rendering
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const fetchAllData = useCallback(async (currentTimeframe = timeframe) => {
    setLoadingStates({
        stats: true,
        engagement: true,
        reach: true,
        sentiment: true,
        topics: true,
        posts: true
    });
    setError(null);
    setDemoMode(isDemoMode());

    try {
      const res = await dashboardService.getDashboardSummary(currentTimeframe);
      const dataBlob = res.data;
      
      setData({
        stats: dataBlob.stats,
        engagement: dataBlob.engagement,
        reach: dataBlob.reach,
        sentiment: dataBlob.sentiment,
        topics: dataBlob.topics,
        posts: dataBlob.posts
      });
    } catch (err: any) {
      console.error("Dashboard Load Error:", err);
      if (err?.response?.status === 401) {
        router.push('/login');
      } else {
        setError("Intelligence systems offline. Attempting protocol recovery...");
        toast.error("Failed to sync intelligence data");
      }
    } finally {
      setLoadingStates({
        stats: false,
        engagement: false,
        reach: false,
        sentiment: false,
        topics: false,
        posts: false
      });
    }
  }, [timeframe, router]);

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'UPDATE_KPI') {
        setData((prev: any) => {
            if (!prev.stats) return prev;
            const newStats = [...prev.stats];
            const index = newStats.findIndex(s => s.title === message.data.title);
            if (index !== -1) {
                newStats[index] = { ...newStats[index], ...message.data };
            }
            return { ...prev, stats: newStats };
        });
    } else if (message.type === 'NEW_POST') {
        setData((prev: any) => {
            if (!prev.posts) return prev;
            return {
                ...prev,
                posts: [message.data, ...prev.posts].slice(0, 5)
            };
        });
    }
  }, []);

  const { connected } = useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Users': return Users;
      case 'Smile': return Smile;
      case 'Target': return Target;
      default: return Zap;
    }
  };

  // If everything failed or is still loading for the first time
  const isInitialLoad = Object.values(loadingStates).every(v => v) && !data.stats;

  if (isInitialLoad) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 bg-white/5" />
            <Skeleton className="h-4 w-96 bg-white/5" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-48 bg-white/5 rounded-xl" />
            <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>

        <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[450px] lg:col-span-2 bg-white/5 rounded-2xl" />
          <Skeleton className="h-[450px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Sub Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground mb-1">Social Intelligence <span className="text-primary italic">Pulse</span></h1>
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">Real-time cross-platform performance monitoring</p>
              {demoMode && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                  <Info className="w-3 h-3" />
                  Demo Mode
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-muted/50 border border-border rounded-xl p-1 shadow-inner">
              {(['week', 'month', 'year'] as const).map((t) => (
                <button 
                  key={t}
                  onClick={() => { setTimeframe(t); fetchAllData(t); }}
                  className={cn(
                    "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all", 
                    timeframe === t ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            
            <div className="h-10 w-px bg-border mx-2 hidden md:block" />
            
            <button 
              onClick={() => fetchAllData(timeframe)}
              className="p-2.5 bg-muted/50 border border-border rounded-xl hover:bg-accent transition-all text-muted-foreground hover:text-foreground shadow-sm group"
              title="Refresh Data"
            >
              <RefreshCw className={cn("w-4 h-4 transition-transform group-hover:rotate-180 duration-500", Object.values(loadingStates).some(v => v) && "animate-spin")} />
            </button>
            
            <button 
              className="p-2.5 bg-muted/50 border border-border rounded-xl hover:bg-accent transition-all text-muted-foreground hover:text-foreground shadow-sm"
              title="Filter Views"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button 
              onClick={async () => {
                setIsExporting(true);
                try {
                  await reportsService.generate();
                  toast.success('Report generation started!');
                  setTimeout(() => router.push('/reports'), 1500);
                } catch (err) {
                  toast.error('Failed to generate report');
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting}
              className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating...' : 'Export Intelligence'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingStates.stats && !data.stats ? (
                [1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full bg-white/5 rounded-2xl" />)
              ) : (
                data.stats?.map((stat: any, index: number) => (
                  <MetricCard 
                    key={index}
                    index={index}
                    title={stat.title}
                    value={stat.value}
                    trend={stat.trend}
                    description={stat.description}
                    icon={getIcon(stat.icon)}
                    className="bg-card/30"
                  />
                ))
              )}
            </div>

            {/* Info Banner */}
            <AnalysisBanner loading={loadingStates.stats} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DashboardCard 
                title="Engagement Pulse" 
                subtitle="Daily interaction trends across all nodes"
                className="lg:col-span-2 bg-card/30"
              >
                {loadingStates.engagement && !data.engagement ? (
                    <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-xl" />
                ) : (
                    <EngagementChart data={data.engagement} />
                )}
              </DashboardCard>
              
              <DashboardCard 
                title="Platform Distribution" 
                subtitle="Reach density by network"
                className="bg-card/30"
              >
                {loadingStates.reach && !data.reach ? (
                    <div className="h-[300px] w-full animate-pulse bg-white/5 rounded-xl" />
                ) : (
                    <ReachChart data={data.reach} />
                )}
              </DashboardCard>
            </div>

            {/* Recent Posts */}
            <DashboardCard 
              title="Intelligence Feed" 
              subtitle="Latest transmissions from connected protocols"
              className="bg-card/30"
            >
              {loadingStates.posts && !data.posts ? (
                  <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
              ) : (
                  <RecentPosts data={data.posts} />
              )}
            </DashboardCard>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <DashboardCard 
              title="Sentiment Index" 
              subtitle="Current public mood analysis"
              className="bg-card/30"
            >
              {loadingStates.sentiment && !data.sentiment ? (
                  <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
              ) : (
                  <SentimentOverview data={data.sentiment} />
              )}
            </DashboardCard>
            
            <DashboardCard 
              title="Emerging Topics" 
              subtitle="Trending neural clusters"
              className="bg-card/30"
            >
              {loadingStates.topics && !data.topics ? (
                  <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
              ) : (
                  <TopTopics data={data.topics} timeframe={timeframe} />
              )}
            </DashboardCard>
            
            {/* Quick Actions / Status Card */}
            <div className="premium-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Network Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold">API Connectivity</span>
                  <span className="text-emerald-500 font-black">STABLE</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold">Sync Latency</span>
                  <span className="text-foreground font-black">12ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold">Neural Engine</span>
                  <span className="text-primary font-black">ACTIVE</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/settings')}
                className="w-full mt-6 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all"
              >
                System Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

