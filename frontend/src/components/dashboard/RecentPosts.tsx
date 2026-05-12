'use client';

import { MessageSquare, Heart, Share2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface RecentPostsProps {
  data: any[];
}

export default function RecentPosts({ data }: RecentPostsProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {data.map((post, index) => (
        <motion.div 
          key={post.id} 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="p-4 rounded-2xl bg-muted/20 border border-border space-y-4 hover:bg-accent/50 transition-colors group cursor-default"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border",
                post.platform === 'Twitter' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 
                post.platform === 'Instagram' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 
                'bg-blue-600/10 text-blue-400 border-blue-600/20'
              )}>
                {post.platform}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{post.time}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          </div>
          
          <p className="text-sm font-medium text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground transition-colors">
            {post.content}
          </p>
          
          <div className="flex items-center gap-5 pt-1 border-t border-border mt-auto">
            <div className="flex items-center gap-1.5 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground hover:text-sky-400 transition-colors cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{post.comments}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-widest">Share</span>
            </div>
          </div>
        </motion.div>
      ))}
      <button 
        onClick={() => router.push('/social-data')}
        className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-all border-t border-border mt-4 hover:bg-muted/30"
      >
        View Complete Feed
      </button>
    </div>
  );
}

import { cn } from "@/lib/utils";

