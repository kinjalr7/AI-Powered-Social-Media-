import { Sparkles, ArrowUpRight, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

const insights = [
  {
    title: "Peak Engagement Window",
    description: "Your Twitter engagement peaks between 6:00 PM and 8:00 PM EST. Schedule high-impact posts for this window.",
    impact: "+24%",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Topic Opportunity",
    description: "Conversations around 'Edge Security' are rising. You have a 78% sentiment score here; consider a technical deep-dive.",
    impact: "High",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Network Expansion",
    description: "LinkedIn shares are up 12% among CTO-level profiles. Target 'Enterprise Solutions' keywords to maintain momentum.",
    impact: "Strategic",
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }
];

export default function AIInsights() {
  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${insight.bg} ${insight.color} shrink-0`}>
              <insight.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-foreground truncate">{insight.title}</h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${insight.bg} ${insight.color} border border-current/20`}>
                  {insight.impact}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {insight.description}
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </div>
        </motion.div>
      ))}
      
      <button className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-2 mt-2">
        <Sparkles className="w-4 h-4" />
        Generate New Insights
      </button>
    </div>
  );
}
