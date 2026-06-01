import React, { useState } from "react";
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  RefreshCw, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { VipRecord, Template, LetterArchive, DispatchLog } from "../types";

interface BackupRestoreProps {
  vips: VipRecord[];
  templates: Template[];
  archives: LetterArchive[];
  dispatches: DispatchLog[];
  resetSystemDatabase: () => Promise<void>;
  fetchData: () => Promise<void>;
}

export default function BackupRestore({
  vips,
  templates,
  archives,
  dispatches,
  resetSystemDatabase,
  fetchData
}: BackupRestoreProps) {
  const [restoring, setRestoring] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handler to pack everything into a JSON download
  const handleBackupExport = () => {
    const payload = {
      vips,
      templates,
      archives,
      dispatches,
      exportVersion: "4.1",
      exportedAt: new Date().toISOString()
    };

    const str = JSON.stringify(payload, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `VIP_System_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler to digest and restore a packed state package
  const handleRestoreImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    setRestoring(true);
    setSuccessMsg("");
    setErrorMsg("");

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (!text) throw new Error("Uploaded backup sheet was empty");

        const parsed = JSON.parse(text as string);
        if (!parsed.vips || !parsed.templates) {
          throw new Error("Invalid schema structure. Missing required database or template matrices.");
        }

        // Post raw package directly to the backend save state
        const response = await fetch("/api/db/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vips: parsed.vips,
            templates: parsed.templates,
            archives: parsed.archives || [],
            dispatches: parsed.dispatches || []
          })
        });

        if (response.ok) {
          await fetchData(); // Force reload values
          setSuccessMsg(`System context successfully restored! Imported ${parsed.vips.length} VIP bios, ${parsed.templates.length} templates, and ${parsed.archives?.length || 0} letter archives.`);
        } else {
          throw new Error("Local backend disk persistence rejected the uploaded configuration.");
        }

      } catch (err: any) {
        console.error(err);
        setErrorMsg("Restore failed: " + (err.message || "Failed decoding JSON payload. Ensure file structure conforms to VIP Backup specification."));
      } finally {
        setRestoring(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Error reading backup file stream.");
      setRestoring(false);
    };

    reader.readAsText(file);
  };

  const handleSystemWipe = async () => {
    if (confirm("🚨 DANGER ZONE alert: This triggers a total system database wipe and resets templates, archives, registers, and VIP bios to original factory settings. Proceed?")) {
      await resetSystemDatabase();
      alert("System restored to baseline test entities.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-fade-in" id="backup-tab">
      
      {/* Selector layout bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          Backup, Contingency & Recovery System
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Maintain system state configurations and transfer active dossiers across terminals effortlessly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Backup creation & restoration */}
        <div className="space-y-6">
          
          {/* Create Backup */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
              <Download className="w-4 h-4 text-slate-400" />
              Secure Data Export
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compile the entire system state into a unified JSON schema backup package. Useful for backing up before big database uploads, or shifting active terminals.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-[10px] font-mono text-slate-500 grid grid-cols-2 gap-4">
              <div>• VIP Bio Records: {vips.length}</div>
              <div>• Custom Layouts: {templates.length}</div>
              <div>• Saved Archives: {archives.length}</div>
              <div>• Delivery History: {dispatches.length}</div>
            </div>
            <button
              onClick={handleBackupExport}
              className="w-full py-2 bg-slate-900 hover:bg-slate-950 font-bold text-white rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Export System Backup Block
            </button>
          </div>

          {/* Import Backup */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-slate-400" />
              Import state configuration
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload an existing `.json` backup file to restore full administrative settings. <strong>WARNING:</strong> This completely replaces current active databases.
            </p>

            <label className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95 text-center block">
              <Upload className="w-3.5 h-3.5" />
              Browse & Import Backup File...
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleRestoreImport}
                disabled={restoring}
              />
            </label>

            {/* Success and failure notification notes */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-tight font-medium">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-tight font-medium">{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Rescue Operations & Manual */}
        <div className="space-y-6">
          
          {/* Emergency Cache Control Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-rose-800 text-sm font-display flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Administrative Contingency Zone
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reset system datastores if memory runs low or testing arrays are corrupted. This clears archival files and reverts configurations cleanly.
            </p>
            <button
              onClick={handleSystemWipe}
              className="w-full py-2 bg-rose-100 hover:bg-rose-200 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs transition-colors"
            >
              Emergency system reset WIPE
            </button>
          </div>

          {/* Core Operating Manual */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              System Operating Instructions
            </h3>
            <div className="space-y-3 pt-2 text-xs font-medium leading-relaxed">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs font-mono select-none text-slate-600 shrink-0">1</span>
                <p className="text-slate-500">Configure target categories and map placeholders in <strong>Templates</strong> studio.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs font-mono select-none text-slate-600 shrink-0">2</span>
                <p className="text-slate-500">Import VIP lists (.xlsx or ACCESS exported tables) in the <strong>Database Master</strong> module.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs font-mono select-none text-slate-600 shrink-0">3</span>
                <p className="text-slate-500">Run the daily pipeline on the <strong>Dashboard</strong> to automatically draft, sign, and archive official letters.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
