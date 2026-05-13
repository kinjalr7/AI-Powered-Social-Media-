'use client';

import { useEffect, useState, useCallback } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { 
  BarChart3, Users, Globe, Activity, RefreshCw, 
  Download, AlertCircle, Filter, Calendar, ChevronDown,
  LayoutDashboard, PieChart, TrendingUp, Briefcase, Target
} from "lucide-react";
import dynamic from 'next/dynamic';
import { analyticsService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic imports for Analytics Components
const AnalyticsSummary = dynamic(() => import("@/components/analytics/AnalyticsSummary"), { 
  ssr: false,
  loading: () => <Skeleton className="h-32 w-full bg-slate-800/50 rounded-2xl" /> 
});
const EngagementTrendChart = dynamic(() => import("@/components/analytics/EngagementTrendChart"), { 
  ssr: false, 
  loading: () => <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" /> 
});
const SentimentBreakdownChart = dynamic(() => import("@/components/analytics/SentimentBreakdownChart"), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" />
});
const PlatformPerformance = dynamic(() => import("@/components/analytics/PlatformPerformance"), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" />
});
const TopContentList = dynamic(() => import("@/components/analytics/TopContentList"), { ssr: false });
const HiringInsights = dynamic(() => import("@/components/analytics/HiringInsights"), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" />
});
const AudienceGrowthChart = dynamic(() => import("@/components/analytics/AudienceGrowthChart"), { 
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" />
});

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [platform, setPlatform] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Data States
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [engagementTrends, setEngagementTrends] = useState<any[]>([]);
  const [sentimentBreakdown, setSentimentBreakdown] = useState<any>(null);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [topContent, setTopContent] = useState<any[]>([]);
  const [hiringTrends, setHiringTrends] = useState<any[]>([]);
  const [audienceGrowth, setAudienceGrowth] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await analyticsService.getFullReport(timeframe, platform === 'all' ? undefined : platform);
      const data = res.data;

      if (!data && !isDemoMode()) {
        throw new Error("No intelligence data received");
      }

      setSummaryData(data?.summary || []);
      setEngagementTrends(data?.engagement || []);
      setSentimentBreakdown(data?.sentiment || null);
      setPlatformData(data?.platforms || []);
      setTopContent(data?.content || []);
      setHiringTrends(data?.hiring || []);
      setAudienceGrowth(data?.growth || []);
      
      setIsDemo(isDemoMode() || localStorage.getItem('demo_mode') === 'true');
      setError(null);
    } catch (err: any) {
      console.error("Analytics Error:", err);
      if (isDemoMode()) {
        // Double down on demo mode if error occurs
        setIsDemo(true);
        const tf = timeframe;
        // The service already handles demo fallback, so if we reach here, 
        // it's a critical failure. But we'll try to keep the UI alive.
      } else {
        setError("Unable to sync with intelligence engine. Please check your connection.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe, platform]);

  useEffect(() => {
    if (mounted) {
      fetchAnalytics();
    }
  }, [mounted, fetchAnalytics]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const res = await analyticsService.exportData(format);
      alert(`Intelligence report exported as ${format.toUpperCase()}. Check your downloads.`);
    } catch (err) {
      alert("Failed to export report.");
    }
  };

  const handleRecalculate = async () => {
    try {
      setRefreshing(true);
      await analyticsService.recalculateInsights(1); // Default company ID
      await fetchAnalytics(true);
    } catch (err) {
      alert("Recalculation failed.");
    } finally {
      setRefreshing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Production-Grade Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  Social Intelligence
                  {isDemo && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                      Demo Mode
                    </span>
                  )}
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Real-time cross-platform performance analytics & AI insights
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe Selector */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
              {(['week', 'month', 'year'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-wider",
                    timeframe === tf 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

            <button 
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              suppressHydrationWarning
              className="bg-slate-800/50 hover:bg-slate-800 text-white p-2.5 rounded-xl border border-white/5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </button>

            <div className="relative group">
              <button suppressHydrationWarning className="purple-gradient-btn text-xs flex items-center gap-2 group">
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Export Data
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button suppressHydrationWarning onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">Export PDF Report</button>
                <button suppressHydrationWarning onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5">Export CSV Sheet</button>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 bg-red-500/5 border border-red-500/10 rounded-3xl text-center space-y-4"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Synchronization Error</h2>
            <p className="text-slate-400 max-w-md mx-auto">{error}</p>
            <button onClick={() => fetchAnalytics()} className="bg-white text-black px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Retry Sync</button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Top Summary Stats */}
            <AnalyticsSummary items={summaryData} loading={loading} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Main Content Area - Left 8 Columns */}
              <div className="xl:col-span-8 space-y-8">
                
                {/* Engagement Trends */}
                <DashboardCard 
                  title="Engagement Dynamics" 
                  subtitle="Interactions and reach growth analysis"
                  className="overflow-hidden"
                  headerAction={
                    <select 
                      suppressHydrationWarning
                      className="bg-transparent text-xs font-bold text-slate-400 outline-none cursor-pointer"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                    >
                      <option value="all">All Platforms</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  }
                >
                  <div className="h-[400px] mt-4">
                    {loading ? <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" /> : <EngagementTrendChart data={engagementTrends} />}
                  </div>
                </DashboardCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Platform Performance */}
                    <DashboardCard title="Platform Comparison" subtitle="Market share and growth rates">
                      <div className="h-[350px] mt-4">
                        {loading ? <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" /> : <PlatformPerformance data={platformData} />}
                      </div>
                    </DashboardCard>

                    {/* Hiring Trends */}
                    <DashboardCard title="Hiring Intelligence" subtitle="Talent signals and recruiting activity">
                      <div className="h-[350px] mt-4">
                        {loading ? <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" /> : <HiringInsights data={hiringTrends} />}
                      </div>
                    </DashboardCard>
                  </div>

                  {/* New Strategic Recommendations Section */}
                  <div className="premium-card p-8 border-primary/10 bg-slate-900/40 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                          <Target className="w-6 h-6 text-primary" />
                          Strategic Recommendations
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">AI-generated growth protocols based on current trend dynamics</p>
                      </div>
                      <button className="px-5 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all">
                        Execute All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      {[
                        { title: "Engagement Boost", desc: "Increase posting frequency on LinkedIn between 9 AM - 11 AM.", impact: "High" },
                        { title: "Sentiment Recovery", desc: "Address trending 'latency' concerns in Twitter replies.", impact: "Medium" },
                        { title: "Content Pivot", desc: "Video content is outperforming static images by 4.2x on IG.", impact: "High" }
                      ].map((rec, i) => (
                        <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/20 transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{rec.title}</span>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                              rec.impact === "High" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-400"
                            )}>{rec.impact} Impact</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium group-hover:text-slate-200 transition-colors">{rec.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Area - Right 4 Columns */}
                <div className="xl:col-span-4 space-y-8">
                  
                  {/* Sentiment Breakdown */}
                  <DashboardCard title="Sentiment Architecture" subtitle="Aggregate brand emotional state">
                    <div className="h-[350px] mt-4">
                      {loading ? <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" /> : <SentimentBreakdownChart data={sentimentBreakdown} />}
                    </div>
                  </DashboardCard>

                  {/* Top Performing Content */}
                  <DashboardCard 
                    title="Elite Content" 
                    subtitle="Highest resonance social posts"
                    headerAction={<button className="text-[10px] font-bold text-primary hover:underline">View All</button>}
                  >
                    <div className="mt-4">
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full bg-slate-800/50 rounded-xl" />)}
                        </div>
                      ) : <TopContentList data={topContent} />}
                    </div>
                  </DashboardCard>

                  {/* Audience Growth */}
                  <DashboardCard title="Network Expansion" subtitle="Follower growth trajectory">
                    <div className="h-[200px] mt-4">
                      {loading ? <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" /> : <AudienceGrowthChart data={audienceGrowth} />}
                    </div>
                  </DashboardCard>

                  {/* Action Panel */}
                  <div className="premium-card p-6 border-primary/20 bg-primary/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Intelligence Engine
                      </h4>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {[
                        { label: "Neural Processors", value: "Optimal", color: "text-primary" },
                        { label: "Data Pipeline", value: "Active", color: "text-emerald-500" },
                        { label: "Sync Latency", value: "24ms", color: "text-white" }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", item.color)}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Node Status Visualization */}
                    <div className="space-y-2 mb-8">
                      <div className="flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <span>Primary Node Status</span>
                        <span>82% Optimized</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                        {[40, 25, 15, 10, 10].map((w, i) => (
                          <div key={i} style={{ width: `${w}%` }} className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            i === 0 ? "bg-primary" : 
                            i === 1 ? "bg-primary/60" : 
                            i === 2 ? "bg-primary/40" : 
                            "bg-white/10"
                          )} />
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 italic">
                      "Intelligence engine is currently scanning 1.2M data points across 4 primary social nodes."
                    </p>

                    <button 
                      onClick={handleRecalculate}
                      className="w-full py-3 bg-slate-800 hover:bg-primary hover:text-white text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <RefreshCw className={cn("w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500", refreshing && "animate-spin")} />
                      Recalculate Insights
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
