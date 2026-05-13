'use client';

import { useEffect, useState } from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Globe, 
  Zap, 
  Save, 
  Shield, 
  Mail, 
  Palette, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { settingsService } from "@/services/api";
import { cn } from "@/lib/utils";
import { 
  SettingSection, 
  ToggleRow, 
  SelectRow, 
  InputRow 
} from "@/components/settings/SettingsComponents";
import { isDemoMode } from "@/lib/seedData";

const sections = [
  { id: 'profile', name: 'Profile', icon: User, desc: 'Manage your personal information' },
  { id: 'notifications', name: 'Notifications', icon: Bell, desc: 'Configure alert preferences' },
  { id: 'display', name: 'Display & Theme', icon: Palette, desc: 'Customize visual appearance' },
  { id: 'regional', name: 'Regional & Time', icon: Globe, desc: 'Language and timezone settings' },
  { id: 'accounts', name: 'Connected Accounts', icon: Zap, desc: 'Manage social integrations' },
  { id: 'email', name: 'Email Reports', icon: Mail, desc: 'Configure automated reporting' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<any>({
    full_name: '',
    company: '',
    role: '',
    theme: 'dark',
    timezone: 'UTC',
    locale: 'en-US',
    notifications_enabled: true,
    email_reports_enabled: true,
    connected_accounts_prefs: {
      twitter: true,
      linkedin: true,
      facebook: false,
      instagram: false
    }
  });

  const [initialSettings, setInitialSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getSettings();
      setSettings(res.data);
      setInitialSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings", err);
      setMessage({ text: "Failed to load settings. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await settingsService.updateSettings(settings);
      setSettings(res.data);
      setInitialSettings(res.data);
      setMessage({ text: "Settings updated successfully!", type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update settings", err);
      setMessage({ text: "Failed to save settings. Please try again.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialSettings) {
      setSettings(initialSettings);
      setMessage({ text: "Settings reverted to last saved state", type: 'success' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="font-medium">Initializing secure settings module...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Settings className="w-6 h-6 text-indigo-500" />
                Settings & Preferences
              </h1>
              {isDemoMode() && (
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-400 mt-1">Configure your dashboard experience, notifications, and profile details</p>
          </div>

          <div className="flex items-center gap-3">
            {message && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2",
                message.type === 'success' ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              )}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all font-bold text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            {sections.map((s) => (
              <button 
                key={s.id} 
                onClick={() => setActiveTab(s.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all border font-bold text-sm text-left group",
                  activeTab === s.id 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <s.icon className={cn(
                  "w-5 h-5 transition-colors",
                  activeTab === s.id ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
                )} />
                <div className="flex flex-col">
                  <span>{s.name}</span>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors mt-0.5",
                    activeTab === s.id ? "text-indigo-100" : "text-slate-500"
                  )}>{s.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            <DashboardCard 
              title={sections.find(s => s.id === activeTab)?.name || ''} 
              subtitle={sections.find(s => s.id === activeTab)?.desc || ''}
            >
              <div className="mt-4">
                {activeTab === 'profile' && (
                  <SettingSection title="Personal Information" subtitle="Update your profile details and identifiers.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputRow 
                        label="Full Name" 
                        value={settings.full_name || ''} 
                        onChange={(val) => updateSetting('full_name', val)}
                        placeholder="John Doe"
                      />
                      <InputRow 
                        label="Job Title / Role" 
                        value={settings.role || ''} 
                        onChange={(val) => updateSetting('role', val)}
                        placeholder="Senior Analyst"
                      />
                      <InputRow 
                        label="Company Name" 
                        value={settings.company || ''} 
                        onChange={(val) => updateSetting('company', val)}
                        placeholder="Acme Corp"
                      />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Account Email</label>
                        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed">
                          User managed via authentication provider
                        </div>
                      </div>
                    </div>
                  </SettingSection>
                )}

                {activeTab === 'notifications' && (
                  <SettingSection title="Communication Preferences" subtitle="Manage how you receive alerts and system updates.">
                    <ToggleRow 
                      label="Browser Notifications" 
                      description="Receive real-time alerts for critical events and report completions."
                      enabled={settings.notifications_enabled}
                      onChange={(val) => updateSetting('notifications_enabled', val)}
                      icon={<Bell className="w-5 h-5" />}
                    />
                    <ToggleRow 
                      label="Email Alerts" 
                      description="Get occasional emails about account activity and security."
                      enabled={true} 
                      onChange={() => {}} 
                      icon={<Mail className="w-5 h-5" />}
                    />
                    <ToggleRow 
                      label="Security Notifications" 
                      description="Receive alerts for new logins and security settings changes."
                      enabled={true}
                      onChange={() => {}}
                      icon={<Shield className="w-5 h-5" />}
                    />
                  </SettingSection>
                )}

                {activeTab === 'display' && (
                  <SettingSection title="Interface Customization" subtitle="Adjust the visual settings of the platform.">
                    <SelectRow 
                      label="Visual Theme"
                      description="Select the color scheme for the dashboard interface."
                      value={settings.theme}
                      onChange={(val) => updateSetting('theme', val)}
                      icon={<Palette className="w-5 h-5" />}
                      options={[
                        { label: 'Deep Dark (Default)', value: 'dark' },
                        { label: 'Slate Blue', value: 'slate' },
                        { label: 'Light Mode', value: 'light' },
                        { label: 'System Default', value: 'system' }
                      ]}
                    />
                    <ToggleRow 
                      label="High Contrast Charts"
                      description="Use more distinct colors for better chart readability."
                      enabled={true}
                      onChange={() => {}}
                    />
                    <ToggleRow 
                      label="Compact View"
                      description="Reduce spacing to show more data on screen."
                      enabled={false}
                      onChange={() => {}}
                    />
                  </SettingSection>
                )}

                {activeTab === 'regional' && (
                  <SettingSection title="Localization" subtitle="Set your preferred timezone and language.">
                    <SelectRow 
                      label="Timezone"
                      description="Affects how timestamps are displayed in reports and charts."
                      value={settings.timezone}
                      onChange={(val) => updateSetting('timezone', val)}
                      icon={<Clock className="w-5 h-5" />}
                      options={[
                        { label: 'UTC (Greenwich Mean Time)', value: 'UTC' },
                        { label: 'PST (Pacific Standard Time)', value: 'UTC-8' },
                        { label: 'EST (Eastern Standard Time)', value: 'UTC-5' },
                        { label: 'GMT (London)', value: 'UTC+0' },
                        { label: 'CET (Paris)', value: 'UTC+1' },
                        { label: 'IST (India Standard Time)', value: 'UTC+5:30' },
                        { label: 'JST (Tokyo)', value: 'UTC+9' }
                      ]}
                    />
                    <SelectRow 
                      label="Preferred Language"
                      description="The language used throughout the application interface."
                      value={settings.locale}
                      onChange={(val) => updateSetting('locale', val)}
                      icon={<Globe className="w-5 h-5" />}
                      options={[
                        { label: 'English (US)', value: 'en-US' },
                        { label: 'English (UK)', value: 'en-GB' },
                        { label: 'Spanish', value: 'es' },
                        { label: 'French', value: 'fr' },
                        { label: 'German', value: 'de' }
                      ]}
                    />
                  </SettingSection>
                )}

                {activeTab === 'accounts' && (
                  <SettingSection title="Platform Integration" subtitle="Toggle which connected platforms are active for data sync.">
                    <div className="space-y-4">
                      {Object.keys(settings.connected_accounts_prefs || {}).map((platform) => (
                        <ToggleRow 
                          key={platform}
                          label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Integration`}
                          description={`Synchronize data and analytics from your ${platform} accounts.`}
                          enabled={settings.connected_accounts_prefs[platform]}
                          onChange={(val) => updateNestedSetting('connected_accounts_prefs', platform, val)}
                        />
                      ))}
                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mt-4">
                        <p className="text-sm text-indigo-300 font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          To connect new accounts, please visit the <a href="/connect" className="underline hover:text-white transition-colors">Connections</a> page.
                        </p>
                      </div>
                    </div>
                  </SettingSection>
                )}

                {activeTab === 'email' && (
                  <SettingSection title="Automated Reporting" subtitle="Configure automated intelligence reports sent to your inbox.">
                    <ToggleRow 
                      label="Weekly Intelligence Summary"
                      description="Receive a comprehensive PDF report of all platform activity every Monday."
                      enabled={settings.email_reports_enabled}
                      onChange={(val) => updateSetting('email_reports_enabled', val)}
                      icon={<Mail className="w-5 h-5" />}
                    />
                    <ToggleRow 
                      label="Monthly Strategic Audit"
                      description="Deep-dive analysis of long-term trends and competitor movements."
                      enabled={false}
                      onChange={() => {}}
                    />
                    <div className="mt-4">
                      <InputRow 
                        label="Recipient Email" 
                        value={settings.email || ''} 
                        onChange={() => {}} 
                        placeholder="Leave blank to use account email"
                      />
                    </div>
                  </SettingSection>
                )}
              </div>
            </DashboardCard>

            {/* Bottom Actions for Mobile */}
            <div className="lg:hidden flex flex-col gap-3 mt-6">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button 
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-slate-700 text-slate-400 font-bold"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
