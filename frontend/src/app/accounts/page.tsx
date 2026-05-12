"use client";

import { useState } from "react";
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  CheckCircle2, 
  AlertCircle,
  Link2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const platforms = [
  { 
    id: "twitter", 
    name: "X TERMINAL", 
    icon: Twitter, 
    color: "#06B6D4", 
    description: "Monitor real-time pulse and engagement trends across the X network."
  },
  { 
    id: "linkedin", 
    name: "LINKEDIN SYNC", 
    icon: Linkedin, 
    color: "#8B5CF6", 
    description: "Access B2B neural networks and professional relationship data."
  },
  { 
    id: "instagram", 
    name: "INSTA MATRIX", 
    icon: Instagram, 
    color: "#EC4899", 
    description: "Visual transmission analysis and audience resonance metrics."
  },
];

export default function AccountsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate neural handshake
      await api.post(`/connect/${platform}`, { sync: true });
      setConnected(prev => [...prev, platform]);
      toast.success(`${platform.toUpperCase()} SYNC COMPLETE`);
    } catch (error) {
      toast.error(`HANDSHAKE FAILED: ${platform.toUpperCase()}`);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1400px] mx-auto">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Neural Handshake</span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase">Sync Accounts</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm leading-relaxed">
          Authorize external data streams to augment your intelligence matrix. Encrypted protocols ensure 100% data integrity during transmission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-8">
        {platforms.map((platform, i) => {
          const Icon = platform.icon;
          const isConnected = connected.includes(platform.id);
          const isConnecting = connecting === platform.id;

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 flex flex-col items-center text-center group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              
              <motion.div 
                animate={isConnected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 relative"
                style={{ 
                  backgroundColor: `${platform.color}15`, 
                  border: `2px solid ${platform.color}30`,
                  boxShadow: isConnected ? `0 0 40px ${platform.color}40` : 'none'
                }}
              >
                <Icon className="w-12 h-12" style={{ color: platform.color }} />
                {isConnected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
              
              <h3 className="text-3xl font-black mb-4 tracking-tight">{platform.name}</h3>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed mb-10">
                {platform.description}
              </p>

              <button
                disabled={isConnected || isConnecting}
                onClick={() => handleConnect(platform.id)}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group/btn",
                  isConnected 
                    ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                    : "bg-white/5 border border-white/10 hover:border-accent/50 text-white shadow-lg"
                )}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isConnecting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isConnected ? (
                    <>
                      <Zap className="w-5 h-5" />
                      SYSTEM SYNCED
                    </>
                  ) : (
                    <>
                      <Link2 className="w-5 h-5 group-hover/btn:rotate-45 transition-transform" />
                      AUTHORIZE STREAM
                    </>
                  )}
                </div>
              </button>

              <div className="mt-8 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" />
                  API DOCS
                </button>
                <div className="w-1 h-1 bg-white/10 rounded-full" />
                <button className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest">
                  REVOKE ACCESS
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-8 border-secondary/20 bg-secondary/5 flex flex-col md:flex-row items-center gap-8 mt-20"
      >
        <div className="p-4 rounded-2xl bg-secondary/20 text-secondary shadow-neon-pink">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h4 className="font-black text-xl uppercase tracking-tight">Enterprise Protocol Sync Required</h4>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
            Custom OAuth gateways detected. Coordinate with your Infrastructure Admin to provision environment variables for production clusters.
          </p>
        </div>
        <button className="btn-synth whitespace-nowrap bg-gradient-to-r from-secondary to-primary shadow-neon-pink">
          ADMIN DASHBOARD
        </button>
      </motion.div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
