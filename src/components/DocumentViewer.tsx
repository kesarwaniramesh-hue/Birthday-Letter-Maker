import React, { useState } from "react";
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  ClipboardCheck,
  Award
} from "lucide-react";
import { LetterArchive } from "../types";

interface DocumentViewerProps {
  archive: LetterArchive;
  onClose: () => void;
  onUpdateContent?: (id: string, newContent: string) => void;
}

export default function DocumentViewer({ archive, onClose, onUpdateContent }: DocumentViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>(archive.content);

  // HTML to MS Word .doc download handler with embedded XML layout rules
  const handleDownloadWord = () => {
    const htmlContent = isEditing ? editedContent : archive.content;
    
    // Construct valid Word Document XML HTML container
    const documentTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${archive.fileName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 8.5in 11in;
            margin: 1.0in 1.0in 1.0in 1.0in;
            mso-header-margin: 0.5in;
            mso-footer-margin: 0.5in;
          }
          body {
            font-family: "Georgia", serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1e293b;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    // Create file blob
    const blob = new Blob(["\ufeff" + documentTemplate], {
      type: "application/msword;charset=utf-8"
    });

    // Handle standard anchor download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Strict requirement naming: Birthday Letter - Name - DD-MM-YYYY.docx
    link.download = archive.fileName.endsWith(".doc") 
      ? archive.fileName.replace(".doc", ".docx") 
      : archive.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safe browser printing module
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker prevented launching direct print sheet. Enable permissions or use Print button.");
      return;
    }

    const currentLetterMarkup = isEditing ? editedContent : archive.content;

    printWindow.document.write(`
      <html>
        <head>
          <title>${archive.fileName}</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 1.5in;
                background: #fff;
              }
              #letter-container {
                border: none !important;
                padding: 0 !important;
                max-width: 100% !important;
                box-shadow: none !important;
              }
            }
            body {
              font-family: "Georgia", serif;
              background: #f1f5f9;
              display: flex;
              justify-content: center;
              padding: 40px;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${currentLetterMarkup}
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleApplyEdits = () => {
    if (onUpdateContent) {
      onUpdateContent(archive.id, editedContent);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold font-display text-sm truncate text-slate-100">{archive.vipName}</h3>
              <p className="text-[10px] text-slate-400 font-mono items-center gap-1.5 flex select-all truncate">
                {archive.fileName}
              </p>
            </div>
          </div>

          {/* Interactive Document controls */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            {/* Font Sizing toggle */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 select-none">
              <button 
                onClick={() => setFontSize("sm")} 
                className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${fontSize === "sm" ? "bg-slate-700 text-amber-400 font-extrabold" : "text-slate-400 hover:text-slate-200"}`}
              >
                A-
              </button>
              <button 
                onClick={() => setFontSize("base")} 
                className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${fontSize === "base" ? "bg-slate-700 text-amber-400 font-extrabold" : "text-slate-400 hover:text-slate-200"}`}
              >
                A
              </button>
              <button 
                onClick={() => setFontSize("lg")} 
                className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${fontSize === "lg" ? "bg-slate-700 text-amber-400 font-extrabold" : "text-slate-400 hover:text-slate-200"}`}
              >
                A+
              </button>
            </div>

            {/* Editing triggers */}
            {onUpdateContent && (
              <button
                onClick={() => {
                  if (isEditing) {
                    handleApplyEdits();
                  } else {
                    setEditedContent(archive.content);
                    setIsEditing(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                  isEditing 
                    ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white" 
                    : "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-amber-400 text-slate-300"
                }`}
              >
                {isEditing ? "Save Edits" : "Edit Letter Source"}
              </button>
            )}

            {/* Actions triggers */}
            <button
              onClick={handleDownloadWord}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download Word (.docx)
            </button>
            
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-slate-100 rounded-lg flex items-center gap-1 font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Workspace Viewport */}
        <div className="flex-1 bg-slate-100 overflow-y-auto p-8 flex justify-center items-start">
          
          {isEditing ? (
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col h-[75vh]">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-3 font-mono">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                Raw HTML Content Editor Mode. Placeholders evaluated.
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="flex-grow w-full p-4 font-mono text-xs text-amber-500 bg-slate-950 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none rounded-xl"
              />
            </div>
          ) : (
            <div 
              id="printed-letter-viewport"
              className={`bg-white border border-slate-200 shadow-xl rounded-lg p-16 w-full max-w-4.5xl transition-all duration-300 overflow-hidden relative select-all ${
                fontSize === "sm" ? "text-stone-700 text-sm" : fontSize === "lg" ? "text-stone-900 text-lg" : "text-stone-800 text-base"
              }`}
              style={{ minHeight: "11in" }}
            >
              {/* Optional Watermark indicator visual overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none rotate-315">
                <Award className="w-[500px] h-[500px] text-stone-900" />
              </div>

              {/* Injected Content */}
              <div dangerouslySetInnerHTML={{ __html: archive.content }} />
            </div>
          )}
        </div>

        {/* Status footer inside viewer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 text-slate-500 text-[10px] flex justify-between items-center font-mono">
          <span>PIPELINE ENGINE LEVEL 4.0 GENERATION • DIGITALLY SIGNED</span>
          <span className="flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
            READY FOR POSTAL DISPATCH
          </span>
        </div>
      </div>
    </div>
  );
}
