import React, { useState } from "react";
import { 
  Send, 
  Printer, 
  Mail, 
  FileCheck, 
  Clipboard, 
  Check, 
  Search, 
  FileText, 
  Clock,
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import { LetterArchive, DispatchLog } from "../types";

interface EmailDispatchProps {
  archives: LetterArchive[];
  dispatches: DispatchLog[];
  addDispatchLog: (log: DispatchLog) => Promise<void>;
}

export default function EmailDispatch({
  archives,
  dispatches,
  addDispatchLog
}: EmailDispatchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingEmail, setSendingEmail] = useState<LetterArchive | null>(null);
  
  // Simulated State fields for Email send dialog
  const [emailSubject, setEmailSubject] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailNotes, setEmailNotes] = useState("");
  const [emailIsSending, setEmailIsSending] = useState(false);

  // Address Mailing label sizing state
  const [labelCols, setLabelCols] = useState<number>(3); // Standard 3-column label sheet
  const [labelFontSize, setLabelFontSize] = useState<number>(11);

  // Filter archives with birthdays matching selected terms (to print envelopes for)
  const filteredArchives = archives.filter((a) => 
    a.vipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers for simulated email transmission
  const handleOpenEmailForm = (arch: LetterArchive) => {
    setSendingEmail(arch);
    setEmailSubject(`Warmest Birthday Felicitations and Sincere Greetings`);
    setEmailRecipient(`${arch.vipName.replaceAll(" ", ".").toLowerCase()}@sansad.nic.in`);
    setEmailNotes(`Assigned Ref Code: PARL/DISPATCH/${Date.now().toString().slice(-4)}`);
  };

  const handleSendMockEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendingEmail || !emailRecipient) return;

    setEmailIsSending(true);
    
    // Simulate SMTP network delays
    setTimeout(async () => {
      const logEntry: DispatchLog = {
        id: "disp_" + Date.now(),
        archiveId: sendingEmail.id,
        vipName: sendingEmail.vipName,
        date: new Date().toISOString().split("T")[0],
        method: "Email",
        recipientAddress: emailRecipient,
        status: "Dispatched",
        trackingNumber: `SMTP-TLS-${Date.now().toString().slice(-6)}`
      };

      await addDispatchLog(logEntry);
      setEmailIsSending(false);
      setSendingEmail(null);
      alert(`Simulated official correspondence transmission to ${sendingEmail.vipName} completed successfully! Dispatch logged.`);
    }, 1500);
  };

  // Printable Address Sheet generator trigger HTML Window
  const handlePrintAddressLabels = () => {
    const labelWindow = window.open("", "_blank");
    if (!labelWindow) {
      alert("Please allow popups to compile address labels.");
      return;
    }

    const gridCols = labelCols === 2 ? "grid-template-columns: repeat(2, 1fr);" : "grid-template-columns: repeat(3, 1fr);";
    
    // Generate label elements
    let elementsHTML = "";
    filteredArchives.forEach((a) => {
      elementsHTML += `
        <div class="mailing-label">
          <div class="header-seal font-serif">OFFICIAL SPEED POST CORRESPONDENCE</div>
          <div class="addressee">To,</div>
          <div class="name"><strong>${a.vipName}</strong></div>
          <div class="desig">${a.designation} (${classifyCategoryLabel(a.category)})</div>
          <div class="street">VIP Administrative Quarters / Official Residence</div>
          <div class="tracking font-mono text-[9px]">DOC-ID: ${a.id.toUpperCase()}</div>
        </div>
      `;
    });

    labelWindow.document.write(`
      <html>
        <head>
          <title>Mailing Labels Print Preview</title>
          <style>
            @media print {
              body { margin: 0; background: #fff; }
              .label-grid { gap: 0.1in; padding: 0.25in; }
              .mailing-label { border: 1px dashed #94a3b8; page-break-inside: avoid; }
            }
            body { font-family: "Georgia", serif; background: #f8fafc; padding: 20px; }
            .label-grid {
              display: grid;
              ${gridCols}
              gap: 15px;
            }
            .mailing-label {
              background: #fff;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 15px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              font-size: ${labelFontSize}px;
              line-height: 1.4;
              height: 1.5in;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header-seal {
              font-size: 8px;
              color: #b45309;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              border-bottom: 2px double #b45309;
              padding-bottom: 3px;
              margin-bottom: 5px;
              font-family: sans-serif;
              font-weight: bold;
            }
            .addressee { font-style: italic; color: #64748b; font-size: 10px; }
            .name { font-size: ${labelFontSize + 2}px; color: #0f172a; }
            .desig { font-size: ${labelFontSize - 1}px; color: #475569; }
            .street { font-size: ${labelFontSize - 2}px; color: #475569; }
            .tracking { color: #94a3b8; margin-top: auto; font-family: monospace; font-size: 8px; text-align: right; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label-grid">
            ${elementsHTML}
          </div>
        </body>
      </html>
    `);
    
    labelWindow.document.close();
  };

  const classifyCategoryLabel = (cat: string) => {
    if (cat.startsWith("MP")) return "Member of Parliament";
    return cat;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-fade-in" id="dispatch-tab">
      
      {/* Configuration Header / Tuning Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Settings Module Mailer Parameter */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-amber-500" />
            Envelope Label Formulations
          </h3>
          <p className="text-xs text-slate-400">
            Dynamically compile official print coordinates on standard envelope label sheets before physical dispatch.
          </p>

          {/* Sizing sliders */}
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-1">Mailing Sheet Columns</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setLabelCols(2)}
                  className={`py-1 text-[10px] font-bold rounded ${labelCols === 2 ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                >
                  2 Columns (Large)
                </button>
                <button 
                  onClick={() => setLabelCols(3)}
                  className={`py-1 text-[10px] font-bold rounded ${labelCols === 3 ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                >
                  3 Columns (Standard)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-1">Label Print Font family size ({labelFontSize}px)</label>
              <input
                type="range"
                min="9"
                max="15"
                value={labelFontSize}
                onChange={(e) => setLabelFontSize(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-200 rounded"
              />
            </div>

            <button
              onClick={handlePrintAddressLabels}
              disabled={filteredArchives.length === 0}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-45"
            >
              <Printer className="w-3.5 h-3.5" />
              Compile Mailing Labels ({filteredArchives.length})
            </button>
          </div>
        </div>

        {/* Directory Search & Filters */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between self-stretch">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-500" />
              Dispatch Queue Pipeline
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compile letters and select appropriate dispatch channels. All logged dispatch interactions are recorded inside the administrative registry log on the server.
            </p>
          </div>

          <div className="relative mt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search documents queue in vault..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Bottom list halves: Dispatch register logs OR Letters Ready queue */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 1. Letters Queue section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-xs font-mono uppercase tracking-widest text-slate-600">Pending Archives Queue</h3>
          </div>
          <div className="overflow-y-auto max-h-[350px]">
            {filteredArchives.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest font-mono font-bold">
                    <th className="p-3">Addressee VIP</th>
                    <th className="p-3">File Reference</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArchives.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/20">
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{a.vipName}</div>
                        <div className="text-[10px] text-slate-400">{a.category}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-400 truncate max-w-40">{a.fileName}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenEmailForm(a)}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 font-bold rounded text-slate-950 inline-flex items-center gap-1 text-[11px]"
                        >
                          <Send className="w-3 h-3" />
                          Simulate dispatch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400 italic">No corresponding records prepared in pipeline.</div>
            )}
          </div>
        </div>

        {/* 2. Dispatch register logs section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-xs font-mono uppercase tracking-widest text-slate-600">Administrative Dispatch Register</h3>
          </div>
          <div className="overflow-y-auto max-h-[350px]">
            {dispatches.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest font-mono font-bold">
                    <th className="p-3">VIP Name</th>
                    <th className="p-3">Delivery channel</th>
                    <th className="p-3">Logged Date</th>
                    <th className="p-3">Receipt Index / ID</th>
                    <th className="p-3 text-right">Confirmation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {dispatches.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/20">
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{log.vipName}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate max-w-40">{log.recipientAddress}</div>
                      </td>
                      <td className="p-3 text-slate-600">{log.method}</td>
                      <td className="p-3 font-mono">{log.date}</td>
                      <td className="p-3 font-mono text-slate-500">{log.trackingNumber || "N/A"}</td>
                      <td className="p-3 text-right">
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-mono uppercase">
                          <Check className="w-3 h-3" />
                          Sent
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-slate-400 space-y-1">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Mailing Register is empty</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">No dispatched transactions recorded. Simulated emails are logged instantly.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Email sending dialog overlay modal */}
      {sendingEmail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <h4 className="font-bold text-sm font-display flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500 animate-pulse" />
                Dignitary SMTP Dispatch Simulator
              </h4>
              <button onClick={() => setSendingEmail(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSendMockEmail} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">Target Dignitary Name</label>
                <input
                  type="text"
                  disabled
                  value={sendingEmail.vipName}
                  className="w-full bg-slate-100 text-slate-600 border border-slate-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">Sender SMTP Relay</label>
                <input
                  type="text"
                  disabled
                  value="office.dispatch-bureau@sansad.nic.in"
                  className="w-full bg-slate-150 text-slate-500 border border-slate-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="e.g. om.birla@sansad.nic.in"
                  className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">Correspondence Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-mono uppercase">Mailing System Notes</label>
                <input
                  type="text"
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-2 focus:outline-none text-[10px] font-mono text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setSendingEmail(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-[11px] font-bold hover:bg-slate-100 text-slate-600 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailIsSending}
                  className="px-5 py-2 bg-slate-900 font-extrabold rounded-lg text-[11px] text-white hover:bg-black shadow-md flex items-center gap-1.5"
                >
                  {emailIsSending ? (
                    <>
                      <div className="w-3 w-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                      Executing SMTP TLS connection...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Dispatch Simulated Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
