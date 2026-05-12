'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import axios from '@/utils/axios';
import toast from 'react-hot-toast';

export default function CopilotChat() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await axios.post('/copilot', { query });
      toast.success("Copilot analysis complete!");
      // Handle response...
      setQuery('');
    } catch (error) {
      toast.error("Failed to reach Copilot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI Copilot</h3>
      </div>
      
      <div className="relative group">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me to analyze trends, suggest posts, or check sentiment..."
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] resize-none transition-all"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !query.trim()}
          className="absolute bottom-4 right-4 p-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-700 rounded-lg text-white transition-all shadow-lg shadow-primary/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="flex gap-2">
        {['Analyze recent posts', 'Hiring sentiment', 'Content ideas'].map((suggestion) => (
          <button 
            key={suggestion}
            onClick={() => setQuery(suggestion)}
            className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded-full border border-white/5 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
