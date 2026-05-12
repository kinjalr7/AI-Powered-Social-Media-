import { Briefcase, X, MessageSquare, Heart, Share2 } from "lucide-react";

export interface Post {
  id: string;
  platform: 'linkedin' | 'twitter';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  likes: number;
  comments: number;
  timestamp: string;
}

export default function PostRow({ post }: { post: Post }) {
  const SentimentBadge = ({ type }: { type: Post['sentiment'] }) => {
    const styles = {
      positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      negative: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${styles[type]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="group border-b border-white/5 py-4 last:border-0 hover:bg-white/5 transition-colors px-4 -mx-4 rounded-lg">
      <div className="flex items-start gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          post.platform === 'linkedin' ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-300'
        }`}>
          {post.platform === 'linkedin' ? <Briefcase className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <SentimentBadge type={post.sentiment} />
            <span className="text-[10px] text-slate-500">{post.timestamp}</span>
          </div>
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
            {post.content}
          </p>
          
          <div className="flex items-center gap-4 mt-3 text-slate-500">
            <div className="flex items-center gap-1.5 text-xs">
              <Heart className="w-3.5 h-3.5" />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post.comments}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
