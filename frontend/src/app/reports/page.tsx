'use client';

import { useEffect, useState, useMemo } from "react";
import { 
  FileText, Download, AlertCircle, RefreshCw, Search, Filter, 
  Calendar, Clock, CheckCircle2, XCircle, Trash2, ChevronRight, 
  MoreVertical, ExternalLink, Info, BarChart3, Clock3, Plus, X,
  Mail, ShieldCheck, Eye
} from "lucide-react";
import { reportsService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/seedData";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleFreq, setScheduleFreq] = useState("Weekly");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleRecipients, setScheduleRecipients] = useState("");
  const [scheduleType, setScheduleType] = useState("Global");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [isEmailPromptOpen, setIsEmailPromptOpen] = useState(false);
  const [promptEmail, setPromptEmail] = useState("");

  const fetchReports = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await reportsService.getHistory();
      // Backend returns { reports: [...], schedules: [...] }
      setReports(res.data.reports || []);
      setScheduledReports(res.data.schedules || []);
      setError(null);
    } catch (err: any) {
      console.error("Fetch reports error:", err);
      // Fallback for demo mode is handled in reportsService
      if (!isDemoMode()) {
        if (err.response?.status === 401) {
          setError("Session expired or not authenticated. Please log in.");
        } else {
          setError("System currently unavailable. Please check your connection.");
        }
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Polling for processing reports
  useEffect(() => {
    const hasProcessing = reports.some(r => r.status === "Processing" || r.status === "Pending");
    
    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchReports(false); // Fetch without full page loading state
      }, 4000); // Poll every 4 seconds
      return () => clearInterval(interval);
    }
  }, [reports]);

  const isGlobalProcessing = useMemo(() => {
    return reports.some(r => 
      r.type?.toLowerCase() === "global" && 
      (r.status?.toLowerCase() === "processing" || r.status?.toLowerCase() === "pending")
    );
  }, [reports]);

  const handleGenerateReport = async () => {
    if (isGlobalProcessing) {
      toast.error("A global audit is already being synthesized.");
      return;
    }

    try {
      setGenerating(true);
      const res = await reportsService.generate();
      toast.success(res.data.message || "Intelligence audit initiated");
      await fetchReports(false);
    } catch (err: any) {
      console.error("Failed to generate report:", err);
      toast.error(err.response?.data?.detail || "Audit generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleEmailExecutives = async (report: any, customEmail?: string) => {
    // If no email provided and status is N/A, prompt for email
    if (!customEmail && (report.email_status === "N/A" || !report.email_status)) {
      setSelectedReport(report);
      setIsEmailPromptOpen(true);
      return;
    }

    try {
      setEmailing(true);
      const res = await reportsService.emailExecutives(report.id, customEmail);
      toast.success(res.data.message || "Intelligence audit delivered successfully");
      setIsEmailPromptOpen(false);
      setPromptEmail("");
      await fetchReports(false); // Refresh to see updated email status
    } catch (err) {
      toast.error("Executive delivery failed.");
    } finally {
      setEmailing(false);
    }
  };

  const handleOpenSummary = (report: any) => {
    setSelectedReport(report);
    setIsSummaryOpen(true);
  };

  const handleRetry = async (id: string | number) => {
    try {
      toast.loading("Retrying audit generation...", { id: "retry" });
      await reportsService.retry(id);
      toast.success("Retry initiated", { id: "retry" });
      await fetchReports(false);
    } catch (err) {
      console.error("Retry failed");
      toast.error("Retry failed", { id: "retry" });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await reportsService.delete(id);
      toast.success("Report deleted");
      await fetchReports(false);
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (err) {
      console.error("Delete failed");
      toast.error("Delete failed");
    }
  };

  const handleDownload = async (report: any) => {
    try {
      toast.loading("Preparing download...", { id: "download" });
      const res = await reportsService.download(report.id);
      
      const blob = new Blob([(res as any).data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded", { id: "download" });
    } catch (err: any) {
      console.error("Download failed", err);
      const errorMsg = err.response?.data?.detail || "Download failed";
      toast.error(errorMsg, { id: "download" });
    }
  };

  const handlePreview = async (report: any) => {
    try {
      toast.loading("Generating preview...", { id: "preview" });
      const res = await reportsService.download(report.id);
      const blob = new Blob([(res as any).data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Note: we don't revoke immediately as the tab needs it, 
      // but browser usually handles this for window.open(blobUrl)
      toast.dismiss("preview");
    } catch (err) {
      console.error("Preview failed", err);
      toast.error("Could not generate preview", { id: "preview" });
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduleData = {
        name: scheduleName,
        frequency: scheduleFreq,
        time: scheduleTime,
        recipients: scheduleRecipients,
        type: scheduleType
      };
      
      await reportsService.createSchedule(scheduleData);
      toast.success(`Automated schedule "${scheduleName}" established`);
      setIsScheduleModalOpen(false);
      setScheduleName("");
      setScheduleRecipients("");
      await fetchReports(false);
    } catch (err) {
      toast.error("Failed to establish schedule");
    }
  };

  const handleDeleteSchedule = async (id: string | number) => {
    if (!confirm("Remove this automated schedule?")) return;
    try {
      await reportsService.deleteSchedule(id);
      toast.success("Schedule removed");
      await fetchReports(false);
    } catch (err) {
      toast.error("Failed to remove schedule");
    }
  };

  const allReports = useMemo(() => {
    return reports;
  }, [reports]);

  const filteredReports = useMemo(() => {
    return allReports.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === "all" || r.type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allReports, searchTerm, statusFilter, typeFilter]);

  if (loading && reports.length === 0) {
    return (
      <div className="p-8 space-y-8 bg-background min-h-screen">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64 bg-muted/40" />
          <Skeleton className="h-10 w-40 bg-muted/40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-[600px] w-full bg-muted/30 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full bg-muted/30 rounded-2xl" />
            <Skeleton className="h-64 w-full bg-muted/30 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Intelligence Reports
              </h1>
            </div>
            <p className="text-muted-foreground font-medium">Generate and manage high-fidelity audit reports and strategic insights.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={fetchReports}
              className="p-3 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
              title="Refresh Data"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
            <button 
              onClick={handleGenerateReport} 
              disabled={generating || isGlobalProcessing}
              className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 group"
            >
              {(generating || isGlobalProcessing) ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              {(generating || isGlobalProcessing) ? "Synthesizing..." : "Generate Global Audit"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main List Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Filters Bar */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search reports by title..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-muted/50 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1.5 outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-all rounded-lg"
                  >
                    <option value="all" className="bg-[#0f172a] text-white">All Types</option>
                    <option value="global" className="bg-[#0f172a] text-white">Global</option>
                    <option value="company" className="bg-[#0f172a] text-white">Company</option>
                    <option value="competitor" className="bg-[#0f172a] text-white">Competitor</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-muted/50 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1.5 outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-all rounded-lg"
                  >
                    <option value="all" className="bg-[#0f172a] text-white">All Status</option>
                    <option value="completed" className="bg-[#0f172a] text-white">Completed</option>
                    <option value="processing" className="bg-[#0f172a] text-white">Processing</option>
                    <option value="failed" className="bg-[#0f172a] text-white">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                      <th className="px-6 py-5">Intel Name</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Email Delivery</th>
                      <th className="px-6 py-5">Meta</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-32 text-center">
                          <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                            <div className="p-4 bg-muted/30 rounded-full">
                              <Search className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <div>
                              <p className="text-foreground font-bold">No reports found</p>
                              <p className="text-muted-foreground text-sm mt-1">Adjust your filters or generate a new intelligence audit.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
                        <tr 
                          key={report.id} 
                          className={cn(
                            "group hover:bg-muted/30 transition-all cursor-pointer",
                            selectedReport?.id === report.id && "bg-primary/5 border-l-2 border-l-primary"
                          )}
                          onClick={() => setSelectedReport(report)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-3 rounded-xl transition-transform group-hover:scale-110",
                                report.status === "Completed" ? "bg-teal-500/10 text-teal-500" : 
                                report.status === "Failed" ? "bg-rose-500/10 text-rose-500" :
                                "bg-amber-500/10 text-amber-500"
                              )}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-foreground font-bold group-hover:text-primary transition-colors block leading-tight">
                                  {report.name}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                                  {report.type} Report
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground/80">{report.date}</span>
                              <span className="text-[10px] text-muted-foreground font-medium">10:42 AM</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                              report.status === "Completed" ? "bg-teal-500/10 text-teal-500 border-teal-500/20" :
                              report.status === "Failed" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                              "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            )}>
                              {report.status === "Processing" && <RefreshCw className="w-3 h-3 animate-spin" />}
                              {report.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                              {report.status === "Failed" && <XCircle className="w-3 h-3" />}
                              {report.status}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                              report.email_status === "Sent" ? "bg-teal-500/10 text-teal-500 border-teal-500/20" :
                              report.email_status === "Failed" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                              report.email_status === "Processing" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-muted/50 text-muted-foreground border-border"
                            )}>
                              {report.email_status === "Processing" && <RefreshCw className="w-3 h-3 animate-spin" />}
                              {report.email_status === "Sent" && <Mail className="w-3 h-3" />}
                              {report.email_status === "Failed" && <XCircle className="w-3 h-3" />}
                              {report.email_status || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-black text-muted-foreground border border-border">
                                {report.format || "PDF"}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-bold">
                                {report.size || "1.2 MB"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {report.status === "Completed" && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDownload(report); }}
                                  className="p-2 bg-muted/50 border border-border hover:border-primary hover:text-primary rounded-lg transition-all shadow-sm"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              {report.status === "Failed" && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRetry(report.id); }}
                                  className="p-2 bg-muted/50 border border-border hover:border-amber-500 hover:text-amber-500 rounded-lg transition-all shadow-sm"
                                  title="Retry"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenSummary(report); }}
                                className="p-2 bg-muted/50 border border-border hover:border-primary hover:text-primary rounded-lg transition-all shadow-sm"
                                title="View Summary"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                                className="p-2 bg-muted/50 border border-border hover:border-rose-500 hover:text-rose-500 rounded-lg transition-all shadow-sm"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Detailed Preview Panel (if selected) */}
            {selectedReport ? (
              <div className="bg-card rounded-2xl border-2 border-primary/20 shadow-2xl p-6 space-y-6 animate-in slide-in-from-right-10 duration-300">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-black leading-tight">{selectedReport.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{selectedReport.type} Intelligence</p>
                </div>

                <div className="space-y-4 py-4 border-y border-border/50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold">Status</span>
                    <span className={cn(
                      "font-black uppercase tracking-tighter",
                      selectedReport.status === "Completed" ? "text-teal-500" : "text-amber-500"
                    )}>{selectedReport.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold">Date Generated</span>
                    <span className="text-foreground font-bold">{selectedReport.date}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold">File Format</span>
                    <span className="text-foreground font-bold">{selectedReport.format || "PDF"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold">Data Size</span>
                    <span className="text-foreground font-bold">{selectedReport.size}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-border/30">
                    <span className="text-muted-foreground font-bold">Email Status</span>
                    <span className={cn(
                      "font-black uppercase tracking-tighter",
                      selectedReport.email_status === "Sent" ? "text-teal-500" : 
                      selectedReport.email_status === "Failed" ? "text-rose-500" : "text-amber-500"
                    )}>{selectedReport.email_status || "N/A"}</span>
                  </div>
                  {selectedReport.email_delivered_at && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-bold">Delivered At</span>
                      <span className="text-foreground font-bold">{new Date(selectedReport.email_delivered_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {selectedReport.error_message && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" />
                      Failure Insight
                    </div>
                    <p className="text-xs text-rose-500/80 font-medium leading-relaxed">
                      {selectedReport.error_message}
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  {selectedReport.status === "Completed" && (
                    <button 
                      onClick={() => handleDownload(selectedReport)}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      <Download className="w-4 h-4" />
                      Download Final PDF
                    </button>
                  )}
                  {selectedReport.status === "Processing" && (
                    <button 
                      disabled
                      className="w-full bg-muted text-muted-foreground py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-not-allowed border border-border"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Synthesizing Audit...
                    </button>
                  )}
                  {selectedReport.status === "Failed" && (
                    <button 
                      onClick={() => handleRetry(selectedReport.id)}
                      className="w-full bg-amber-500 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Generation
                    </button>
                  )}
                  <button 
                    onClick={() => handleOpenSummary(selectedReport)}
                    className="w-full bg-primary/10 border border-primary/20 text-primary py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Open Audit Summary
                  </button>
                  <button 
                    onClick={() => handlePreview(selectedReport)}
                    className="w-full bg-muted/50 border border-border text-foreground py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-muted transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Preview
                  </button>

                  {selectedReport.status === "Completed" && (
                    <button 
                      onClick={() => handleEmailExecutives(selectedReport)}
                      disabled={emailing}
                      className="w-full bg-teal-500/10 border border-teal-500/20 text-teal-500 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-teal-500/20 transition-all"
                    >
                      {emailing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      Email to CEO & HR
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Scheduled Reports Widget */
              <div className="bg-card rounded-2xl border border-border shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-primary" />
                    Scheduled
                  </h3>
                  <button 
                    onClick={() => toast.info("Advanced schedule management console coming soon")}
                    className="text-[10px] font-black text-primary hover:underline"
                  >
                    Manage
                  </button>
                </div>

                <div className="space-y-4">
                  {scheduledReports.map((sch) => (
                    <div key={sch.id} className="group p-4 bg-muted/20 border border-border/50 rounded-xl hover:border-primary/30 transition-all relative">
                      <button 
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{sch.name}</span>
                        <div className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                          {sch.frequency}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                          <Calendar className="w-3 h-3" />
                          Next: {sch.next_run}
                        </div>
                        {sch.recipients && (
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold truncate">
                            <Mail className="w-3 h-3" />
                            {sch.recipients}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {scheduledReports.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 italic">No scheduled reports active.</p>
                  )}
                </div>

                <button 
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full py-3 border-2 border-dashed border-border rounded-xl text-[10px] font-black text-muted-foreground hover:border-primary hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Create New Schedule
                </button>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Schedule Creation Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleCreateSchedule} className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Clock3 className="w-5 h-5 text-primary" />
                    New Intel Schedule
                  </h2>
                  <button type="button" onClick={() => setIsScheduleModalOpen(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Report Title</label>
                    <input 
                      required
                      type="text" 
                      value={scheduleName}
                      onChange={(e) => setScheduleName(e.target.value)}
                      placeholder="e.g. Monthly Executive Audit"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Frequency</label>
                      <select 
                        value={scheduleFreq}
                        onChange={(e) => setScheduleFreq(e.target.value)}
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm outline-none"
                      >
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Preferred Time</label>
                      <input 
                        type="time" 
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Recipient Gmails (Comma separated)</label>
                    <input 
                      required
                      type="text" 
                      value={scheduleRecipients}
                      onChange={(e) => setScheduleRecipients(e.target.value)}
                      placeholder="ceo@gmail.com, hr@gmail.com"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Audit Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setScheduleType("Global")}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all",
                          scheduleType === "Global" ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        Global Audit
                      </button>
                      <button 
                        type="button"
                        onClick={() => setScheduleType("Company")}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all",
                          scheduleType === "Company" ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        Company Deep-Dive
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  Establish Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Summary Modal */}
      <AnimatePresence>
        {isSummaryOpen && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSummaryOpen(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{selectedReport.name}</h2>
                    <p className="text-sm text-muted-foreground font-bold">Executive Intelligence Summary</p>
                  </div>
                </div>
                <button onClick={() => setIsSummaryOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Engagement Score</p>
                    <p className="text-3xl font-black text-primary">84.2</p>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Sentiment Index</p>
                    <p className="text-3xl font-black text-teal-500">78%</p>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Risk Signals</p>
                    <p className="text-3xl font-black text-rose-500">Low</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Strategic Insights
                  </h3>
                  <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <p>
                      The intelligence synthesis for this period reveals a significant 12% increase in cross-platform engagement, primarily driven by high-quality interactions on LinkedIn. Sentiment analysis remains robustly positive, though we have identified emerging discussions in niche Reddit communities regarding product pricing transparency.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4 font-medium">
                      <li>LinkedIn engagement reached a 6-month high on Thursday morning.</li>
                      <li>Twitter brand mentions are 82% positive, focusing on the new AI features.</li>
                      <li>Hiring signals detected in 4 competitor organizations suggest aggressive talent acquisition in the APAC region.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary">Recommended Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Increase LinkedIn content frequency for peak Thursday slots",
                      "Monitor Reddit pricing threads for official response opportunity",
                      "Target competitor talent pools identified in APAC",
                      "Leverage positive AI feedback for Q3 marketing campaigns"
                    ].map((action, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                          {i+1}
                        </div>
                        <p className="text-sm font-bold text-foreground/80">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-4">
                <button 
                  onClick={() => handleDownload(selectedReport)}
                  className="px-6 py-3 bg-muted border border-border rounded-xl text-sm font-black hover:bg-muted/80 transition-all"
                >
                  Download PDF
                </button>
                <button 
                  onClick={() => handleEmailExecutives(selectedReport)}
                  disabled={emailing}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {emailing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Email to CEO & HR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Email Prompt Modal */}
      <AnimatePresence>
        {isEmailPromptOpen && selectedReport && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailPromptOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Executive Delivery
                  </h2>
                  <button type="button" onClick={() => setIsEmailPromptOpen(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-primary/80 uppercase tracking-wider">Report Target</p>
                    <p className="text-sm font-black">{selectedReport.name}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Recipient Email (CEO/HR)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        required
                        type="email" 
                        value={promptEmail}
                        onChange={(e) => setPromptEmail(e.target.value)}
                        placeholder="e.g. executive@company.com"
                        className="w-full bg-muted/50 border border-border rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground italic ml-1">* This report will be delivered as an encrypted PDF attachment.</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleEmailExecutives(selectedReport, promptEmail)}
                  disabled={emailing || !promptEmail}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {emailing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {emailing ? "Delivering..." : "Confirm & Send Audit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
