import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Check, 
  AlertCircle,
  Clock,
  Filter,
  CheckCircle2,
  Database
} from "lucide-react";
import { VipRecord, SUPPORTED_CATEGORIES } from "../types";

interface DatabaseManagerProps {
  vips: VipRecord[];
  addVip: (vip: VipRecord) => Promise<void>;
  updateVip: (id: string, fields: Partial<VipRecord>) => Promise<void>;
  deleteVip: (id: string) => Promise<void>;
  importVipsFromFile: (file: File) => Promise<number>;
  resetSystemDatabase: () => Promise<void>;
}

export default function DatabaseManager({
  vips,
  addVip,
  updateVip,
  deleteVip,
  importVipsFromFile,
  resetSystemDatabase
}: DatabaseManagerProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingVip, setEditingVip] = useState<VipRecord | null>(null);

  // File uploading states
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  // Fields state for Addition/Updates
  const [formName, setFormName] = useState("");
  const [formGender, setFormGender] = useState<"Male" | "Female">("Male");
  const [formDob, setFormDob] = useState("1970-01-01");
  const [formCategory, setFormCategory] = useState(SUPPORTED_CATEGORIES[0]);
  const [formDesignation, setFormDesignation] = useState("");
  const [formMinistry, setFormMinistry] = useState("");
  const [formHouse, setFormHouse] = useState("");
  const [formConstituency, setFormConstituency] = useState("");
  const [formState, setFormState] = useState("");
  const [formParty, setFormParty] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formSalutation, setFormSalutation] = useState("Respected Sir");
  const [formPriority, setFormPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [formRemarks, setFormRemarks] = useState("");

  // Process manual additions
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDesignation || !formAddress) {
      alert("Name, Designation, and Address are required fields.");
      return;
    }

    const newVip: VipRecord = {
      id: "vip_" + Date.now(),
      name: formName,
      gender: formGender,
      dob: formDob,
      category: formCategory,
      designation: formDesignation,
      ministry: formMinistry,
      house: formHouse,
      constituency: formConstituency,
      state: formState,
      politicalParty: formParty,
      address: formAddress,
      email: formEmail,
      mobile: formMobile,
      salutation: formSalutation,
      priority: formPriority,
      remarks: formRemarks
    };

    addVip(newVip);
    setShowAddModal(false);
    resetForm();
  };

  // Populate form for editing
  const handleStartEdit = (vip: VipRecord) => {
    setEditingVip(vip);
    setFormName(vip.name);
    setFormGender(vip.gender);
    setFormDob(vip.dob);
    setFormCategory(vip.category);
    setFormDesignation(vip.designation);
    setFormMinistry(vip.ministry || "");
    setFormHouse(vip.house || "");
    setFormConstituency(vip.constituency || "");
    setFormState(vip.state || "");
    setFormParty(vip.politicalParty || "");
    setFormAddress(vip.address);
    setFormEmail(vip.email || "");
    setFormMobile(vip.mobile || "");
    setFormSalutation(vip.salutation);
    setFormPriority(vip.priority);
    setFormRemarks(vip.remarks || "");
    setShowAddModal(true);
  };

  // Submit edits
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVip) return;

    const fields: Partial<VipRecord> = {
      name: formName,
      gender: formGender,
      dob: formDob,
      category: formCategory,
      designation: formDesignation,
      ministry: formMinistry,
      house: formHouse,
      constituency: formConstituency,
      state: formState,
      politicalParty: formParty,
      address: formAddress,
      email: formEmail,
      mobile: formMobile,
      salutation: formSalutation,
      priority: formPriority,
      remarks: formRemarks
    };

    updateVip(editingVip.id, fields);
    setEditingVip(null);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingVip(null);
    setFormName("");
    setFormGender("Male");
    setFormDob("1970-01-01");
    setFormCategory(SUPPORTED_CATEGORIES[0]);
    setFormDesignation("");
    setFormMinistry("");
    setFormHouse("");
    setFormConstituency("");
    setFormState("");
    setFormParty("");
    setFormAddress("");
    setFormEmail("");
    setFormMobile("");
    setFormSalutation("Respected Sir");
    setFormPriority("Medium");
    setFormRemarks("");
  };

  // File Upload Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setImportStatus({ msg: `Analyzing structure of "${file.name}"...` });
    try {
      const count = await importVipsFromFile(file);
      setImportStatus({
        success: true,
        msg: `Successfully parsed and recorded ${count} VIP entries into Database!`
      });
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      setImportStatus({
        success: false,
        msg: `Parse error: ${err.message || "Failed decoding spreadsheet matrix"}`
      });
    }
  };

  // Filter VIP rows
  const filteredVips = vips.filter((vip) => {
    const matchesSearch = 
      vip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vip.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vip.constituency && vip.constituency.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vip.state && vip.state.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "" || vip.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-8 animate-fade-in" id="database-tab">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">VIP Master Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">Maintain, import and update target birthday profiles</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              if(confirm("This will overwrite custom lists and load initial official test VIP databases. Proceed?")) {
                resetSystemDatabase();
              }
            }}
            className="px-3.5 py-2 hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Dignitary
          </button>
        </div>
      </div>

      {/* Database Import Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Interface */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-500" />
              Database Bulk Import Module
            </h3>
            <p className="text-xs text-slate-400">
              Directly parse spreadsheet tables or MS Access databases. The engine matches columns like "Name", "Date of Birth", and "Designation".
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center my-4 transition-all duration-200 flex flex-col justify-center items-center ${
              dragActive 
                ? "border-amber-500 bg-amber-500/5" 
                : "border-slate-200 hover:border-amber-400 hover:bg-slate-50/50"
            }`}
          >
            <Database className="w-8 h-8 text-amber-500/80 mb-2" />
            <p className="text-xs font-semibold text-slate-700">Drag & Drop master database files</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supports .xlsx, .csv, and MS Access .mdb/.accdb</p>
            
            <label className="mt-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-lg text-[10px] lowercase tracking-wider cursor-pointer shadow-xs">
              Browse Files...
              <input
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv, .accdb, .mdb"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Import Log status */}
          {importStatus && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              importStatus.success === true 
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                : importStatus.success === false
                  ? "bg-rose-50 border border-rose-200 text-rose-800"
                  : "bg-slate-100 border border-slate-200 text-slate-600 animate-pulse"
            }`}>
              {importStatus.success === true ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              )}
              <span className="leading-tight font-medium">{importStatus.msg}</span>
            </div>
          )}
        </div>

        {/* Database Search & Statistics */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Master Registry size</span>
              <h4 className="text-2xl font-bold text-slate-800 mt-1">{vips.length} VIPs</h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">MPs Listed</span>
              <h4 className="text-2xl font-bold text-slate-800 mt-1">
                {vips.filter(v => v.category.startsWith("MP")).length} Members
              </h4>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Cabinet / Ministers</span>
              <h4 className="text-2xl font-bold text-slate-800 mt-1">
                {vips.filter(v => v.category.includes("Minister")).length} Officers
              </h4>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                Category Filter
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="">All Categories</option>
                {SUPPORTED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                Full-Field Directory Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, state, constituency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Register grid representation */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-slate-600 font-mono uppercase">VIP Database Records ({filteredVips.length})</span>
        </div>
        <div className="overflow-x-auto">
          {filteredVips.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest font-mono font-bold">
                  <th className="p-4">Dignitary details</th>
                  <th className="p-4">Category / Level</th>
                  <th className="p-4">DoB / Gender</th>
                  <th className="p-4">House & Constituency</th>
                  <th className="p-4">Registered Contact / Address</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVips.map((vip) => (
                  <tr key={vip.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{vip.name}</div>
                      <div className="text-[10px] text-slate-400">{vip.designation}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-600">{vip.category}</div>
                      <div className="text-[10px]">
                        Priority: 
                        <span className={`ml-1 font-bold ${
                          vip.priority === "High" ? "text-rose-600" : vip.priority === "Medium" ? "text-amber-600" : "text-blue-600"
                        }`}>
                          {vip.priority}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono">{vip.dob}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{vip.gender}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 font-medium">{vip.house || "N/A"}</div>
                      <div className="text-[10px] text-slate-400">{vip.constituency ? `${vip.constituency}, ${vip.state}` : vip.state || "National"}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 max-w-sm font-medium leading-relaxed truncate" title={vip.address}>
                        {vip.address}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {vip.email && `${vip.email} | `}{vip.mobile}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleStartEdit(vip)}
                        className="p-1 px-2 border border-slate-200 hover:border-amber-500 rounded bg-white hover:bg-amber-500/10 hover:text-amber-700 text-slate-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove records for ${vip.name} permamently?`)) {
                            deleteVip(vip.id);
                          }
                        }}
                        className="p-1 px-2 border border-slate-200 hover:border-rose-500 rounded bg-white hover:bg-rose-500/10 hover:text-rose-700 text-slate-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-1">
              <p className="text-xs">No VIP register records discovered</p>
              <p className="text-[10px] text-slate-500">Clarify searched details or adjust category filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Profile Overlay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold font-display text-slate-100">
                {editingVip ? `Modify Dignitary Profile — ${editingVip.name}` : "Create New Dignitary Profile"}
              </h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            {/* Fields Form Content */}
            <form onSubmit={editingVip ? handleSubmitEdit : handleSubmitAdd} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 text-xs">
              
              <div>
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Dignitary Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Om Birla"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Salutation Text *</label>
                <input
                  type="text"
                  required
                  value={formSalutation}
                  onChange={(e) => setFormSalutation(e.target.value)}
                  placeholder="e.g. Respected Shri Om Birla Ji"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Dignitary Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                >
                  {SUPPORTED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Designation Label *</label>
                <input
                  type="text"
                  required
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  placeholder="e.g. Speaker, Lok Sabha"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Gender *</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none animate-pulse"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🔵 Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Union Ministry (Optional)</label>
                <input
                  type="text"
                  value={formMinistry}
                  onChange={(e) => setFormMinistry(e.target.value)}
                  placeholder="e.g. Ministry of External Affairs"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">House (Optional)</label>
                  <input
                    type="text"
                    value={formHouse}
                    onChange={(e) => setFormHouse(e.target.value)}
                    placeholder="e.g. Lok Sabha"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Political Party (Optional)</label>
                  <input
                    type="text"
                    value={formParty}
                    onChange={(e) => setFormParty(e.target.value)}
                    placeholder="e.g. BJP, INC"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Constituency (Optional)</label>
                  <input
                    type="text"
                    value={formConstituency}
                    onChange={(e) => setFormConstituency(e.target.value)}
                    placeholder="e.g. Varanasi"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">State / Region (Optional)</label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="dignitary@sansad.nic.in"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Mobile Phone / Contact</label>
                  <input
                    type="text"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder="+91-11-230XXXXX"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Official Postal Address *</label>
                <textarea
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Full physical address for print correspondence..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-500 uppercase font-mono tracking-wider mb-1">Remarks / Office Notes</label>
                <input
                  type="text"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="Internal administrative coordination flags..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex justify-end gap-2 border-t border-slate-200 pt-4 mt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-150 text-slate-700 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 font-bold rounded-xl text-xs text-white hover:bg-slate-950 shadow-md"
                >
                  {editingVip ? "Apply Changes" : "Create VIP Bio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
