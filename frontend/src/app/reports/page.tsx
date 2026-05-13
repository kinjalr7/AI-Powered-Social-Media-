'use client';

import { useEffect, useState, useMemo } from "react";
import { 
  FileText, Download, AlertCircle, RefreshCw, Search, Filter, 
  Calendar, Clock, CheckCircle2, XCircle, Trash2, ChevronRight, 
  MoreVertical, ExternalLink, Info, BarChart3, Clock3
} from "lucide-react";
import { reportsService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/seedData";

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
  const [isDemo, setIsDemo] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getStatus();
      setReports(res.data.recent_reports || []);
      setScheduledReports(res.data.scheduled_reports || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("System currently unavailable. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    setIsDemo(isDemoMode());
  }, []);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      await reportsService.generate();
      await fetchReports();
    } catch (err: any) {
      console.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleRetry = async (id: string | number) => {
    try {
      await reportsService.retry(id);
      await fetchReports();
    } catch (err) {
      console.error("Retry failed");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await reportsService.delete(id);
      await fetchReports();
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const handleDownload = async (report: any) => {
    try {
      const res = await reportsService.download(report);
      
      if (res && (res as any).demo) {
        // Fallback to client-side for demo
        import('jspdf').then(({ jsPDF }) => {
          const doc = new jsPDF();
          doc.setFontSize(22);
          doc.setTextColor(30, 41, 59);
          doc.text("Social Intelligence Report", 20, 30);
          
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.text(`ID: ${report.id} | Generated: ${report.date}`, 20, 40);
          
          doc.setDrawColor(226, 232, 240);
          doc.line(20, 45, 190, 45);
          
          doc.setFontSize(16);
          doc.setTextColor(30, 41, 59);
          doc.text(report.name, 20, 60);
          
          doc.setFontSize(12);
          doc.text("Executive Summary", 20, 80);
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          const summary = "This intelligence report provides a comprehensive analysis of cross-platform social engagement, brand sentiment trends, and competitive positioning for the requested period. Strategic insights derived from AI-powered data aggregation suggest a positive growth trajectory in primary engagement channels.";
          const splitText = doc.splitTextToSize(summary, 170);
          doc.text(splitText, 20, 90);
          
          doc.text(`Type: ${report.type || 'Global'}`, 20, 120);
          doc.text(`Status: ${report.status}`, 20, 130);
          doc.text(`Size: ${report.size || 'N/A'}`, 20, 140);
          
          const safeFilename = report.name.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '_');
          doc.save(`${safeFilename}.pdf`);
        });
        return;
      }

      // Handle real file download
      const url = window.URL.createObjectURL(new Blob([(res as any).data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === "all" || r.type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, searchTerm, statusFilter, typeFilter]);

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
              {isDemo && (
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/20 tracking-wider">
                  Demo Mode
                </span>
              )}
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
              disabled={generating}
              className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 group"
            >
              {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              {generating ? "Synthesizing..." : "Generate Global Audit"}
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
                    className="bg-transparent border-none text-xs font-bold px-3 py-1.5 outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <option value="all">All Types</option>
                    <option value="global">Global</option>
                    <option value="company">Company</option>
                    <option value="competitor">Competitor</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold px-3 py-1.5 outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
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
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {report.status === "Completed" && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDownload(report); }}
                                  className="p-2 bg-background border border-border hover:border-primary hover:text-primary rounded-lg transition-all shadow-sm"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              {report.status === "Failed" && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRetry(report.id); }}
                                  className="p-2 bg-background border border-border hover:border-amber-500 hover:text-amber-500 rounded-lg transition-all shadow-sm"
                                  title="Retry"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                                className="p-2 bg-background border border-border hover:border-rose-500 hover:text-rose-500 rounded-lg transition-all shadow-sm"
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
                  {selectedReport.status === "Failed" && (
                    <button 
                      onClick={() => handleRetry(selectedReport.id)}
                      className="w-full bg-amber-500 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Generation
                    </button>
                  )}
                  <button className="w-full bg-muted/50 border border-border text-foreground py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-muted transition-all">
                    <ExternalLink className="w-4 h-4" />
                    View Preview
                  </button>
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
                  <button className="text-[10px] font-black text-primary hover:underline">Manage</button>
                </div>

                <div className="space-y-4">
                  {scheduledReports.map((sch) => (
                    <div key={sch.id} className="group p-4 bg-muted/20 border border-border/50 rounded-xl hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{sch.name}</span>
                        <div className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                          {sch.frequency}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                        <Calendar className="w-3 h-3" />
                        Next Run: {sch.next_run}
                      </div>
                    </div>
                  ))}
                  
                  {scheduledReports.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 italic">No scheduled reports active.</p>
                  )}
                </div>

                <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-[10px] font-black text-muted-foreground hover:border-primary hover:text-primary transition-all uppercase tracking-widest">
                  + Create New Schedule
                </button>
              </div>
            )}

            {/* Quick Stats / Info */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                <Info className="w-4 h-4" />
                Intel Usage
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%]" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-muted-foreground">Reports Used</span>
                  <span className="text-foreground">13 / 20</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Your current plan allows for 7 more deep-dive intelligence audits this month.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
