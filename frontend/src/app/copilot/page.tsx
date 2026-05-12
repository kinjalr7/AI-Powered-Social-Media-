"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Paperclip,
  Trash2,
  Maximize2,
  Zap,
  Terminal as TerminalIcon,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Neural link established. GGravity Copilot v4.2 online. Accessing real-time social intelligence matrix... How can I assist with your data synthesis today?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/copilot/query", { query: input });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || "Synthesis complete. Engagement trends indicate a 15% surge in B2B resonance within the LinkedIn cluster. Recommend increasing visual transmission frequency.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "TRANSMISSION ERROR: Failed to synchronize with intelligence cluster. Please verify backend uplink.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-neon-purple relative group">
            <Bot className="w-9 h-9" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full border-4 border-background flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">AI Copilot</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-neon-cyan" />
              <p className="text-[10px] font-black text-accent uppercase tracking-widest">
                Uplink: Synchronized (Llama-3-70B)
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-secondary hover:border-secondary/30 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col mb-8 border-white/5 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-all",
                  m.role === 'assistant' 
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-neon-purple' 
                    : 'bg-secondary/20 text-secondary border border-secondary/30 shadow-neon-pink'
                )}>
                  {m.role === 'assistant' ? <Cpu className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className={cn(
                  "max-w-[75%] p-6 rounded-3xl relative",
                  m.role === 'assistant' 
                    ? 'bg-white/5 border border-white/10 text-gray-200' 
                    : 'bg-gradient-to-br from-primary to-secondary text-white shadow-neon-purple'
                )}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  <div className="mt-4 flex items-center justify-between opacity-40">
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {m.role === 'assistant' ? 'Copilot Response' : 'User Transmission'}
                    </span>
                    <span className="text-[9px] font-bold">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 shadow-neon-purple">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="flex gap-1.5">
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-primary rounded-full" />
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-secondary rounded-full" />
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-accent rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-white/10 bg-white/[0.02] backdrop-blur-3xl">
          <div className="flex gap-6 items-end">
            <button type="button" className="p-4 text-gray-500 hover:text-white transition-colors">
              <Paperclip className="w-7 h-7" />
            </button>
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-[2rem] blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Query the matrix (e.g. 'Synthesize engagement drift in the X cluster')..."
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 px-8 pr-16 outline-none focus:border-accent/50 focus:bg-white/10 transition-all resize-none max-h-40 text-lg relative z-10 font-medium"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 p-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-neon-purple disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-all z-20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 justify-center">
            <TerminalIcon className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-[9px] text-gray-600 uppercase tracking-[0.3em] font-black">
              Neural Processing Active · GGravity-Llama-70B-Turbo
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
