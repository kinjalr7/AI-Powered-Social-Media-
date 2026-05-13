'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Share2, Plus, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Globe, 
  Instagram, Twitter, Linkedin, Facebook, MessageCircle, MoreVertical, 
  Trash2, ExternalLink, Zap, Info, X, Loader2, Filter, Calendar, Search,
  ArrowUpRight, ArrowDownRight, Activity, TrendingUp, Heart, MessageSquare
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { socialService, companyService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { isDemoMode } from "@/lib/seedData";
import dynamic from 'next/dynamic';

// Dynamic imports for heavy sections/components
const DashboardCard = dynamic(() => import("@/components/dashboard/DashboardCard"), { ssr: false });
const Table = dynamic(() => import("@/components/ui/table").then(mod => mod.Table), { ssr: false });
const TableBody = dynamic(() => import("@/components/ui/table").then(mod => mod.TableBody), { ssr: false });
const TableCell = dynamic(() => import("@/components/ui/table").then(mod => mod.TableCell), { ssr: false });
const TableHead = dynamic(() => import("@/components/ui/table").then(mod => mod.TableHead), { ssr: false });
const TableHeader = dynamic(() => import("@/components/ui/table").then(mod => mod.TableHeader), { ssr: false });
const TableRow = dynamic(() => import("@/components/ui/table").then(mod => mod.TableRow), { ssr: false });

interface SocialAccount {
  id: number;
  platform: string;
  company_id: number;
  company_name: string;
  status: string;
  account: string;
  posts: number;
  lastSync: string;
  icon: string;
  handle?: string;
  followers?: string;
  engagement_rate?: string;
}

interface SocialPost {
  id: number;
  platform: string;
  content: string;
  likes: number;
  sentiment: string;
  created_at: string;
}

interface SyncLog {
  id: number;
  platform: string;
  status: string;
  message: string;
  timestamp: string;
}

interface EngagementSummary {
  total_engagement: number;
  engagement_trend: number;
  avg_reach: number;
  reach_trend: number;
  sentiment_score: number;
  sentiment_trend: number;
  total_posts: number;
  posts_trend: number;
}

interface PlatformPerformance {
  platform: string;
  reach: number;
  engagement: number;
  posts: number;
  status: string;
  color: string;
}

export default function SocialDataPage() {
  const [platforms, setPlatforms] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncLog[]>([]);
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [performance, setPerformance] = useState<PlatformPerformance[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  
  // Filters
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<number>>(new Set());

  const getPlatformIcon = (platform: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-5 h-5" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-5 h-5" />;
    if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
    return <Globe className="w-5 h-5" />;
  };

  const getPlatformColor = (platform: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('instagram')) return "text-pink-500 bg-pink-500/10 border-pink-500/20";
    if (p.includes('twitter') || p.includes('x')) return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    if (p.includes('linkedin')) return "text-blue-600 bg-blue-600/10 border-blue-600/20";
    if (p.includes('facebook')) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setIsDemo(isDemoMode());
      
      const res = await socialService.getFullSocialData();
      const fullData = res.data;
      
      setPlatforms(fullData.accounts);
      setCompanies(fullData.companies);
      setPosts(fullData.posts);
      setSyncHistory(fullData.sync_history);
      setSummary(fullData.summary);
      setPerformance(fullData.performance);
      
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load social intelligence data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async (id: number) => {
    setSyncingIds(prev => new Set(prev).add(id));
    try {
      await socialService.syncAccount(id);
      toast.success("Intelligence sync completed");
      await fetchData();
    } catch (err) {
      toast.error("Sync failed. Check network connection.");
    } finally {
      setSyncingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDisconnect = async (id: number) => {
    if (!confirm("Are you sure you want to disconnect this platform? You will lose access to real-time analytics for this account.")) return;
    
    try {
      await socialService.disconnectAccount(id);
      toast.success("Platform disconnected successfully");
      await fetchData();
    } catch (err) {
      toast.error("Failed to disconnect platform");
    }
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !selectedCompanyId) {
      toast.error("Please select both a platform and a company");
      return;
    }

    setConnecting(true);
    try {
      // In a real app, this would redirect to OAuth. Here we mock a success after a delay.
      await new Promise(resolve => setTimeout(resolve, 1500));
      await socialService.connectPlatform(selectedCompanyId, selectedPlatform, "mock_token_" + Date.now());
      
      toast.success(`${selectedPlatform} successfully integrated!`);
      setIsConnectModalOpen(false);
      setSelectedPlatform(null);
      setSelectedCompanyId(null);
      fetchData();
    } catch (err) {
      toast.error("Integration failed. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const platform = post.platform || "";
      const content = post.content || "";
      const matchesPlatform = platformFilter === "all" || platform.toLowerCase() === platformFilter.toLowerCase();
      const matchesSearch = content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [posts, platformFilter, searchQuery]);

  const filteredHistory = useMemo(() => {
    return syncHistory.filter(log => {
      const platform = log.platform || "";
      const status = log.status || "";
      const matchesPlatform = platformFilter === "all" || platform.toLowerCase() === platformFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
      return matchesPlatform && matchesStatus;
    });
  }, [syncHistory, platformFilter, statusFilter]);

  if (loading && platforms.length === 0) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-10 w-48 bg-white/5 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-44 w-full bg-white/5 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-slate-200">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Share2 className="w-8 h-8 text-primary" />
                Social Infrastructure
              </h1>
              {isDemo && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Demo Mode
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Orchestrate your cross-platform data pipelines and connection status
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <button 
              onClick={fetchData}
              className="p-3 bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white group"
              title="Refresh intelligence"
            >
              <RefreshCw className={cn("w-5 h-5 transition-transform duration-500 group-hover:rotate-180", loading && "animate-spin")} />
            </button>
            <button 
              onClick={() => setIsConnectModalOpen(true)}
              className="purple-gradient-btn flex items-center gap-2 py-3 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Integrate Platform
            </button>
          </motion.div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Engagement" 
              value={summary.total_engagement.toLocaleString()} 
              trend={summary.engagement_trend} 
              icon={<Zap className="w-5 h-5" />} 
              color="text-primary"
            />
            <StatCard 
              title="Average Reach" 
              value={summary.avg_reach.toLocaleString()} 
              trend={summary.reach_trend} 
              icon={<TrendingUp className="w-5 h-5" />} 
              color="text-teal-400"
            />
            <StatCard 
              title="Sentiment Score" 
              value={`${summary.sentiment_score}%`} 
              trend={summary.sentiment_trend} 
              icon={<Activity className="w-5 h-5" />} 
              color="text-indigo-400"
            />
            <StatCard 
              title="Total Posts" 
              value={summary.total_posts.toString()} 
              trend={summary.posts_trend} 
              icon={<MessageCircle className="w-5 h-5" />} 
              color="text-blue-400"
            />
          </div>
        )}

        {/* Platforms Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Connected Pipelines
            </h2>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {platforms.length} Active Feeds
            </div>
          </div>
          
          {platforms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 glass-card border-dashed">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">No Intelligence Feeds Connected</h2>
                <p className="text-slate-400 max-w-md mx-auto">Connect your social media infrastructure to start ingesting real-time engagement data and AI-powered insights.</p>
              </div>
              <button 
                onClick={() => setIsConnectModalOpen(true)}
                className="purple-gradient-btn"
              >
                Start First Integration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {platforms.map((p) => (
                  <motion.div 
                    layout
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card p-6 flex flex-col group relative overflow-hidden bg-slate-900/40 hover:bg-slate-900/60 transition-all border-white/5 hover:border-primary/20"
                  >
                    {/* Syncing Overlay */}
                    {syncingIds.has(p.id) && (
                      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Synchronizing</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                        getPlatformColor(p.platform)
                      )}>
                        {getPlatformIcon(p.platform)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          (p.status || '').toLowerCase() === 'active' || (p.status || '').toLowerCase() === 'connected'
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {p.status}
                        </div>
                        <div className="relative group/menu">
                          <button className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
                            <button 
                              onClick={() => handleSync(p.id)}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Manual Sync
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Details
                            </button>
                            <button 
                              onClick={() => handleDisconnect(p.id)}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-white/5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Disconnect
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
                      </h3>
                      <p className="text-sm font-medium text-slate-400">{p.account}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] border-white/10 text-slate-500 font-bold uppercase py-0 px-2">
                          {p.company_name}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Followers</p>
                        <p className="text-lg font-black text-white tracking-tight">{p.followers || '84.2K'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eng. Rate</p>
                        <p className="text-lg font-black text-primary tracking-tight">{p.engagement_rate || '4.2%'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                          p.status.toLowerCase() === 'active' || p.status.toLowerCase() === 'connected' ? "bg-teal-500 animate-pulse" : "bg-slate-600"
                        )} />
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Last sync: {p.lastSync}</p>
                      </div>
                      <button 
                        onClick={() => handleSync(p.id)}
                        className="p-2 bg-slate-800 hover:bg-primary/20 text-slate-400 hover:text-primary border border-white/5 rounded-lg transition-all"
                        title="Sync intelligence"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", syncingIds.has(p.id) && "animate-spin")} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Data Tabs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <DashboardCard 
              title="Intelligence Feed" 
              subtitle="Real-time stream of cross-platform social interactions"
              className="h-full"
            >
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search posts..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <select 
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-xl py-2 px-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                    >
                      <option value="all">All Platforms</option>
                      <option value="twitter">X (Twitter)</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Filter className="w-3.5 h-3.5" />
                    Showing {filteredPosts.length} results
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Platform</TableHead>
                        <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Content</TableHead>
                        <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Sentiment</TableHead>
                        <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Engagement</TableHead>
                        <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-40 text-center text-slate-500 font-medium">
                            No posts found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPosts.map((post) => (
                          <TableRow key={post.id} className="hover:bg-white/[0.02] border-white/5 transition-colors group">
                            <TableCell>
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                getPlatformColor(post.platform)
                              )}>
                                {getPlatformIcon(post.platform)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                                {post.content}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                                (post.sentiment || '').toLowerCase() === 'positive' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                                (post.sentiment || '').toLowerCase() === 'negative' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              )}>
                                {post.sentiment}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Heart className="w-3 h-3 text-rose-500/60" />
                                  <span className="text-xs font-bold">{post.likes}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <MessageSquare className="w-3 h-3 text-blue-500/60" />
                                  <span className="text-xs font-bold">{Math.floor(post.likes * 0.15)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">
                                {post.created_at?.includes('T') ? new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (post.created_at || '--:--')}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Sync History - 1/3 */}
          <div className="space-y-6">
            <DashboardCard 
              title="Pipeline Log" 
              subtitle="System-level audit of automated data ingestions"
              className="h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 mb-4">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="info">Info</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredHistory.map((log, i) => (
                    <div key={i} className="flex flex-col p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:bg-slate-900/60 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                            log.status === 'success' ? "bg-teal-500/10 text-teal-400" : 
                            log.status === 'failed' ? "bg-rose-500/10 text-rose-400" :
                            "bg-primary/10 text-primary"
                          )}>
                            {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
                             log.status === 'failed' ? <AlertCircle className="w-4 h-4" /> : 
                             <Info className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.platform}</p>
                            <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{log.message}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {(log.status || '').toUpperCase()}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Info Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-primary/20 bg-primary/[0.02] group hover:bg-primary/[0.05] transition-all">
            <Zap className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Real-time Webhooks</h4>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Our infrastructure uses enterprise webhooks to ensure your dashboard updates within 500ms of any social interaction.
            </p>
          </div>
          <div className="glass-card p-6 border-teal-500/20 bg-teal-500/[0.02] group hover:bg-teal-500/[0.05] transition-all">
            <CheckCircle2 className="w-8 h-8 text-teal-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Data Integrity</h4>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Every data point is cryptographically verified through our AI validator before entering your analytics pipeline.
            </p>
          </div>
          <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/[0.02] group hover:bg-indigo-500/[0.05] transition-all">
            <Smartphone className="w-8 h-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Quota Management</h4>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              We intelligently throttle requests to maintain 100% compliance with platform rate limits and API policies.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Modal */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="p-8 md:p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white tracking-tight">Platform Integration</h2>
                    <p className="text-sm text-slate-400 font-medium">Establish a new intelligence feed for your ecosystem</p>
                  </div>
                  <button 
                    onClick={() => setIsConnectModalOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Step 1: Platform */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Select Pipeline Source</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'twitter', icon: Twitter, name: 'X' },
                        { id: 'linkedin', icon: Linkedin, name: 'LinkedIn' },
                        { id: 'instagram', icon: Instagram, name: 'Instagram' },
                        { id: 'facebook', icon: Facebook, name: 'Facebook' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlatform(p.id)}
                          className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all duration-300",
                            selectedPlatform === p.id 
                              ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10" 
                              : "bg-slate-900 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                          )}
                        >
                          <p.icon className="w-6 h-6" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Company */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Target Business Unit</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {companies.length === 0 ? (
                        <div className="p-6 bg-slate-900 border border-white/5 border-dashed rounded-3xl text-center">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No business units found</p>
                          <button className="mt-3 text-xs text-primary font-black uppercase hover:underline">Create Unit</button>
                        </div>
                      ) : (
                        companies.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCompanyId(c.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                              selectedCompanyId === c.id
                                ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10"
                                : "bg-slate-900 border-white/5 text-slate-500 hover:border-white/10"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2.5 h-2.5 rounded-full border-2",
                                selectedCompanyId === c.id ? "bg-primary border-primary" : "border-slate-700"
                              )} />
                              <span className="text-sm font-bold">{c.name}</span>
                            </div>
                            {selectedCompanyId === c.id && <CheckCircle2 className="w-4 h-4 animate-in zoom-in" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button 
                    disabled={!selectedPlatform || !selectedCompanyId || connecting}
                    onClick={handleConnect}
                    className="w-full purple-gradient-btn flex items-center justify-center gap-3 py-4 rounded-2xl disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-primary/20"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Initializing Secure Handshake...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Authorize Integration
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <CheckCircle2 className="w-3 h-3 text-teal-500" />
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      Secure 256-bit encryption handshake
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: { title: string, value: string, trend: number, icon: any, color: string }) {
  const isPositive = trend >= 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 bg-slate-900/40 border-white/5 hover:border-white/10 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/5", color)}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
          isPositive ? "text-teal-400 bg-teal-400/10" : "text-rose-400 bg-rose-400/10"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-primary transition-colors">{value}</h3>
      </div>
    </motion.div>
  );
}
