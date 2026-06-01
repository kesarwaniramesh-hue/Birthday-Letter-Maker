import React from "react";
import { 
  LayoutDashboard, 
  Database, 
  FileEdit, 
  Archive, 
  Send, 
  BarChart3, 
  Settings, 
  HelpCircle,
  FileCheck
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  birthdayTodayCount: number;
}

export default function Sidebar({ activeView, setActiveView, birthdayTodayCount }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: birthdayTodayCount > 0 ? birthdayTodayCount : undefined },
    { id: "database", label: "VIP Database", icon: Database },
    { id: "templates", label: "Templates", icon: FileEdit },
    { id: "archives", label: "Document Archive", icon: Archive },
    { id: "dispatch", label: "Email & Dispatch", icon: Send },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "settings", label: "System Backup", icon: Settings },
  ];

  return (
    <aside className="w-68 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <span className="font-display text-xl font-bold">VIP</span>
          </div>
          <div>
            <h1 className="font-display leading-tight text-sm font-bold tracking-wider text-amber-500 text-slate-100">
              LETTER SATELLITE
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5">
              AUTO-GEN PROTOCOL
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase px-3 mb-2 font-semibold">
          Main Core Modules
        </p>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive 
                  ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 font-semibold" 
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-amber-500 hover:bg-amber-600 animate-pulse text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Persona block */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-xl border border-slate-700/30">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">Admin Operator</p>
            <p className="text-[10px] text-slate-500 truncate">Dignitary Office Desk</p>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-[9px] text-slate-500 font-mono block">SYS v4.1 • LOCAL PERSISTENCE</span>
        </div>
      </div>
    </aside>
  );
}
