'use client';

import { useEffect, useState } from "react";
import { Settings, User, Bell, Lock, Globe, Zap, RefreshCw, Save } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { authService } from "@/services/api";
import { cn } from "@/lib/utils";

const sections = [
  { name: 'General', icon: Settings, desc: 'Global application settings and preferences' },
  { name: 'Profile', icon: User, desc: 'Manage your account details and public profile' },
  { name: 'Notifications', icon: Bell, desc: 'Configure how and when you receive alerts' },
  { name: 'Security', icon: Lock, desc: 'Update passwords and security settings' },
  { name: 'Integrations', icon: Zap, desc: 'Manage third-party API keys and services' },
  { name: 'Regional', icon: Globe, desc: 'Timezone, language, and currency settings' },
];

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('General');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getMe();
        setUser(res.data);
      } catch (err: any) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-6 h-6 text-indigo-500" />
              App Settings
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Configure your dashboard experience and account settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-2">
            {sections.map((s) => (
              <button 
                key={s.name} 
                onClick={() => setActiveSection(s.name)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border font-bold text-sm",
                  activeSection === s.name 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.name}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-6">
            <DashboardCard title="Account Information" subtitle="Your primary profile details and identifiers">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user ? user.email.split('@')[0] : "Loading..."}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user ? user.email : "Loading..."}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Role</label>
                  <div className="relative">
                    <select className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer">
                      <option>Senior Analyst</option>
                      <option>Admin</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Company</label>
                  <input 
                    type="text" 
                    defaultValue="AIGravity Systems"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="mt-10 flex justify-end">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-3">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </DashboardCard>

            <DashboardCard title="Display Preferences" subtitle="Customize the visual experience of your dashboard">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors">
                  <div>
                    <p className="text-sm text-white font-bold">Dark Mode</p>
                    <p className="text-xs text-slate-500 font-medium">Always use dark theme across the application</p>
                  </div>
                  <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors">
                  <div>
                    <p className="text-sm text-white font-bold">High Contrast Charts</p>
                    <p className="text-xs text-slate-500 font-medium">Optimize chart colors for better visibility</p>
                  </div>
                  <div className="w-11 h-6 bg-slate-700 rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full shadow-md" />
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
}
