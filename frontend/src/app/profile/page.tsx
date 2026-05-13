'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Activity, 
  Award, 
  ExternalLink, 
  Edit3, 
  Loader2,
  Lock,
  Zap,
  Globe,
  Briefcase,
  AlertCircle,
  Settings
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { authService } from "@/services/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getMe();
        setProfile(res.data);
      } catch (err: any) {
        console.error("Failed to load profile", err);
        setError("Unable to fetch neural profile data. Interface sync failed.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs">Syncing Neural Profile...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center text-slate-400">
        <Lock className="w-12 h-12 text-destructive mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs mb-6">Unauthorized Access: Protocol Violation</p>
        <Link href="/login" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase text-xs tracking-widest">
          Authenticate
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center text-slate-400">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-black uppercase text-xs tracking-widest">
          Retry Handshake
        </button>
      </div>
    );
  }

  const userSettings = profile?.settings || {};
  const userName = userSettings.full_name || (session?.user as any)?.name || session?.user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20">
      {/* Profile Cover/Header */}
      <div className="h-48 bg-gradient-to-r from-indigo-900/50 via-slate-900 to-teal-900/30 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-[1200px] mx-auto px-6 h-full relative">
          <div className="absolute -bottom-16 left-6 flex flex-col md:flex-row items-end gap-6">
            <div className="w-32 h-32 rounded-3xl bg-slate-800 border-4 border-[#0f172a] shadow-2xl flex items-center justify-center overflow-hidden relative group">
              <User className="w-16 h-16 text-slate-600 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pb-2 space-y-1">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{userName}</h1>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-md">
                  {userSettings.role || 'System Admin'}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <Activity className="w-3 h-3 text-teal-500" />
                  Active Session
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-6 hidden md:flex items-center gap-3">
            <Link href="/settings" className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardCard title="Intelligence Profile" subtitle="Primary identification and access metrics">
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Identifier</p>
                  <p className="text-sm font-bold text-white truncate">{session?.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization Unit</p>
                  <p className="text-sm font-bold text-white truncate">{userSettings.company || 'AIGravity Systems'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Regional Zone</p>
                  <p className="text-sm font-bold text-white truncate">{userSettings.timezone || 'UTC'} ({userSettings.locale || 'en-US'})</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Protocol</p>
                  <p className="text-sm font-bold text-white truncate">OAuth2 / JWT Secured</p>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="System Activity" subtitle="Real-time session diagnostics">
             <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last Access</span>
                  <span className="text-xs font-bold text-slate-300">Today, 14:22</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Login Frequency</span>
                  <span className="text-xs font-bold text-teal-400">High Reliability</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">IP Address</span>
                  <span className="text-xs font-bold text-slate-300">192.168.1.104</span>
                </div>
             </div>
          </DashboardCard>
        </div>

        {/* Right Column - Stats and Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-xl shadow-indigo-500/10 border border-indigo-400/20 group relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Zap className="w-32 h-32 text-white" />
               </div>
               <div className="relative z-10">
                 <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-2">Reports Generated</p>
                 <h2 className="text-4xl font-black text-white tracking-tighter">124</h2>
                 <p className="text-xs font-medium text-indigo-200 mt-2 flex items-center gap-1">
                   <Activity className="w-3 h-3" />
                   +12 this week
                 </p>
               </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-teal-600 to-teal-800 shadow-xl shadow-teal-500/10 border border-teal-400/20 group relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Award className="w-32 h-32 text-white" />
               </div>
               <div className="relative z-10">
                 <p className="text-[10px] font-black text-teal-100 uppercase tracking-[0.2em] mb-2">Data Sync Points</p>
                 <h2 className="text-4xl font-black text-white tracking-tighter">8.4K</h2>
                 <p className="text-xs font-medium text-teal-200 mt-2 flex items-center gap-1">
                   <Activity className="w-3 h-3" />
                   Real-time latency: 42ms
                 </p>
               </div>
            </div>
          </div>

          <DashboardCard title="Linked Intelligence Streams" subtitle="Authorized external data sources connected to this profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((p) => {
                const isActive = (userSettings.connected_accounts_prefs || {})[p.toLowerCase()] !== false;
                return (
                  <div key={p} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                        isActive ? "bg-teal-500/10 text-teal-400" : "bg-slate-700/30 text-slate-600"
                      )}>
                        {p[0]}
                      </div>
                      <span className={cn("text-sm font-bold", isActive ? "text-white" : "text-slate-500")}>{p} Network</span>
                    </div>
                    {isActive ? (
                       <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>
                    ) : (
                       <ExternalLink className="w-3 h-3 text-slate-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard title="Security Protocols" subtitle="Profile safety and session management">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-center gap-4">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">Two-Factor Authentication</p>
                    <p className="text-[10px] text-indigo-300/60 font-bold uppercase tracking-widest">Enhanced biometric verification required</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-all">
                  ACTIVATE
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-tight">Login History Audit</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Review all authorized device handshakes</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">
                  VIEW LOGS
                </button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
