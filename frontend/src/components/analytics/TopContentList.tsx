'use client';

import { Twitter, Linkedin, Facebook, Instagram, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: number;
  content: string;
  platform: string;
  engagement: number;
  sentiment: string;
  date: string;
}

export default function TopContentList({ data }: { data: ContentItem[] }) {
  if (!data || data.length === 0) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />;
      case 'linkedin': return <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />;
      case 'facebook': return <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />;
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />;
      default: return <TrendingUp className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div 
          key={item.id} 
          className="group p-4 bg-slate-800/20 hover:bg-slate-800/40 rounded-xl border border-white/5 hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900 rounded-lg border border-white/5">
                {getPlatformIcon(item.platform)}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.platform}</span>
            </div>
            <div className="text-[10px] font-medium text-slate-600">{item.date}</div>
          </div>
          
          <p className="text-sm text-slate-300 line-clamp-2 mb-4 font-medium leading-relaxed group-hover:text-white transition-colors">
            {item.content}
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-white">{item.engagement.toLocaleString()}</span>
            </div>
            <div className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
              item.sentiment === 'Positive' ? "bg-emerald-500/10 text-emerald-400" : 
              item.sentiment === 'Negative' ? "bg-red-500/10 text-red-400" : "bg-slate-500/10 text-slate-400"
            )}>
              {item.sentiment}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
