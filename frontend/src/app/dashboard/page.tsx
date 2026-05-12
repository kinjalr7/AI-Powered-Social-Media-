'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Users, Smile, Target, Download, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import AnalysisBanner from '@/components/dashboard/AnalysisBanner';
import DashboardCard from '@/components/dashboard/DashboardCard';
import EngagementChart from '@/components/dashboard/EngagementChart';
import ReachChart from '@/components/dashboard/ReachChart';
import SentimentOverview from '@/components/dashboard/SentimentOverview';
import TopTopics from '@/components/dashboard/TopTopics';
import RecentPosts from '@/components/dashboard/RecentPosts';
import { dashboardService, reportsService } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = useCallback(async (currentTimeframe = timeframe) => {
    setLoading(true);
    setError(null);
    try {
      const [stats, engagement, reach, sentiment, topics, posts] = await Promise.all([
        dashboardService.getStats(currentTimeframe),
        dashboardService.getEngagementData(currentTimeframe),
        dashboardService.getPlatformReach(currentTimeframe),
        dashboardService.getSentimentOverview(currentTimeframe),
        dashboardService.getTopTopics(currentTimeframe),
        dashboardService.getRecentPosts(currentTimeframe),
      ]);

      setData({
        stats: stats.data,
        engagement: engagement.data,
        reach: reach.data,
        sentiment: sentiment.data,
        topics: topics.data,
        posts: posts.data,
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push('/login');
        return;
      }
      
      console.error("Dashboard API error:", err);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [timeframe, router]);

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'UPDATE_KPI') {
        setData((prev: any) => {
            if (!prev) return prev;
            const newStats = [...prev.stats];
            const index = newStats.findIndex(s => s.title === message.data.title);
            if (index !== -1) {
                newStats[index] = { ...newStats[index], ...message.data };
            }
            return { ...prev, stats: newStats };
        });
    } else if (message.type === 'NEW_POST') {
        setData((prev: any) => {
            if (!prev) return prev;
            return {
                ...prev,
                posts: [message.data, ...prev.posts].slice(0, 5)
            };
        });
    }
  }, []);

  const { connected } = useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Users': return Users;
      case 'Smile': return Smile;
      case 'Target': return Target;
      default: return Zap;
    }
  };

  if (loading && !data) {
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

  if (error) {
    return (
      <div className="p-8 h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center border border-destructive/20">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-foreground tracking-tight">System Interruption</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">{error}</p>
        </div>
        <button 
          onClick={() => fetchData(timeframe)}
          className="purple-gradient-btn"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  if (!data || (data.stats.length === 0 && data.posts.length === 0)) {
    return (
        <div className="p-8 h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Ready for Intelligence?</h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">Connect your social accounts to start seeing real-time AI-powered insights and cross-platform analytics.</p>
          </div>
          <button 
            onClick={() => router.push('/connect')}
            className="purple-gradient-btn"
          >
            Connect Your Accounts
          </button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Sub Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Real-time social media analytics and insights</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted border border-border rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((t) => (
                <button 
                  key={t}
                  onClick={() => { setTimeframe(t); fetchData(t); }}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all", 
                    timeframe === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => fetchData(timeframe)}
              className="p-2 bg-muted border border-border rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            
            <button 
              onClick={async () => {
                setIsExporting(true);
                try {
                  await reportsService.generate();
                  toast.success('Report generation started!');
                } catch (err) {
                  toast.error('Failed to generate report');
                } finally {
                  setIsExporting(false);
                }
              }}
              disabled={isExporting}
              className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-primary/20"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating...' : 'Export Insights'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.stats.map((stat: any, index: number) => (
            <MetricCard 
              key={index}
              index={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              description={stat.description}
              icon={getIcon(stat.icon)}
            />
          ))}
        </div>

        {/* Info Banner */}
        <AnalysisBanner />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardCard 
            title="Sentiment Trend (24h)" 
            subtitle="Real-time sentiment analysis over time"
            className="lg:col-span-2"
          >
            <EngagementChart data={data.engagement} />
          </DashboardCard>
          
          <DashboardCard title="Platform Distribution" subtitle="Posts and engagement by platform">
            <ReachChart data={data.reach} />
          </DashboardCard>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Sentiment Overview" subtitle="Public mood analysis">
            <SentimentOverview data={data.sentiment} />
          </DashboardCard>
          
          <DashboardCard title="Top Topics" subtitle="Trending topics and sentiment">
            <TopTopics data={data.topics} timeframe={timeframe} />
          </DashboardCard>
          
          <DashboardCard title="Recent Posts" subtitle="Latest social media activity">
            <RecentPosts data={data.posts} />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

