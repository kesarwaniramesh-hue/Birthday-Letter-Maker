import React, { useState } from "react";
import { 
  Calendar, 
  Users, 
  FileCheck, 
  Archive, 
  Wand2, 
  CheckCircle, 
  AlertCircle,
  TrendingUp, 
  ChevronRight, 
  Filter, 
  Sparkles,
  Printer,
  History,
  ArrowRightCircle,
  FileText
} from "lucide-react";
import { VipRecord, Template, LetterArchive } from "../types";

interface DashboardProps {
  vips: VipRecord[];
  templates: Template[];
  archives: LetterArchive[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isTodayBirthday: (dob: string, checkDate: string) => boolean;
  getUpcomingBirthdays: (daysAhead: number, filterCategory?: string, filterState?: string, filterParty?: string) => any[];
  selectTemplateForVip: (vip: VipRecord) => Template | null;
  generateLetterContent: (vip: VipRecord, template: Template, aiEnabled: boolean) => Promise<string>;
  bulkGenerateLetters: (filter: any, date?: string, onProgress?: any) => Promise<any>;
  addArchive: (item: LetterArchive) => Promise<void>;
}

export default function Dashboard({
  vips,
  templates,
  archives,
  selectedDate,
  setSelectedDate,
  isTodayBirthday,
  getUpcomingBirthdays,
  selectTemplateForVip,
  generateLetterContent,
  bulkGenerateLetters,
  addArchive
}: DashboardProps) {
  const [generationInterval, setGenerationInterval] = useState<number>(7); // Days ahead preview
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterState, setFilterState] = useState<string>("");
  const [filterParty, setFilterParty] = useState<string>("");

