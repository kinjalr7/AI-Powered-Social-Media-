'use client';

import { useEffect, useState } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import EngagementChart from "@/components/dashboard/EngagementChart";
import ReachChart from "@/components/dashboard/ReachChart";
import GrowthChart from "@/components/dashboard/GrowthChart";
import SentimentOverview from "@/components/dashboard/SentimentOverview";
import { dashboardService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart, PieChart, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChartsPage() {
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [reachData, setReachData] = useState<any[]>([]);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [engagementRes, reachRes, sentimentRes] = await Promise.all([
        dashboardService.getEngagementData(),
        dashboardService.getPlatformReach(),
        dashboardService.getSentimentOverview()
      ]);
      setEngagementData(engagementRes.data);
      setReachData(reachRes.data);
      setSentimentData(sentimentRes.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load charts data.");
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full bg-slate-800 rounded-xl" />
          <Skeleton className="h-[400px] w-full bg-slate-800 rounded-xl" />
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
              <BarChart className="w-6 h-6 text-indigo-500" />
              Visual Insights
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Interactive chart library for specialized data views</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-2 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-all text-slate-400 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
               <button className="p-1.5 rounded-md bg-indigo-600 text-white shadow-sm">
                  <BarChart className="w-4 h-4" />
               </button>
               <button className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors">
                  <PieChart className="w-4 h-4" />
               </button>
               <button className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Metric Comparison" subtitle="Comparing engagement across periods">
            <EngagementChart data={engagementData} />
          </DashboardCard>
          
          <DashboardCard title="Platform Distribution" subtitle="Active users by social channel">
            <ReachChart data={reachData} />
          </DashboardCard>

          <DashboardCard title="Growth Velocity" subtitle="Weekly acceleration of reach">
            <GrowthChart data={engagementData} />
          </DashboardCard>

          <DashboardCard title="Sentiment Breakdown" subtitle="Emotional tone analysis">
            {sentimentData ? (
              <SentimentOverview data={sentimentData} />
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-slate-500 font-medium text-sm">No sentiment data available</p>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
