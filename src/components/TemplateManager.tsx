import React, { useState } from "react";
import { 
  FileCode, 
  Plus, 
  Copy, 
  Trash2, 
  Edit3, 
  Eye, 
  BadgeHelp,
  BookOpen,
  X,
  FileCheck
} from "lucide-react";
import { Template, SUPPORTED_CATEGORIES } from "../types";

interface TemplateManagerProps {
  templates: Template[];
  addTemplate: (tmpl: Template) => Promise<void>;
  updateTemplate: (id: string, fields: Partial<Template>) => Promise<void>;
  cloneTemplate: (tmpl: Template) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export default function TemplateManager({
  templates,
  addTemplate,
  updateTemplate,
  cloneTemplate,
  deleteTemplate
}: TemplateManagerProps) {
  const [editingTmpl, setEditingTmpl] = useState<Template | null>(null);
  const [previewTmpl, setPreviewTmpl] = useState<Template | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(SUPPORTED_CATEGORIES[0]);
  const [formSubject, setFormSubject] = useState("Heartiest Birthday Congratulations & Salutations");
  const [formContent, setFormContent] = useState("");

  const handleStartCreate = () => {
    setFormName("Custom Template #" + (templates.length + 1));
    setFormCategory(SUPPORTED_CATEGORIES[0]);
    setFormSubject("Heartiest Congratulations on your Birthday");
    setFormContent(`<div style="font-family: 'Georgia', serif; padding: 35px; border: 1px solid #ddd; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: #fff;">
  <h2 style="text-align: center; color: #1e3a8a; font-family: sans-serif; text-transform: uppercase;">OFFICIAL CORRESPONDENCE</h2>
  <hr/>
  <p>Date: {{CURRENT_DATE}}</p>
  <p>To,</p>
  <p><strong>Shri {{NAME}}</strong><br/>Hon'ble {{DESIGNATION}}<br/>{{ADDRESS}}</p>
  <p>{{SALUTATION}},</p>
  <p>My heartiest greetings to you on your {{AGE}} birthday milestone. Your diligent devotion to steering state public matters has enriched democratic welfare.</p>
  <p>{{AI_BIRTHDAY_MESSAGE}}</p>
  <p>Your record details: {{AI_PROFILE_SUMMARY}}</p>
  <p>Looking back, your record speaks of these achievements:</p>
  {{AI_ACHIEVEMENTS}}
  <p>With Warm Regards,</p>
  <p style="margin-top: 30px; border-top: 1px solid #eee; pt: 15px;"><strong>Administrative Director</strong></p>
</div>`);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formContent) {
      alert("Name and Content are required template parameters.");
      return;
    }

    const newTmpl: Template = {
      id: "tmpl_" + Date.now(),
      name: formName,
      category: formCategory,
      subject: formSubject,
      content: formContent
    };

    addTemplate(newTmpl);
    setShowCreateModal(false);
  };

  const handleStartEdit = (tmpl: Template) => {
    setEditingTmpl(tmpl);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTmpl) return;

    updateTemplate(editingTmpl.id, {
      name: editingTmpl.name,
      category: editingTmpl.category,
      subject: editingTmpl.subject,
      content: editingTmpl.content
    });

