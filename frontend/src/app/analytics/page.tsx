'use client';

import { useEffect, useState } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MetricCard from "@/components/MetricCard";
import { BarChart3, Users, Globe, Activity, RefreshCw, Download, AlertCircle } from "lucide-react";
import EngagementChart from "@/components/dashboard/EngagementChart";
import ReachChart from "@/components/dashboard/ReachChart";
import SentimentOverview from "@/components/dashboard/SentimentOverview";
import TopTopics from "@/components/dashboard/TopTopics";
import { dashboardService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [reachData, setReachData] = useState<any[]>([]);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [topicsData, setTopicsData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [engagementRes, reachRes, sentimentRes, topicsRes] = await Promise.all([
        dashboardService.getEngagementData(),
        dashboardService.getPlatformReach(),
        dashboardService.getSentimentOverview(),
        dashboardService.getTopTopics(),
      ]);
      
      setEngagementData(engagementRes.data);
      setReachData(reachRes.data);
      setSentimentData(sentimentRes.data);
      setTopicsData(topicsRes.data);
      
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && engagementData.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64 bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 w-full bg-slate-800 rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-[120px] w-full bg-slate-800 rounded-xl" />
            <Skeleton className="h-[120px] w-full bg-slate-800 rounded-xl" />
            <Skeleton className="h-[120px] w-full bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 h-[80vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
        <button 
          onClick={fetchData}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Sub Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-indigo-500" />
              Deep Analytics
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Detailed performance metrics and growth trends</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-2 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-all text-slate-400 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardCard title="Engagement Growth Over Time" className="lg:col-span-2">
            <EngagementChart data={engagementData} />
          </DashboardCard>
          
          <div className="space-y-6">
            <MetricCard 
              title="Follower Retention"
              value="94.2%"
              trend={12.4}
              icon={Users}
              description="Users who stay active"
            />
            <MetricCard 
              title="CPC Average"
              value="$1.24"
              trend={-2.1}
              icon={BarChart3}
              description="Cost per interaction"
            />
            <MetricCard 
              title="Global Reach Score"
              value="87.5"
              trend={8.7}
              icon={Globe}
              description="Market penetration index"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Platform Reach Distribution">
            <ReachChart data={reachData} />
          </DashboardCard>
          
          <DashboardCard title="Sentiment Breakdown">
            {sentimentData && <SentimentOverview data={sentimentData} />}
          </DashboardCard>

          <DashboardCard title="Key Content Themes">
            <TopTopics data={topicsData} timeframe="month" />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
