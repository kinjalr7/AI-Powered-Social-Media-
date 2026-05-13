'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SettingSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingSection: React.FC<SettingSectionProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface ToggleRowProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon?: React.ReactNode;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, enabled, onChange, icon }) => {
  return (
    <div 
      className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer group"
      onClick={() => onChange(!enabled)}
    >
      <div className="flex items-center gap-4">
        {icon && <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">{icon}</div>}
        <div>
          <p className="text-sm text-white font-bold">{label}</p>
          {description && <p className="text-xs text-slate-500 font-medium">{description}</p>}
        </div>
      </div>
      <div className={cn(
        "w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out",
        enabled ? "bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]" : "bg-slate-700"
      )}>
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out",
          enabled ? "translate-x-6" : "translate-x-1"
        )} />
      </div>
    </div>
  );
};

interface SelectRowProps {
  label: string;
  description?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export const SelectRow: React.FC<SelectRowProps> = ({ label, description, value, options, onChange, icon }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl gap-4">
      <div className="flex items-center gap-4">
        {icon && <div className="text-slate-400">{icon}</div>}
        <div>
          <p className="text-sm text-white font-bold">{label}</p>
          {description && <p className="text-xs text-slate-500 font-medium">{description}</p>}
        </div>
      </div>
      <div className="relative min-w-[200px]">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface InputRowProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: string;
}

export const InputRow: React.FC<InputRowProps> = ({ label, value, placeholder, onChange, type = "text" }) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
      />
    </div>
  );
};
