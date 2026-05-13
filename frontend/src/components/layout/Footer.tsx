'use client';

import Link from 'next/link';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Globe, 
  Shield, 
  Cpu, 
  ExternalLink,
  Mail,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Footer = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Intelligence Dashboard", href: "/dashboard" },
        { name: "Advanced Analytics", href: "/analytics" },
        { name: "Social Data Engine", href: "/social-data" },
        { name: "AI Reports", href: "/reports" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "API Reference", href: "#" },
        { name: "Security Audit", href: "#" },
        { name: "System Status", href: "#" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
        { name: "Compliance", href: "#" },
      ]
    }
  ];

  if (!mounted) return null;

  return (
    <footer className="relative bg-[#050510] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">
                AI SOCIAL <span className="text-primary text-opacity-80">INTEL</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Next-generation intelligence platform for cross-platform social data analysis. Powered by advanced AI to deliver actionable insights and predictive analytics.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Globe, href: "#" }
              ].map((social, i) => (
                <Link 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx} className="lg:col-span-2 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href} 
                      className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center group"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / CTA */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Intelligence Feed
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Join 5,000+ analysts receiving weekly AI social trends.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email Address" 
                suppressHydrationWarning
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button suppressHydrationWarning className="absolute right-2 top-2 p-1.5 bg-primary rounded-lg text-white hover:bg-primary/80 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <p className="text-xs font-bold text-slate-500">
              &copy; {currentYear} AIGravity Intelligence Corp.
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Systems Nominal</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              SOC2 Type II
            </span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3" />
              OSS License
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