  const [generating, setGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [draftLetter, setDraftLetter] = useState<{ vip: VipRecord; content: string } | null>(null);
  const [selectedModalTemplateId, setSelectedModalTemplateId] = useState<string>("");

  // Filter lists derivation
  const categories = Array.from(new Set(vips.map(v => v.category))).filter(Boolean);
  const states = Array.from(new Set(vips.map(v => v.state))).filter(Boolean);
  const parties = Array.from(new Set(vips.map(v => v.politicalParty))).filter(Boolean);

  // Today's birthday records
  const todaysBirthdays = vips.filter((v) => isTodayBirthday(v.dob, selectedDate));
  
  // Calculate milestone metrics
  const totalVips = vips.length;
  const birthdaysTodayCount = todaysBirthdays.length;
  const totalLettersArchived = archives.length;
  const pendingCount = vips.length - archivedVipsForDateCount(selectedDate);

  // Helper count of generated documents for custom date
  function archivedVipsForDateCount(date: string) {
    return archives.filter(a => a.dateGenerated === date).length;
  }

  // Check if a specific VIP has a generated letter for today
  const isVipGenerated = (vipId: string) => {
    return archives.some((a) => a.vipId === vipId && a.dateGenerated === selectedDate);
  };

  // Run bulk letter generation for Today's birthdays
  const handleBulkGeneration = async () => {
    if (todaysBirthdays.length === 0) {
      alert("No birthdays found for " + selectedDate + ". Add VIP bios or simulate another date.");
      return;
    }
    
    setGenerating(true);
    setProgressPercent(10);
    setProgressMsg("Scanning VIP profile data matching date...");

    try {
      const result = await bulkGenerateLetters("today", selectedDate, (percent: number, msg: string) => {
        setProgressPercent(percent);
        setProgressMsg(msg);
      });
      setProgressPercent(100);
      setProgressMsg(`Successfully compiled ${result.count} official letters! Saved to Archive.`);
      setTimeout(() => {
        setGenerating(false);
        setProgressPercent(0);
      }, 2000);
    } catch (e: any) {
      console.error(e);
      alert("Error generating letters: " + e.message);
      setGenerating(false);
    }
  };

  // Preview / Generate a single letter draft
  const handlePreviewSingle = async (vip: VipRecord) => {
    const tmpl = selectTemplateForVip(vip);
    if (!tmpl) {
      alert("No suitable template matched for this VIP category. Access 'Templates' tab to draft one.");
      return;
    }
    setSelectedModalTemplateId(tmpl.id);
    setGenerating(true);
    setProgressMsg(`Synthesizing intelligence greeting letter for ${vip.name}...`);
    try {
      const compiledHtml = await generateLetterContent(vip, tmpl, true);
      setDraftLetter({ vip, content: compiledHtml });
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  // Archive draft letter
  const saveDraftToArchive = async () => {
    if (!draftLetter) return;
    const { vip, content } = draftLetter;
    
    const dateObj = new Date(selectedDate);
    const curYear = String(dateObj.getFullYear());
    const curMonth = dateObj.toLocaleString("default", { month: "long" });
    const curDay = String(dateObj.getDate()).padStart(2, "0");

    const customArchive: LetterArchive = {
      id: "arch_manual_" + Date.now() + "_" + vip.id,
      vipId: vip.id,
      vipName: vip.name,
      category: vip.category,
      designation: vip.designation,
      dateGenerated: selectedDate,
      letterDate: `${curDay}-${dateObj.getMonth() + 1}-${curYear}`,
      content: content,
      fileName: `Birthday Letter - ${vip.name.replaceAll(" ", "_")} - ${curDay}-${dateObj.getMonth() + 1}-${curYear}.doc`,
      status: 'Archived',
      year: curYear,
      month: curMonth,
      day: curDay
    };

    await addArchive(customArchive);
    setDraftLetter(null);
    alert(`Personalized letter for ${vip.name} has been signed and archived.`);
  };

  // Target Date Preset Simulator triggers
  const setTargetDatePreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${dd}`);
  };

  const upcomingBirthdays = getUpcomingBirthdays(generationInterval, filterCategory, filterState, filterParty);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-fade-in" id="dashboard-tab">
      
      {/* Simulation & Banner Unit */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
            <Sparkles className="w-3.5 h-3.5" />
            National Dignitaries Address Engine Active
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800 tracking-tight">
            VIP Birthday Automation Bureau
          </h2>
          <p className="text-sm text-slate-500">
            Intelligent templating and formatting engine in support of constitutional office greetings.
          </p>
        </div>

        {/* Date Simulation Matrix */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-wrap gap-4 items-center shrink-0 w-full lg:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Target Selection Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setSelectedDate(today);
                }}
                className="bg-slate-200/70 text-slate-700 hover:bg-slate-200 px-3 py-1 rounded-lg text-xs font-medium"
              >
                Today
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Simulation Presets
            </label>
            <div className="flex gap-1">
              <button onClick={() => setSelectedDate("2026-06-05")} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono font-medium rounded text-slate-600">
                05-Jun (Yogi)
              </button>
              <button onClick={() => setSelectedDate("2026-11-23")} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono font-medium rounded text-slate-600">
                23-Nov (Birla)
              </button>
              <button onClick={() => setSelectedDate("2026-06-20")} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono font-medium rounded text-slate-600">
                20-Jun (Murmu)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Step-by-Step Operator Helper Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between group">
          <div className="space-y-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm font-mono border border-amber-500/30">
              01
            </span>
            <h3 className="text-lg font-bold font-display text-amber-400">Master VIP Records</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify database records containing high officials. Import modern formats (.xlsx / .csv) or Microsoft Access database grids in the "VIP Database" panel.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-[11px] font-mono text-slate-400">Current Records: {totalVips} VIPs</span>
            <span className="text-xs text-amber-500 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Check Database <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-stone-100 rounded-2xl p-6 shadow-md border border-amber-550 flex flex-col justify-between group">
          <div className="space-y-3">
            <span className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-sm font-mono border border-white/20">
              02
            </span>
            <h3 className="text-lg font-bold font-display text-white">Trigger Automated Run</h3>
            <p className="text-xs text-stone-100 leading-relaxed">
              Synthesize and file official correspondence for currently matches. Correct category templates are mapped dynamically to generate formal letters.
            </p>
          </div>
          <div className="mt-6 border-t border-amber-500/40 pt-4 flex flex-row items-center justify-between">
            <span className="text-[11px] font-mono text-amber-100">Birthdays Today: {birthdaysTodayCount} match</span>
            <button
              onClick={handleBulkGeneration}
              disabled={birthdaysTodayCount === 0 || generating}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-95 ${
                birthdaysTodayCount > 0 
                  ? "bg-slate-900 text-white hover:bg-slate-950" 
                  : "bg-slate-800/40 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generate Letters ({birthdaysTodayCount})
            </button>
          </div>
        </div>
      </div>

      {/* Analytical Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total VIP Register", val: totalVips, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Detected Birthdays", val: birthdaysTodayCount, icon: Calendar, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Letters Archived", val: totalLettersArchived, icon: Archive, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Dignitary Templates", val: templates.length, icon: FileCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-100" }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className={`p-3 rounded-lg border ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">{item.label}</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-0.5">{item.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Loader Progress State */}
      {generating && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-100 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400 animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              {progressMsg}
            </span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      )}

      {/* Main Panel Division: Today's matches vs Upcoming Monitor */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Detected Today Birthdays Module */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 font-display">Dignitary Birthdays Matching Selected Date</h3>
              <p className="text-xs text-slate-500">Mapped based on Month-Day equality</p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
              {birthdaysTodayCount} Matches
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {todaysBirthdays.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-widest font-mono font-bold">
                    <th className="p-4">Dignitary & Category</th>
                    <th className="p-4">Designation & State</th>
                    <th className="p-4 text-center">Age Milestone</th>
                    <th className="p-4">Selected Template</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaysBirthdays.map((vip) => {
                    const matchedTmpl = selectTemplateForVip(vip);
                    const processed = isVipGenerated(vip.id);
                    
                    // Parse Age
                    let age = 50;
                    try {
                      age = (new Date(selectedDate)).getFullYear() - (new Date(vip.dob)).getFullYear();
                    } catch {}

                    return (
                      <tr key={vip.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{vip.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{vip.category}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600">{vip.designation}</div>
                          <div className="text-[10px] text-slate-400">{vip.state || "National"}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                            {age}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600 truncate max-w-40 block font-medium">
                            {matchedTmpl ? matchedTmpl.name : "None Available"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {processed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                              <CheckCircle className="w-3 h-3" />
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                              <AlertCircle className="w-3 h-3 animate-pulse" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handlePreviewSingle(vip)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Wand2 className="w-3 h-3" />
                            Draft AI Letter
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-700">No Birthdays Detected Mock Today</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    The chosen date has no month-day record alignments. Try changing target date to "06-05" (Yogi) or "11-23" (Om Birla), or import bios.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Birthday Monitor Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 font-display">Upcoming VIP Monitor</h3>
                <p className="text-xs text-slate-500">Track and plan for near-future bulk greetings</p>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>

            {/* Interval Toggles */}
            <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-0.5 rounded-lg text-xs">
              {[
                { label: "7 Days", val: 7 },
                { label: "15 Days", val: 15 },
                { label: "30 Days", val: 30 }
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setGenerationInterval(item.val)}
                  className={`py-1 rounded-md font-semibold transition-all ${
                    generationInterval === item.val ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Filters */}
            <div className="space-y-2 border-t border-slate-200/60 pt-2.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 font-mono">
                <Filter className="w-3 h-3" />
                Plan Filters
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-600 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-600 focus:outline-none"
                >
                  <option value="">All States</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* List Component */}
          <div className="flex-grow overflow-y-auto max-h-[350px] divide-y divide-slate-100">
            {upcomingBirthdays.length > 0 ? (
              upcomingBirthdays.map(({ vip, daysRemaining, nextAge }) => (
                <div key={vip.id} className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="font-bold text-slate-800 truncate">{vip.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{vip.designation} ({vip.state || "National"})</div>
                    <div className="text-[10px] font-mono text-slate-500">DOB: {vip.dob}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded text-[10px] font-mono">
                      {daysRemaining === 0 ? "TODAY" : `In ${daysRemaining} days`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-semibold">Age {nextAge}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-1">
                <p className="text-xs">No upcoming matches discovered</p>
                <p className="text-[10px] text-slate-500">Broaden filters or increase register size</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Intelligence Content Editor Dialog (Overlay Modal) */}
      {draftLetter && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <span className="bg-amber-500/20 text-amber-400 text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                  Dual-Synthesis Mock Draft
                </span>
                <h3 className="text-lg font-bold font-display text-slate-100">
                  Official Greeting Draft — {draftLetter.vip.name}
                </h3>
              </div>
              <button 
                onClick={() => setDraftLetter(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Document Workspace Sandbox */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 border-y border-slate-200">
              {/* Dynamic Style and Language Switcher */}
              <div className="mb-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-600 font-bold font-sans">Template Customization</span>
                  <h4 className="text-sm font-semibold text-slate-800 font-sans">Choose official layout style or select Hindi letter templates</h4>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedModalTemplateId}
                    onChange={async (e) => {
                      const newTmplId = e.target.value;
                      setSelectedModalTemplateId(newTmplId);
                      const newTmpl = templates.find(t => t.id === newTmplId);
                      if (newTmpl) {
                        setGenerating(true);
                        setProgressMsg(`Synthesizing alternative greeting: ${newTmpl.name}...`);
                        try {
                          const compiledHtml = await generateLetterContent(draftLetter.vip, newTmpl, true);
                          setDraftLetter({ vip: draftLetter.vip, content: compiledHtml });
                        } catch (err: any) {
                          console.error(err);
                          alert("Failed to compile layout: " + err.message);
                        } finally {
                          setGenerating(false);
                        }
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold font-sans focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <strong>AI variables resolved:</strong> Custom paragraphs cover the representative's profile and background in your chosen language using <strong>gemini-3.5-flash</strong>. You can manually edit the text blocks before saving.
                </div>
              </div>

              {/* Editable document visual block */}
              <div className="bg-white p-6 border border-slate-200 shadow-sm rounded-xl font-serif">
                <textarea
                  className="w-full h-96 p-4 border border-slate-300 rounded-lg text-sm text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50 focus:bg-white"
                  value={draftLetter.content}
                  onChange={(e) => setDraftLetter({ ...draftLetter, content: e.target.value })}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between shrink-0 border-t border-slate-100">
              <button
                onClick={() => setDraftLetter(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-600"
              >
                Discard Draft
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const printWindow = window.open();
                    if (printWindow) {
                      printWindow.document.write(draftLetter.content);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                    }
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-300 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Direct
                </button>
                <button
                  onClick={saveDraftToArchive}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs shadow-md flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Sign & Archive Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
