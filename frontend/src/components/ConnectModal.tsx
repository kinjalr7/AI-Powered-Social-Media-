'use client';

import { useState } from 'react';
import { X as CloseIcon, Briefcase, X, ExternalLink, Loader2 } from 'lucide-react';
import axios from '@/utils/axios';
import toast from 'react-hot-toast';

export default function ConnectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (platform: 'linkedin' | 'twitter') => {
    setIsConnecting(platform);
    try {
      // Mocking the connect call to the backend
      const res = await axios.post(`/companies/1/connect/${platform}`, {
        credentials: { mock: "token" }
      });
      toast.success(`Successfully connected to ${platform}!`);
      onClose();
    } catch (error) {
      toast.error(`Failed to connect to ${platform}.`);
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative glass w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors">
          <CloseIcon className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Connect Channels</h2>
        <p className="text-slate-400 text-sm mb-8">Integrate your professional accounts to start analyzing sentiment and engagement.</p>

        <div className="space-y-4">
          <button 
            onClick={() => handleConnect('linkedin')}
            disabled={!!isConnecting}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0077b5] rounded-xl flex items-center justify-center shadow-lg shadow-[#0077b5]/40">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">LinkedIn</p>
                <p className="text-xs text-[#0077b5]">Professional Network</p>
              </div>
            </div>
            {isConnecting === 'linkedin' ? <Loader2 className="w-5 h-5 animate-spin text-[#0077b5]" /> : <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />}
          </button>

          <button 
            onClick={() => handleConnect('twitter')}
            disabled={!!isConnecting}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <X className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">X / Twitter</p>
                <p className="text-xs text-slate-500">Real-time Signals</p>
              </div>
            </div>
            {isConnecting === 'twitter' ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />}
          </button>
        </div>

        <p className="mt-8 text-[10px] text-center text-slate-600 uppercase tracking-widest">
          Secure OAuth 2.0 Encryption Active
        </p>
      </div>
    </div>
  );
}
