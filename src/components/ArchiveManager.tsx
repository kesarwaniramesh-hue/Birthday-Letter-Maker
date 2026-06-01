import React, { useState } from "react";
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  Search, 
  FileText, 
  Eye, 
  Trash2, 
  Download, 
  History,
  Archive,
  ArrowRight,
  SlidersHorizontal,
  Calendar
} from "lucide-react";
import { LetterArchive } from "../types";
import JSZip from "jszip";

interface ArchiveManagerProps {
  archives: LetterArchive[];
  onOpenDocument: (archive: LetterArchive) => void;
  onDeleteDocument: (id: string) => void;
}

export default function ArchiveManager({
  archives,
  onOpenDocument,
  onDeleteDocument
}: ArchiveManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");

  // Explorer Hierarchical state selection
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedCategoryFolder, setSelectedCategoryFolder] = useState<string>("");

  // Helper folder classifying function to match the requested categorization logic
  const classifyCategory = (vipCategory: string): string => {
    if (!vipCategory) return "Constitutional Authorities";
    if (vipCategory.startsWith("MP")) return "MPs";
    if (vipCategory.includes("Minister") && !vipCategory.includes("Chief")) return "Ministers";
    if (vipCategory.includes("Chief Minister") || vipCategory.includes("Deputy Chief")) return "Chief Ministers";
    if (vipCategory.includes("Governor")) return "Governors";
    return "Constitutional Authorities";
  };

  // Extract distinct folders from existing archive data
  const years = Array.from(new Set(archives.map((a) => a.year))).filter(Boolean).sort();
  const months = selectedYear 
    ? Array.from(new Set(archives.filter((a) => a.year === selectedYear).map((a) => a.month))).filter(Boolean)
    : [];
  const days = selectedYear && selectedMonth
    ? Array.from(new Set(archives.filter((a) => a.year === selectedYear && a.month === selectedMonth).map((a) => a.day))).filter(Boolean)
    : [];
  const folderCategories = ["MPs", "Ministers", "Chief Ministers", "Governors", "Constitutional Authorities"];

  // Filter letter results based on search input OR explorer clicks
  const filteredLetterArchives = archives.filter((a) => {
    // 1. Exploration filters
    if (selectedYear && a.year !== selectedYear) return false;
    if (selectedMonth && a.month !== selectedMonth) return false;
    if (selectedDay && a.day !== selectedDay) return false;
    if (selectedCategoryFolder && classifyCategory(a.category) !== selectedCategoryFolder) return false;

    // 2. Query filters
    if (searchTerm && !a.vipName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (searchCategory && !a.category.toLowerCase().includes(searchCategory.toLowerCase())) return false;
    if (filterStartDate && a.dateGenerated !== filterStartDate) return false;

    return true;
  });

  // Client side bulk ZIP download handler using jszip
  const handleBulkZipDownload = async () => {
    if (filteredLetterArchives.length === 0) {
      alert("No letters are currently filtered. Adjust search or folders to bundle a ZIP file.");
      return;
    }

    const zip = new JSZip();
    const folderName = `Birthday_Letters_Bundle_${Date.now()}`;
    const mainFolder = zip.folder(folderName);

    filteredLetterArchives.forEach((a) => {
      // Create subfolder tree inside the ZIP: Year/Month/Date/Category
      const catDir = classifyCategory(a.category);
      const subPath = `${a.year}/${a.month}/${a.day}/${catDir}`;
      const pathFolder = mainFolder?.folder(subPath);
      
      // Convert HTML mockup into simple ms-word loadable binary string
      const wordMarkup = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>@page { size: 8.5in 11in; margin: 1in; } body { font-family: Georgia, serif; }</style>
        </head>
        <body>${a.content}</body>
        </html>
      `;
      pathFolder?.file(a.fileName, wordMarkup);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("ZIP encoding failed: " + e.message);
    }
  };

  const clearFolderSelection = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");
    setSelectedCategoryFolder("");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-fade-in" id="archives-tab">
      
      {/* Search and control banner */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-500" />
              Administrative Filing Vault
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Browse hierarchical correspondence archives and generate zip bundles</p>
          </div>
          <button
            onClick={handleBulkZipDownload}
            disabled={filteredLetterArchives.length === 0}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Bundle & Download ZIP ({filteredLetterArchives.length})
          </button>
        </div>

        {/* Dynamic Multi Column search inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by Dignitary Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by Category..."
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Vault Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Explorer Vault Tree visual panel */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider"> Filer Navigator</div>
            {(selectedYear || selectedMonth || selectedDay || selectedCategoryFolder) && (
              <button 
                onClick={clearFolderSelection}
                className="text-[10px] text-amber-600 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Directory Hierarchy list representation */}
          <div className="space-y-3 pt-2 text-xs font-semibold">
            <div className="flex items-center gap-2 text-amber-700 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
              <FolderOpen className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Birthday Letters /</span>
            </div>

            {/* Folder 1: Year selection container */}
            <div className="pl-4 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Select Year</span>
              <div className="space-y-1">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setSelectedYear(y); setSelectedMonth(""); setSelectedDay(""); setSelectedCategoryFolder(""); }}
                    className={`w-full text-left p-1.5 rounded transition-all flex items-center gap-2 ${
                      selectedYear === y ? "bg-slate-100 text-slate-800 font-extrabold border-l-2 border-slate-700" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5 shrink-0" />
                    <span>{y}</span>
                  </button>
                ))}
                {years.length === 0 && <span className="text-slate-400 font-normal italic block p-1">No folders registered</span>}
              </div>
            </div>

            {/* Folder 2: Month selection container */}
            {selectedYear && (
              <div className="pl-8 space-y-2 animate-fade-in">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Select Month</span>
                <div className="space-y-1">
                  {months.map((m) => (
                    <button
                      key={m}
                      onClick={() => { setSelectedMonth(m); setSelectedDay(""); setSelectedCategoryFolder(""); }}
                      className={`w-full text-left p-1.5 rounded transition-all flex items-center gap-2 ${
                        selectedMonth === m ? "bg-slate-100 text-slate-800 font-extrabold border-l-2 border-slate-700" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 shrink-0" />
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Folder 3: Day selection container */}
            {selectedYear && selectedMonth && (
              <div className="pl-12 space-y-2 animate-fade-in">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Select Date</span>
                <div className="space-y-1">
                  {days.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDay(d); setSelectedCategoryFolder(""); }}
                      className={`w-full text-left p-1.5 rounded transition-all flex items-center gap-2 ${
                        selectedDay === d ? "bg-slate-100 text-slate-800 font-extrabold border-l-2 border-slate-700" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 shrink-0" />
                      <span>Day {d}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Folder 4: Specific category classifier visual selector */}
            {selectedYear && selectedMonth && selectedDay && (
              <div className="pl-16 space-y-2 animate-fade-in">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Category Folder</span>
                <div className="space-y-1">
                  {folderCategories.map((fCat) => (
                    <button
                      key={fCat}
                      onClick={() => setSelectedCategoryFolder(fCat)}
                      className={`w-full text-left p-1.5 rounded transition-all flex items-center gap-2 ${
                        selectedCategoryFolder === fCat ? "bg-slate-100 text-slate-800 font-extrabold border-l-2 border-slate-700" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{fCat}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: List representation of files inside directory */}
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 justify-between items-center text-xs font-semibold select-none">
            <span className="text-slate-500 uppercase font-mono text-[10px]">
              Files Matching Criteria ({filteredLetterArchives.length})
            </span>
            <div className="text-slate-400 font-mono text-[10px]">
              Path: Birthday Letters / {selectedYear || "*"}{selectedMonth ? ` / ${selectedMonth}` : ""}{selectedDay ? ` / Day ${selectedDay}` : ""}{selectedCategoryFolder ? ` / ${selectedCategoryFolder}` : ""}
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {filteredLetterArchives.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest font-mono font-bold">
                    <th className="p-4">Dignitary Name</th>
                    <th className="p-4">Classification</th>
                    <th className="p-4">File Name</th>
                    <th className="p-4">Delivery Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLetterArchives.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{a.vipName}</div>
                        <div className="text-[10px] text-slate-400">{a.designation}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold">
                          {classifyCategory(a.category)}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500 font-medium truncate max-w-xs" title={a.fileName}>
                        {a.fileName}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-600">{a.letterDate}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-mono">Run: {a.dateGenerated}</div>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onOpenDocument(a)}
                          className="px-2.5 py-1.5 border border-slate-200 hover:border-amber-500 rounded bg-white hover:bg-amber-500/10 hover:text-amber-700 transition-colors text-slate-600 inline-flex items-center gap-1 font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete this letter archive entry?`)) {
                              onDeleteDocument(a.id);
                            }
                          }}
                          className="p-1.5 border border-slate-200 hover:border-rose-500 rounded bg-white hover:bg-rose-500/10 hover:text-rose-700 transition-colors text-slate-400 inline-flex"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center space-y-3 self-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Folder Category holds no files</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Try launching a daily automated birthday run or click 'Clear Filters' to browse full archives.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
