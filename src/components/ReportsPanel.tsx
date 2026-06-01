import React, { useState } from "react";
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  FileText, 
  Users, 
  Globe, 
  Clock,
  ArrowRight
} from "lucide-react";
import { VipRecord } from "../types";

interface ReportsPanelProps {
  vips: VipRecord[];
  selectedDate: string;
}

export default function ReportsPanel({ vips, selectedDate }: ReportsPanelProps) {
  const [activeReportType, setActiveReportType] = useState<"daily" | "weekly" | "monthly" | "category" | "state">("daily");
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<number>(new Date(selectedDate).getMonth()); // 0-11

  // 1. Daily Report derivation 
  const checkDateObj = new Date(selectedDate);
  const targetMonth = checkDateObj.getMonth() + 1;
  const targetDay = checkDateObj.getDate();
  const dailyBirthdays = vips.filter((v) => {
    try {
      const parts = v.dob.split("-");
      // Match MM and DD
      if (parts[0].length === 4) {
        return Number(parts[1]) === targetMonth && Number(parts[2]) === targetDay;
      } else {
        return Number(parts[1]) === targetMonth && Number(parts[0]) === targetDay;
      }
    } catch { return false; }
  });

  // 2. Weekly Report derivation (birthdays in coming 7 days)
  const getWeeklyBirthdays = () => {
    const list: any[] = [];
    vips.forEach((v) => {
      try {
        const parts = v.dob.split("-");
        if (parts.length < 2) return;
        let m = 0, d = 0;
        if (parts[0].length === 4) {
          m = Number(parts[1]) - 1;
          d = Number(parts[2]);
        } else {
          m = Number(parts[1]) - 1;
          d = Number(parts[0]);
        }
        
        const bdayThisYear = new Date(checkDateObj.getFullYear(), m, d);
        let diffMs = bdayThisYear.getTime() - checkDateObj.getTime();
        let days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (days < 0) {
          const bdayNextYear = new Date(checkDateObj.getFullYear() + 1, m, d);
          diffMs = bdayNextYear.getTime() - checkDateObj.getTime();
          days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }

        if (days >= 0 && days <= 7) {
          list.push({ vip: v, daysRemaining: days });
        }
      } catch {}
    });
    return list.sort((a,b) => a.daysRemaining - b.daysRemaining);
  };
  const weeklyBirthdays = getWeeklyBirthdays();

  // 3. Categorywise summary stats
  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    vips.forEach((v) => {
      stats[v.category] = (stats[v.category] || 0) + 1;
    });
    return Object.entries(stats).map(([category, count]) => ({ category, count }));
  };
  const categoryStats = getCategoryStats();

  // 4. Statewise summary stats
  const getStateStats = () => {
    const stats: Record<string, number> = {};
    vips.forEach((v) => {
      const stateName = v.state || "National / Central Office";
      stats[stateName] = (stats[stateName] || 0) + 1;
    });
    return Object.entries(stats).map(([state, count]) => ({ state, count }));
  };
  const stateStats = getStateStats();

  // 5. Monthly grid calendar birthdays details
  const getMonthlyBirthdaysForGrid = (monthIndex: number) => {
    return vips.filter((v) => {
      try {
        const parts = v.dob.split("-");
        const m = parts[0].length === 4 ? Number(parts[1]) - 1 : Number(parts[1]) - 1;
        return m === monthIndex;
      } catch { return false; }
    });
  };
  const monthlyBirthdaysList = getMonthlyBirthdaysForGrid(selectedCalendarMonth);

  // General CSV File Downloader Export Matrix
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeReportType === "daily") {
      csvContent += "Name,Designation,Category,Date of Birth,Priority\n";
      dailyBirthdays.forEach(v => {
        csvContent += `"${v.name}","${v.designation}","${v.category}","${v.dob}","${v.priority}"\n`;
      });
    } else if (activeReportType === "weekly") {
      csvContent += "Name,Designation,Category,Date of Birth,Days Remaining\n";
      weeklyBirthdays.forEach(item => {
        csvContent += `"${item.vip.name}","${item.vip.designation}","${item.vip.category}","${item.vip.dob}",${item.daysRemaining}\n`;
      });
    } else if (activeReportType === "category") {
      csvContent += "Category,Count\n";
      categoryStats.forEach(item => {
        csvContent += `"${item.category}",${item.count}\n`;
      });
    } else {
      csvContent += "State,Count\n";
      stateStats.forEach(item => {
        csvContent += `"${item.state}",${item.count}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `VIP_${activeReportType}_report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-fade-in" id="reports-tab">
      
      {/* Selector layout bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-wrap gap-2 justify-between items-center shrink-0">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: "daily", label: "Daily Brief", icon: Clock },
            { id: "weekly", label: "Weekly Run Plan", icon: Calendar },
            { id: "monthly", label: "Annual Calendar Grid", icon: Calendar },
            { id: "category", label: "Category Analytics", icon: BarChart3 },
            { id: "state", label: "Regional Density", icon: Globe }
          ].map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => setActiveReportType(r.id as any)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  activeReportType === r.id 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors bg-white shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report PDF
          </button>
          
          {activeReportType !== "monthly" && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel (.csv)
            </button>
          )}
        </div>
      </div>

      {/* Report Sheet rendering */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-8 space-y-6 max-w-4xl mx-auto" id="printable-report-card">
        
        {/* Document Header representation */}
        <div className="text-center border-b border-double border-slate-200 pb-6">
          <h1 className="text-2xl font-bold font-display text-slate-800 tracking-wide uppercase">PARLIAMENT PROTOCOL BULLETIN</h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">Dignitary Administration analytics dossier</p>
          <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500">
            <span>Dossier Reference: PR-B-DAY-GEN/2026</span>
            <span>Date Generated: {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* Dynamic Display components */}
        
        {/* 1. Daily brief format */}
        {activeReportType === "daily" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 font-display text-base">Detected VIP Birthdays for {selectedDate}</h3>
              <p className="text-xs text-slate-400">Total detected alignments matching month-day equations</p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              {dailyBirthdays.length > 0 ? (
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-sky-100 text-slate-500 uppercase tracking-widest font-mono font-extrabold">
                      <th className="p-3">Dignitary Name</th>
                      <th className="p-3">Constitutional Category</th>
                      <th className="p-3">Salutation Line</th>
                      <th className="p-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyBirthdays.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/20">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{v.name}</div>
                          <div className="text-[10px] text-slate-400">{v.designation}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-600">{v.category}</td>
                        <td className="p-3 italic text-slate-500 font-medium">"{v.salutation}"</td>
                        <td className="p-3 font-mono text-slate-400">{v.email || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400 italic">No births discovered for this target date simulation run.</div>
              )}
            </div>
          </div>
        )}

        {/* 2. Weekly brief format */}
        {activeReportType === "weekly" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 font-display text-base">Weekly Birthday Forecast Run (7-Day Span)</h3>
              <p className="text-xs text-slate-400">Chronological list of oncoming dignitary milestones</p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              {weeklyBirthdays.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-sky-100 text-slate-500 uppercase tracking-widest font-mono font-extrabold">
                      <th className="p-3">Dignitary Name</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Birthdate</th>
                      <th className="p-3">Remaining Countdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weeklyBirthdays.map((item) => (
                      <tr key={item.vip.id} className="hover:bg-slate-50/20">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{item.vip.name}</div>
                          <div className="text-[10px] text-slate-400">{item.vip.category}</div>
                        </td>
                        <td className="p-3 text-slate-600">{item.vip.designation}</td>
                        <td className="p-3 font-mono text-slate-500">{item.vip.dob}</td>
                        <td className="p-3">
                          <span className="bg-amber-100 text-amber-800 font-extrabold font-mono text-[10px] px-2 py-0.5 rounded">
                            {item.daysRemaining === 0 ? "TODAY" : `In ${item.daysRemaining} Days`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400 italic">No birthdays discovered in the immediate 7 days ahead.</div>
              )}
            </div>
          </div>
        )}

        {/* 3. Annual Calendar Grid view block */}
        {activeReportType === "monthly" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 font-display text-base">Monthly Birthday Calendar Matrix</h3>
                <p className="text-xs text-slate-400">Visual mapping of births parsed by calendar months</p>
              </div>

              {/* Month Switcher dropdown */}
              <div className="flex pr-1 shrink-0">
                <select
                  value={selectedCalendarMonth}
                  onChange={(e) => setSelectedCalendarMonth(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {monthsList.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Display monthly birthday listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              {monthlyBirthdaysList.length > 0 ? (
                monthlyBirthdaysList.map((v) => {
                  const bParts = v.dob.split("-");
                  const bDay = bParts[0].length === 4 ? bParts[2] : bParts[0];

                  return (
                    <div key={v.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 text-xs">{v.name}</div>
                        <div className="text-[10px] text-slate-400">{v.designation}</div>
                        <div className="text-[10px] font-mono text-slate-500">DOB: {v.dob}</div>
                      </div>
                      <div className="text-center shrink-0 w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center font-mono text-xs border border-amber-500/20">
                        {bDay}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="md:col-span-2 p-16 text-center text-slate-400 font-medium italic">
                  No registered birthdays compiled for {monthsList[selectedCalendarMonth]}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Category density analysis */}
        {activeReportType === "category" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 font-display text-base">Constitutional Category Distribution</h3>
              <p className="text-xs text-slate-400">Total VIP profile allocations divided by standard protocol templates</p>
            </div>

            <div className="space-y-3 pt-3">
              {categoryStats.map((item, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-slate-700">{item.category}</span>
                    <span className="text-slate-500 font-bold">{item.count} Dignitaries</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full rounded-full" 
                      style={{ width: `${Math.max(5, (item.count / vips.length) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Regional density values */}
        {activeReportType === "state" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 font-display text-base">Regional Density Summary table</h3>
              <p className="text-xs text-slate-400">Breakdown of dignitary origins and state distributions</p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse font-sans font-medium">
                <thead>
                  <tr className="bg-slate-50 border-b border-sky-100 text-slate-500 uppercase tracking-widest font-mono font-extrabold">
                    <th className="p-3">State / Jurisdiction</th>
                    <th className="p-3">Registered Dignitaries</th>
                    <th className="p-3 text-right">Ratio Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stateStats.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/20">
                      <td className="p-3 font-semibold text-slate-800">{item.state}</td>
                      <td className="p-3 font-mono font-bold text-slate-600">{item.count} Members</td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        {((item.count / vips.length) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Regulatory credit seal */}
        <div className="pt-12 border-t border-slate-100 text-center space-y-2 select-none">
          <p className="text-[10px] text-slate-400 font-mono tracking-widest">SUBMITTED IN COMPLIANCE WITH OFFICIAL ARCHIVAL RULES 2026</p>
          <div className="w-20 h-0.5 bg-amber-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
