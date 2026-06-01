import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DatabaseManager from "./components/DatabaseManager";
import TemplateManager from "./components/TemplateManager";
import ArchiveManager from "./components/ArchiveManager";
import EmailDispatch from "./components/EmailDispatch";
import ReportsPanel from "./components/ReportsPanel";
import BackupRestore from "./components/BackupRestore";
import DocumentViewer from "./components/DocumentViewer";

import { useAppState } from "./useAppState";
import { LetterArchive } from "./types";
import { AlertCircle, Disc } from "lucide-react";

export default function App() {
  const {
    vips,
    templates,
    archives,
    dispatches,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    addVip,
    updateVip,
    deleteVip,
    addTemplate,
    updateTemplate,
    cloneTemplate,
    deleteTemplate,
    importVipsFromFile,
    isTodayBirthday,
    getUpcomingBirthdays,
    selectTemplateForVip,
    generateLetterContent,
    bulkGenerateLetters,
    addArchive,
    updateArchive,
    deleteArchive,
    addDispatchLog,
    resetSystemDatabase,
    fetchData,
  } = useAppState();

  const [activeView, setActiveView] = useState<string>("dashboard");
  const [openedDocument, setOpenedDocument] = useState<LetterArchive | null>(null);

  // Identify today's birthdays countdown for the sidebar brand indicator
  const birthdayTodayCount = vips.filter((v) => isTodayBirthday(v.dob, selectedDate)).length;

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center gap-4 animate-pulse select-none">
        <Disc className="w-12 h-12 text-amber-500 animate-spin" />
        <div className="text-center">
          <h2 className="text-sm font-bold font-display uppercase tracking-widest text-amber-500">Ministry Database Terminal</h2>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-1">SECURE FILE ALIGNMENT IN PROCESS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-slate-950 text-rose-400 flex flex-col justify-center items-center gap-3 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
        <h2 className="text-base font-bold font-mono tracking-widest">CRITICAL CONFIGURATION MISALIGNMENT</h2>
        <p className="text-xs text-slate-400 max-w-sm font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-200 transition-colors"
        >
          Re-initialize Link
        </button>
      </div>
    );
  }

  // Choose sub-view based on Sidebar hooks
  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            vips={vips}
            templates={templates}
            archives={archives}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isTodayBirthday={isTodayBirthday}
            getUpcomingBirthdays={getUpcomingBirthdays}
            selectTemplateForVip={selectTemplateForVip}
            generateLetterContent={generateLetterContent}
            bulkGenerateLetters={bulkGenerateLetters}
            addArchive={addArchive}
          />
        );
      case "database":
        return (
          <DatabaseManager
            vips={vips}
            addVip={addVip}
            updateVip={updateVip}
            deleteVip={deleteVip}
            importVipsFromFile={importVipsFromFile}
            resetSystemDatabase={resetSystemDatabase}
          />
        );
      case "templates":
        return (
          <TemplateManager
            templates={templates}
            addTemplate={addTemplate}
            updateTemplate={updateTemplate}
            cloneTemplate={cloneTemplate}
            deleteTemplate={deleteTemplate}
          />
        );
      case "archives":
        return (
          <ArchiveManager
            archives={archives}
            onOpenDocument={(a) => setOpenedDocument(a)}
            onDeleteDocument={deleteArchive}
          />
        );
      case "dispatch":
        return (
          <EmailDispatch
            archives={archives}
            dispatches={dispatches}
            addDispatchLog={addDispatchLog}
          />
        );
      case "reports":
        return (
          <ReportsPanel
            vips={vips}
            selectedDate={selectedDate}
          />
        );
      case "settings":
        return (
          <BackupRestore
            vips={vips}
            templates={templates}
            archives={archives}
            dispatches={dispatches}
            resetSystemDatabase={resetSystemDatabase}
            fetchData={fetchData}
          />
        );
      default:
        return (
          <div className="p-10 font-mono text-xs text-slate-500">
            Navigation system failure. View module "{activeView}" not configured.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-800 select-text overflow-hidden" id="applet-frame">
      {/* Sidebar navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        birthdayTodayCount={birthdayTodayCount}
      />

      {/* Main Core Section Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        {renderActiveView()}
      </main>

      {/* Overlay Document Viewer */}
      {openedDocument && (
        <DocumentViewer
          archive={openedDocument}
          onClose={() => setOpenedDocument(null)}
          onUpdateContent={updateArchive}
        />
      )}
    </div>
  );
}
