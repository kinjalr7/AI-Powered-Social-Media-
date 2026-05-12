"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { 
  Building2, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Globe, 
  Users, 
  ArrowRight,
  Loader2,
  Trash2,
  Edit2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function CompaniesPage() {
  const { data: companies, mutate } = useSWR("/companies", fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", website: "", industry: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/companies", newCompany);
      toast.success("Node Initialized Successfully");
      setIsModalOpen(false);
      setNewCompany({ name: "", website: "", industry: "" });
      mutate();
    } catch (error) {
      toast.error("Initialization Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Terminate this node sequence?")) return;
    try {
      await api.delete(`/companies/${id}`);
      toast.success("Node Terminated");
      mutate();
    } catch (error) {
      toast.error("Termination Failed");
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Nodes</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">Organization Registry & Control</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-synth flex items-center gap-3 py-4"
        >
          <Plus className="w-6 h-6" />
          INITIALIZE NEW NODE
        </button>
      </div>

      <div className="relative group max-w-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-accent transition-colors" />
        <input 
          type="text" 
          placeholder="Filter nodes by identifier or sector..." 
          className="synth-input pl-14 py-5 text-lg relative z-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {companies?.map((company: any, i: number) => (
            <motion.div
              key={company.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-8 glass-card-hover group border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(company.id)}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-secondary transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-primary mb-8 group-hover:shadow-neon-purple transition-all duration-500">
                <Building2 className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors">{company.name}</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">
                {company.industry || "Information Tech"}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  {company.website || "not-linked.io"}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  8.2K Synced Entities
                </div>
              </div>

              <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs group-hover:bg-primary group-hover:text-white transition-all duration-500">
                Access Data Matrix
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl glass-card p-10 space-y-8 border-primary/20 relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
              
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tighter uppercase">Initialize Node</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Node Identity</label>
                  <input
                    required
                    placeholder="e.g. Cyberdyne Systems"
                    className="synth-input"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Domain Link</label>
                  <input
                    placeholder="https://future.io"
                    className="synth-input"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sector Classification</label>
                  <input
                    placeholder="Artificial Intelligence"
                    className="synth-input"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-xl border border-white/10 text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
                  >
                    Abort
                  </button>
                  <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 btn-synth py-4 flex items-center justify-center gap-2 text-xs"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "EXECUTE INITIALIZATION"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
