'use client';

import { useEffect, useState } from "react";
import { FileText, Download, AlertCircle, RefreshCw, Search, Filter } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { reportsService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getStatus();
      setReports(res.data.recent_reports || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      await reportsService.generate();
      await fetchReports(); // Refresh the list from server
    } catch (err: any) {
      console.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report: any) => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("AI Social Media Analytics Report", 20, 20);
      
      doc.setFontSize(16);
      doc.text(`Report Name: ${report.name}`, 20, 40);
      doc.text(`Date Generated: ${report.date}`, 20, 50);
      doc.text(`Status: ${report.status || 'Completed'}`, 20, 60);
      
      doc.setFontSize(12);
      doc.text("Summary:", 20, 80);
      doc.text("This report provides an overview of your social media performance", 20, 90);
      doc.text("metrics, including engagement rates, audience growth, and sentiment", 20, 100);
      doc.text("analysis over the selected period.", 20, 110);
      
      const safeFilename = report.name.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '_');
      doc.save(`${safeFilename}.pdf`);
    });
  };

  if (loading && reports.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64 bg-muted" />
        <Skeleton className="h-[500px] w-full bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              Intelligence Reports
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">Access and generate your historical analysis reports</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchReports}
              className="p-2 bg-muted border border-border rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <button 
              onClick={handleGenerateReport} 
              disabled={generating}
              className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-primary/20"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate New Report"}
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xl">
          <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary outline-none w-64 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {reports.length} Reports Found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Report Name</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Format</th>
                  <th className="px-6 py-5">Size</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium">
                      No reports generated yet.
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-foreground font-bold group-hover:text-primary transition-colors">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-muted-foreground font-medium text-xs">{report.date}</td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-0.5 rounded bg-muted border border-border text-[10px] font-black text-muted-foreground">
                          {report.type || "PDF"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-muted-foreground font-medium text-xs">{report.size || "1.2 MB"}</td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleDownload(report)}
                          className="p-2.5 bg-muted/50 hover:bg-primary/20 text-muted-foreground hover:text-primary border border-border rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
