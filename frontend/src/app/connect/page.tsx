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
  ExternalLink
} from "lucide-react";
import axios from "@/utils/auth/axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const platforms = [
  { 
    id: "twitter", 
    name: "X (Twitter)", 
    icon: Twitter, 
    color: "#1DA1F2", 
    description: "Monitor mentions, engagement, and sentiment on X."
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    icon: Linkedin, 
    color: "#0A66C2", 
    description: "Analyze professional network growth and B2B engagement."
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: Instagram, 
    color: "#E4405F", 
    description: "Track visual content performance and audience metrics."
  },
];

export default function ConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      // Mocking the connection flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      await axios.post(`/connect/${platform}`, { mock: true });
      setConnected(prev => [...prev, platform]);
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected!`);
    } catch (error) {
      toast.error(`Failed to connect to ${platform}`);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Connect Platforms</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Synchronize your social media accounts to start gathering intelligent insights and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {platforms.map((platform, i) => {
          const Icon = platform.icon;
          const isConnected = connected.includes(platform.id);
          const isConnecting = connecting === platform.id;

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 flex flex-col items-center text-center group"
            >
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${platform.color}15`, border: `1px solid ${platform.color}30` }}
              >
                <Icon className="w-10 h-10" style={{ color: platform.color }} />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{platform.name}</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                {platform.description}
              </p>

              <button
                disabled={isConnected || isConnecting}
                onClick={() => handleConnect(platform.id)}
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isConnected 
                    ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                }`}
              >
                {isConnecting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isConnected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Connected
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5" />
                    Connect Account
                  </>
                )}
              </button>

              {isConnected && (
                <button className="mt-4 text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  Manage API Access
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6 border-accent/20 bg-accent/5 flex flex-col md:flex-row items-center gap-6 mt-12">
        <div className="p-3 rounded-2xl bg-accent/20 text-accent">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-lg">OAuth Configuration Required</h4>
          <p className="text-sm text-gray-400">
            Some platforms require custom API credentials. Visit the settings page to configure your developer portal keys.
          </p>
        </div>
        <button className="btn-accent whitespace-nowrap">
          Go to Settings
        </button>
      </div>
    </div>
  );
}