    setEditingTmpl(null);
  };

  const dynamicVariables = [
    { code: "{{NAME}}", desc: "Full official name of high dignitary" },
    { code: "{{DOB}}", desc: "Date of Birth (YYYY-MM-DD)" },
    { code: "{{AGE}}", desc: "Age calculated on letter delivery run" },
    { code: "{{YEARS_COMPLETED}}", desc: "Equivalent to calculated milestones" },
    { code: "{{CURRENT_DATE}}", desc: "Today's human-readable letter date" },
    { code: "{{CATEGORY}}", desc: "Constitutional categorization label" },
    { code: "{{DESIGNATION}}", desc: "Official title designation" },
    { code: "{{HOUSE}}", desc: "House of Parliament (e.g. Lok Sabha)" },
    { code: "{{CONSTITUENCY}}", desc: "Elected constituency details" },
    { code: "{{MINISTRY}}", desc: "Assigned Union Ministry details" },
    { code: "{{PARTY}}", desc: "Political affiliate ticker" },
    { code: "{{ADDRESS}}", desc: "Official printed address coordinates" },
    { code: "{{SALUTATION}}", desc: "Custom salutation field" },
    { code: "{{AI_BIRTHDAY_MESSAGE}}", desc: "Generative respectful formal greeting paragraph" },
    { code: "{{AI_PROFILE_SUMMARY}}", desc: "Generative summary profile of dedication" },
    { code: "{{AI_ACHIEVEMENTS}}", desc: "Generative listing of 2-3 formal policy achievements" }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-fade-in" id="templates-tab">
      
      {/* Header card banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Template Administration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control layout body schemas and automate placeholder mapping</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Custom Template
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Directory list of templates */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-widest px-1">Registered templates ({templates.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 font-display text-sm">{tmpl.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Assigned Category: {tmpl.category}</p>
                    </div>
                    <FileCheck className="w-5 h-5 text-amber-500/80" />
                  </div>
                  <div className="text-[10px] bg-slate-50 p-2.5 rounded border border-slate-100 font-mono text-slate-500 truncate">
                    Subject: {tmpl.subject}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-[10px] shrink-0 font-semibold text-slate-600">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleStartEdit(tmpl)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setPreviewTmpl(tmpl)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => cloneTemplate(tmpl)}
                      title="Clone Layout Schema"
                      className="p-1 px-1.5 border border-slate-200 rounded bg-white hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={templates.length <= 1}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${tmpl.name}"?`)) {
                          deleteTemplate(tmpl.id);
                        }
                      }}
                      title="Remove Template"
                      className="p-1 px-1.5 border border-slate-200 rounded bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Variable Handbook reference guide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs shrink-0 self-start">
          <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Dynamic Variable Guide
          </h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            These system tags are evaluated at letterhead-printing time, drawing values dynamically from active databases or the server AI engine.
          </p>

          <div className="space-y-2.5 overflow-y-auto max-h-[400px] border-t border-slate-100 pt-3">
            {dynamicVariables.map((v, i) => (
              <div key={i} className="flex justify-between items-start text-[10px] border-b border-dashed border-slate-100 pb-1.5">
                <code className="text-amber-600 font-mono font-bold shrink-0">{v.code}</code>
                <span className="text-slate-500 text-right pl-3 leading-relaxed">{v.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Overlay Screen */}
      {editingTmpl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold font-display text-slate-100">
                Markup Studio — {editingTmpl.name}
              </h3>
              <button onClick={() => setEditingTmpl(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Friendly Name</label>
                  <input
                    type="text"
                    required
                    value={editingTmpl.name}
                    onChange={(e) => setEditingTmpl({ ...editingTmpl, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Target Category Mapping</label>
                  <select
                    value={editingTmpl.category}
                    onChange={(e) => setEditingTmpl({ ...editingTmpl, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {SUPPORTED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Letter Reference Subject</label>
                  <input
                    type="text"
                    required
                    value={editingTmpl.subject}
                    onChange={(e) => setEditingTmpl({ ...editingTmpl, subject: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Editing Sandbox Workspace */}
              <div className="flex-1 flex flex-col overflow-hidden space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase font-mono tracking-wider shrink-0">HTML Content Source (W3C standard CSS is preserved)</label>
                <textarea
                  required
                  value={editingTmpl.content}
                  onChange={(e) => setEditingTmpl({ ...editingTmpl, content: e.target.value })}
                  className="flex-1 w-full p-4 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none overflow-y-auto"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTmpl(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-150 text-slate-600 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 font-bold rounded-xl text-xs text-white hover:bg-black shadow-md"
                >
                  Save Schema Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal Panel inline browser emulation */}
      {previewTmpl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h4 className="font-bold text-slate-800 text-sm font-display">HTML Template Emulation preview</h4>
              <button onClick={() => setPreviewTmpl(null)} className="text-slate-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              <div 
                className="bg-white p-6 border border-slate-200 rounded-lg shadow-xs pointer-events-none"
                dangerouslySetInnerHTML={{ __html: previewTmpl.content }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal View */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold font-display text-slate-100">Create New Letter Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col p-6 space-y-4 bg-slate-50 overflow-hidden text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Friendly Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Assign Category Mapping</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {SUPPORTED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="shrink-0">
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Subject Title Heading</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex-1 flex flex-col overflow-hidden space-y-1">
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider shrink-0">HTML Boilerplate Body (Includes CSS inline styles)</label>
                <textarea
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="flex-1 w-full p-4 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-150 text-slate-600 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 font-bold rounded-xl text-xs text-white hover:bg-slate-950 shadow-md"
                >
                  Assemble Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
