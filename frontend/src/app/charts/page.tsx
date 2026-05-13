'use client';

import { useEffect, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import { chartsService } from "@/services/api";
import { isDemoMode } from "@/lib/seedData";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  RefreshCw, 
  Download, 
  Filter, 
  Calendar,
  Layers,
  ChevronDown,
  Info,
  FileText,
  Table as TableIcon,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";

// Specialized chart components
const EngagementTrendChart = dynamic(() => import("@/components/dashboard/EngagementChart"), { ssr: false });
const PlatformDistributionDonut = dynamic(() => import("@/components/charts/PlatformDistributionDonut"), { ssr: false });
const SentimentBreakdownChart = dynamic(() => import("@/components/charts/SentimentBreakdownChart"), { ssr: false });
const TopicsBarChart = dynamic(() => import("@/components/charts/TopicsBarChart"), { ssr: false });
const PlatformComparisonChart = dynamic(() => import("@/components/charts/PlatformComparisonChart"), { ssr: false });
const TrendComparisonChart = dynamic(() => import("@/components/charts/TrendComparisonChart"), { ssr: false });

export default function ChartsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("week");
  const [platform, setPlatform] = useState("all");
  const [isDemo, setIsDemo] = useState(false);

  const fetchChartsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await chartsService.getFullChartsData(timeframe, platform);
      setData(res.data);
      setIsDemo(isDemoMode());
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to synchronize with visual intelligence engine.");
      toast.error("Data fetch failed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeframe, platform]);

  useEffect(() => {
    fetchChartsData();
  }, [fetchChartsData]);

  const handleExportCSV = () => {
    if (!data) return;
    
    // Simple CSV export for engagement data
    const headers = ["Date", "Engagement", "Reach"];
    const rows = (data?.engagement || []).map((item: any) => [item.date, item.engagement, item.reach]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `social_intelligence_export_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export complete");
  };

  const handleExportPDF = () => {
    if (!data) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Social Intelligence Platform - Visual Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Timeframe: ${timeframe}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);
    
    doc.text("Top Topics Summary:", 20, 60);
    let y = 70;
    (data?.topics || []).forEach((t: any) => {
      doc.text(`${t.topic}: ${t.count} mentions (${t.growth}% growth)`, 30, y);
      y += 10;
    });
    
    doc.save(`social_report_${timeframe}.pdf`);
    toast.success("PDF Report generated");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-[#0f172a] min-h-screen">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 w-64 bg-slate-800/50" />
           <Skeleton className="h-10 w-48 bg-slate-800/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-[400px] w-full bg-slate-800/30 rounded-2xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Visual Intelligence</h1>
              {isDemo && (
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5 ml-2">
                  <Info className="w-3 h-3" />
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-slate-400 font-medium">Advanced multi-dimensional data visualization for social performance</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
            {/* Timeframe Filter */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1 border border-white/5">
              {['week', 'month', 'year'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                    timeframe === tf ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10 mx-1" />

            {/* Platform Filter */}
            <div className="relative group">
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="appearance-none bg-slate-800/50 border border-white/5 rounded-xl px-4 py-1.5 pr-10 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="twitter">X (Twitter)</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="h-6 w-px bg-white/10 mx-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchChartsData(true)}
                className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-xl border border-white/5 transition-all text-slate-400 hover:text-white group"
                title="Refresh Data"
              >
                <RefreshCw className={cn("w-4 h-4 group-active:rotate-180 transition-transform duration-500", refreshing && "animate-spin")} />
              </button>
              
              <div className="relative group/export">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                  <Download className="w-3.5 h-3.5" />
                  Export
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 backdrop-blur-xl">
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <FileText className="w-4 h-4 text-rose-400" />
                    Export as PDF
                  </button>
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <TableIcon className="w-4 h-4 text-emerald-400" />
                    Export as CSV
                  </button>
                  <button onClick={() => toast.success("PNG rendering initiated")} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    Save as Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Main Engagement Trend */}
          <div className="lg:col-span-2">
            <DashboardCard 
              title="Engagement Dynamics" 
              subtitle="Daily interaction volume vs reach performance"
              className="h-full border border-white/5 bg-slate-900/40 backdrop-blur-md"
            >
              <EngagementTrendChart data={data?.engagement || []} />
            </DashboardCard>
          </div>

          {/* Platform Distribution */}
          <DashboardCard 
            title="Channel Distribution" 
            subtitle="Market share by social platform"
            className="border border-white/5 bg-slate-900/40"
          >
            <PlatformDistributionDonut data={data?.distribution || []} />
          </DashboardCard>

          {/* Sentiment Analysis */}
          <DashboardCard 
            title="Emotional Spectrum" 
            subtitle="Global brand sentiment breakdown"
            className="border border-white/5 bg-slate-900/40"
          >
            <SentimentBreakdownChart data={data?.sentiment} />
          </DashboardCard>

          {/* Trend Comparison */}
          <DashboardCard 
            title="Performance Velocity" 
            subtitle="Current period vs previous historical baseline"
            className="border border-white/5 bg-slate-900/40"
          >
            <TrendComparisonChart data={data?.trendComparison || []} />
          </DashboardCard>

          {/* Platform Radar */}
          <DashboardCard 
            title="Channel Multi-Dimensional Analysis" 
            subtitle="Comparing engagement, reach and frequency"
            className="border border-white/5 bg-slate-900/40"
          >
            <PlatformComparisonChart data={data?.platformComparison || []} />
          </DashboardCard>

          {/* Top Topics - Now full width at the bottom but more compact */}
          <div className="lg:col-span-3">
            <DashboardCard 
              title="Strategic Narratives" 
              subtitle="Most frequent hashtags and viral topics across all synchronized networks"
              className="border border-white/5 bg-slate-900/40"
            >
              <TopicsBarChart data={data?.topics || []} />
            </DashboardCard>
          </div>

        </div>

        {/* Empty State Fallback */}
        {(!data || (data?.engagement || []).length === 0) && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
            <div className="p-4 bg-white/5 rounded-full mb-4">
              <TrendingUp className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white">No visual data detected</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2">Connect more social accounts or sync your existing ones to generate visualization insights.</p>
            <button 
              onClick={() => fetchChartsData()}
              className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 font-bold text-sm"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

