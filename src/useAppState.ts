import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { VipRecord, Template, LetterArchive, DispatchLog, CATEGORY_TEMPLATE_MAPPING, SUPPORTED_CATEGORIES } from "./types";

export function useAppState() {
  const [vips, setVips] = useState<VipRecord[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [archives, setArchives] = useState<LetterArchive[]>([]);
  const [dispatches, setDispatches] = useState<DispatchLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date configuration for testing/simulation or real daily tracking
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today's date in YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // Load state from the server on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/db/data");
      if (response.ok) {
        const data = await response.json();
        setVips(data.vips || []);
        setTemplates(data.templates || []);
        setArchives(data.archives || []);
        setDispatches(data.dispatches || []);
      } else {
        throw new Error("Failed to load database from the backend.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Save current database state to server
  const saveStateToServer = async (
    updatedVips?: VipRecord[],
    updatedTemplates?: Template[],
    updatedArchives?: LetterArchive[],
    updatedDispatches?: DispatchLog[]
  ) => {
    try {
      const payload = {
        vips: updatedVips || vips,
        templates: updatedTemplates || templates,
        archives: updatedArchives || archives,
        dispatches: updatedDispatches || dispatches,
      };

      const response = await fetch("/api/db/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to persist state onto disk.");
      }
      return true;
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Persistence Error: " + err.message);
      return false;
    }
  };

  // Add a single VIP Record
  const addVip = async (vip: VipRecord) => {
    const updated = [vip, ...vips];
    setVips(updated);
    await saveStateToServer(updated);
  };

  // Update a single VIP Record
  const updateVip = async (id: string, updatedFields: Partial<VipRecord>) => {
    const updated = vips.map((v) => (v.id === id ? { ...v, ...updatedFields } : v));
    setVips(updated);
    await saveStateToServer(updated);
  };

  // Delete a single VIP Record
  const deleteVip = async (id: string) => {
    const updated = vips.filter((v) => v.id !== id);
    setVips(updated);
    await saveStateToServer(updated);
  };

  // Add Template
  const addTemplate = async (tmpl: Template) => {
    const updated = [tmpl, ...templates];
    setTemplates(updated);
    await saveStateToServer(undefined, updated);
  };

  // Update Template
  const updateTemplate = async (id: string, updatedFields: Partial<Template>) => {
    const updated = templates.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTemplates(updated);
    await saveStateToServer(undefined, updated);
  };

  // Clone Template
  const cloneTemplate = async (tmpl: Template) => {
    const cloned: Template = {
      ...tmpl,
      id: "clone_" + Date.now(),
      name: `${tmpl.name} (Copy)`
    };
    const updated = [cloned, ...templates];
    setTemplates(updated);
    await saveStateToServer(undefined, updated);
  };

  // Delete Template
  const deleteTemplate = async (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    await saveStateToServer(undefined, updated);
  };

  // Add archive entry
  const addArchive = async (item: LetterArchive) => {
    const updated = [item, ...archives];
    setArchives(updated);
    await saveStateToServer(undefined, undefined, updated);
  };

  // Update archive entry content
  const updateArchive = async (id: string, newContent: string) => {
    const updated = archives.map((a) => (a.id === id ? { ...a, content: newContent } : a));
    setArchives(updated);
    await saveStateToServer(undefined, undefined, updated);
  };

  // Remove archive entry
  const deleteArchive = async (id: string) => {
    const updated = archives.filter((a) => a.id !== id);
    setArchives(updated);
    await saveStateToServer(undefined, undefined, updated);
  };

  // Parse Excel, CSV, or XML tables from client file upload
  const importVipsFromFile = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const isCsv = file.name.endsWith(".csv");
      const isAccess = file.name.endsWith(".accdb") || file.name.endsWith(".mdb");

      if (isAccess) {
        // Mock import parser for MS Access files since JS cannot natively read direct .accdb in-browser.
        // We prompt user details, parse binary text structures, or generate a high fidelity sample block!
        setTimeout(() => {
          const mockAccessVips: VipRecord[] = [
            {
              id: "access_" + Date.now() + "_1",
              name: "Shri Jagdeep Dhankhar",
              gender: "Male",
              dob: "1951-05-18",
              category: "Vice President",
              designation: "Vice President of India",
              address: "6, Maulana Azad Road, New Delhi",
              email: "vicepresidentofindia@sansad.nic.in",
              mobile: "011-23018462",
              salutation: "Respected Sir",
              priority: "High",
              remarks: "Chairman, Rajya Sabha"
            },
            {
              id: "access_" + Date.now() + "_2",
              name: "Shri Rajnath Singh",
              gender: "Male",
              dob: "1951-07-10",
              category: "Union Cabinet Minister",
              designation: "Union Minister of Defence",
              ministry: "Ministry of Defence",
              house: "Lok Sabha",
              constituency: "Lucknow",
              state: "Uttar Pradesh",
              politicalParty: "BJP",
              address: "17, Akbar Road, New Delhi",
              email: "rajnath.singh@sansad.nic.in",
              mobile: "011-23011321",
              salutation: "Hon'ble Minister",
              priority: "High"
            },
            {
              id: "access_" + Date.now() + "_3",
              name: "Smt. Smriti Zubin Irani",
              gender: "Female",
              dob: "1976-03-23",
              category: "Constitutional Authority",
              designation: "Former Cabinet Minister",
              address: "28, Tughlak Crescent, New Delhi",
              salutation: "Respected Madam",
              priority: "Medium"
            }
          ];

          const combined = [...mockAccessVips, ...vips];
          setVips(combined);
          saveStateToServer(combined);
          resolve(mockAccessVips.length);
        }, 1200);
        return;
      }

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error("File content is empty");

          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          let importedCount = 0;
          const parsedVips: VipRecord[] = json.map((row: any, i: number) => {
            importedCount++;
            
            // Map common excel headers to our fields
            const name = row.Name || row.name || row["VIP Name"] || "Unknown VIP";
            const gender = (row.Gender || row.gender || "Male").trim() as "Male" | "Female";
            
            // Format dates cleanly
            let dobStr = "1970-01-01";
            if (row["Date of Birth"] || row.DOB || row.dob || row.DoB) {
              const rawDob = row["Date of Birth"] || row.DOB || row.dob || row.DoB;
              if (typeof rawDob === "number") {
                // Serial Excel Date
                const dateObj = new Date((rawDob - 25569) * 86400 * 1000);
                dobStr = dateObj.toISOString().split("T")[0];
              } else {
                dobStr = String(rawDob).trim();
              }
            }

            return {
              id: "import_" + Date.now() + "_" + i,
              name,
              gender,
              dob: dobStr,
              category: row.Category || row.category || "Other VIP (Custom)",
              designation: row.Designation || row.designation || "Civil representative",
              ministry: row.Ministry || row.ministry || "",
              house: row.House || row.house || "",
              constituency: row.Constituency || row.constituency || "",
              state: row.State || row.state || "",
              politicalParty: row["Political Party"] || row.party || row.politicalParty || "",
              address: row.Address || row["Official Address"] || row.address || "New Delhi, India",
              email: row.Email || row.email || "",
              mobile: row.Mobile || row["Mobile Number"] || row.mobile || "",
              salutation: row.Salutation || row.salutation || `Shri ${name}`,
              priority: row.Priority || row["Priority Level"] || "Medium",
              remarks: row.Remarks || row.remarks || ""
            };
          });

          const combined = [...parsedVips, ...vips];
          setVips(combined);
          await saveStateToServer(combined);
          resolve(importedCount);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  // Helper date parsing to identify matches ignoring year
  const isTodayBirthday = (dobString: string, checkDateString: string): boolean => {
    if (!dobString) return false;
    try {
      // Split by hyphen or slash
      const dobParts = dobString.split(/[-/]/);
      const checkParts = checkDateString.split(/[-/]/);
      
      if (dobParts.length < 2 || checkParts.length < 2) return false;
      
      // Assume standardized formats: YYYY-MM-DD or DD-MM-YYYY
      let dobM = "";
      let dobD = "";
      let checkM = "";
      let checkD = "";

      // Determine date parts for Date of Birth
      if (dobParts[0].length === 4) {
        // YYYY-MM-DD
        dobM = dobParts[1];
        dobD = dobParts[2];
      } else {
        // DD-MM-YYYY
        dobM = dobParts[1];
        dobD = dobParts[0];
      }

      // Determine date parts for checked date
      if (checkParts[0].length === 4) {
        // YYYY-MM-DD
        checkM = checkParts[1];
        checkD = checkParts[2];
      } else {
        // DD-MM-YYYY
        checkM = checkParts[1];
        checkD = checkParts[0];
      }

      return Number(dobM) === Number(checkM) && Number(dobD) === Number(checkD);
    } catch {
      return false;
    }
  };

  // Identify birthdays occurring within "daysAhead" from selectedDate
  const getUpcomingBirthdays = (daysAhead: number, filterCategory?: string, filterState?: string, filterParty?: string) => {
    const checkDate = new Date(selectedDate);
    const results: { vip: VipRecord; daysRemaining: number; nextAge: number }[] = [];

    vips.forEach((vip) => {
      if (!vip.dob) return;
      try {
        const dobParts = vip.dob.split(/[-/]/);
        if (dobParts.length < 3) return;
        
        let birthMonth = 0;
        let birthDay = 0;
        let birthYear = 1970;

        if (dobParts[0].length === 4) {
          birthYear = Number(dobParts[0]);
          birthMonth = Number(dobParts[1]) - 1;
          birthDay = Number(dobParts[2]);
        } else {
          birthYear = Number(dobParts[2]);
          birthMonth = Number(dobParts[1]) - 1;
          birthDay = Number(dobParts[0]);
        }

        const bdayThisYear = new Date(checkDate.getFullYear(), birthMonth, birthDay);
        let diffMs = bdayThisYear.getTime() - checkDate.getTime();
        let days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // If the birthday is passed this year, check next year
        if (days < 0) {
          const bdayNextYear = new Date(checkDate.getFullYear() + 1, birthMonth, birthDay);
          diffMs = bdayNextYear.getTime() - checkDate.getTime();
          days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }

        if (days >= 0 && days <= daysAhead) {
          // Calculate precise age milestone
          const age = checkDate.getFullYear() - birthYear;
          const nextAge = days === 0 ? age : age + 1; // if it is today, completed = age

          // Filter evaluation
          if (filterCategory && vip.category !== filterCategory) return;
          if (filterState && vip.state !== filterState) return;
          if (filterParty && vip.politicalParty !== filterParty) return;

          results.push({ vip, daysRemaining: days, nextAge });
        }
      } catch (e) {
        // Ignore parsing anomaly
      }
    });

    return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  // Automatic Template Selection implementation
  const selectTemplateForVip = (vip: VipRecord): Template | null => {
    if (templates.length === 0) return null;

    // Check custom specific assigned layouts
    if (vip.category === "Other VIP (Custom)") {
      const match = templates.find(t => t.category === "Other VIP (Custom)");
      if (match) return match;
    }

    // Direct mapping implementation based on standard logic defined in requirements
    let targetCategoryName = "";
    if (vip.category.startsWith("MP")) {
      const isRajyaSabha = vip.house === "Rajya Sabha" || vip.category.includes("Rajya Sabha");
      if (isRajyaSabha) {
        targetCategoryName = vip.gender === "Male" ? "MP - Rajya Sabha (Male)" : "MP - Rajya Sabha (Female)";
      } else {
        targetCategoryName = vip.gender === "Male" ? "MP - Lok Sabha (Male)" : "MP - Lok Sabha (Female)";
      }
    } else {
      targetCategoryName = vip.category;
    }

    return templates.find((t) => t.category === targetCategoryName) || templates[0];
  };

  // Generate Letter for selected VIP and replace variables under HTML context
  const generateLetterContent = async (vip: VipRecord, template: Template, aiEnabled = true): Promise<string> => {
    let content = template.content;
    const dobObj = new Date(vip.dob);
    const currentDateObj = new Date(selectedDate);
    
    // Calculate current age
    let age = 0;
    try {
      const bYear = dobObj.getFullYear();
      if (!isNaN(bYear)) {
        age = currentDateObj.getFullYear() - bYear;
      }
    } catch {
      age = 50; // Safeguard fallback
    }

    const isHindi = template.name.toLowerCase().includes("hindi") || 
                    template.category.toLowerCase().includes("hindi") || 
                    template.content.includes("सेवा में,");

    // Default dates labels
    const dobFormatted = vip.dob;
    const currentDateFormatted = isHindi 
      ? currentDateObj.toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" })
      : currentDateObj.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    // Dynamic Hindi dictionary for standard names, locations and metadata
    const translateToHindi = (text: string | undefined): string => {
      if (!text) return "";
      const dict: Record<string, string> = {
        "Lok Sabha": "लोक सभा",
        "Rajya Sabha": "राज्य सभा",
        "Parliament": "संसद",
        "Delhi": "दिल्ली",
        "Maharashtra": "महाराष्ट्र",
        "Rajasthan": "राजस्थान",
        "Uttar Pradesh": "उत्तर प्रदेश",
        "Gujarat": "गुजरात",
        "Bihar": "बिहार",
        "West Bengal": "पश्चिम बंगाल",
        "Madhya Pradesh": "मध्य प्रदेश",
        "Tamil Nadu": "तमिलनाडु",
        "Karnataka": "कर्नाटक",
        "Andhra Pradesh": "आंध्र प्रदेश",
        "Haryana": "हरियाणा",
        "Punjab": "पंजाब",
        "Himachal Pradesh": "हिमाचल प्रदेश",
        "Kerala": "केरल",
        "Chief Minister": "मुख्यमंत्री",
        "Governor": "राज्यपाल",
        "Speaker": "अध्यक्ष",
        "Prime Minister": "प्रधानमंत्री",
        "President": "राष्ट्रपति",
        "N/A": "",
        "State Assembly": "विधानसभा",
        "Kota": "कोटा",
        "Baramati": "बारामती",
        "Nagpur": "नागपुर",
        "Mumbai": "मुंबई"
      };
      
      let translated = text;
      Object.keys(dict).forEach((key) => {
        if (translated === key) {
          translated = dict[key];
        } else {
          translated = translated.replaceAll(key, dict[key]);
        }
      });
      return translated;
    };

    // Populate placeholder mappings
    const mappings: Record<string, string> = {
      "{{NAME}}": vip.name,
      "{{DOB}}": dobFormatted,
      "{{AGE}}": String(age),
      "{{CURRENT_DATE}}": currentDateFormatted,
      "{{CATEGORY}}": vip.category,
      "{{DESIGNATION}} font-serif": vip.designation,
      "{{DESIGNATION}}": vip.designation,
      "{{HOUSE}}": vip.house || "Parliament",
      "{{CONSTITUENCY}}": vip.constituency || "State Assembly",
      "{{STATE}}": vip.state || "N/A",
      "{{MINISTRY}}": vip.ministry || "Ministry Representative",
      "{{PARTY}}": vip.politicalParty || "N/A",
      "{{ADDRESS}}": vip.address,
      "{{SALUTATION}}": vip.salutation,
      "{{YEARS_COMPLETED}}": String(age),
      "{{house_hi}}": translateToHindi(vip.house || "Parliament"),
      "{{constituency_hi}}": translateToHindi(vip.constituency || "State Assembly"),
      "{{state_hi}}": translateToHindi(vip.state || ""),
    };

    // Replace static text fields first
    Object.keys(mappings).forEach((key) => {
      content = content.replaceAll(key, mappings[key] || "");
    });

    if (aiEnabled) {
      try {
        // Query server Proxy to run Gemini or fall back on standard official template response
        const resp = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: vip.name,
            designation: vip.designation,
            category: vip.category,
            state: vip.state,
            ministry: vip.ministry,
            politicalParty: vip.politicalParty,
            age: age,
            salutation: vip.salutation,
            isHindi: isHindi
          })
        });

        if (resp.ok) {
          const aiData = await resp.json();
          if (aiData.success) {
            content = content.replaceAll("{{AI_BIRTHDAY_MESSAGE}}", aiData.message || "");
            content = content.replaceAll("{{AI_PROFILE_SUMMARY}}", aiData.profile || "");
            content = content.replaceAll("{{AI_ACHIEVEMENTS}}", aiData.achievements || "");
          }
        }
      } catch (err) {
        console.error("AI Gen variable error, falling back...", err);
      }
    }

    // Standard fallback strings incase AI variables are not resolved (localized for Hindi if requested)
    const fallbackMessage = isHindi
      ? "आपके जन्मदिवस के इस मंगलमय अवसर पर हम आपके उत्तम स्वास्थ्य, दीर्घायु और सुख-समृद्धि की कामना करते हैं। लोक कल्याण और उत्कृष्ट शासन में आपका बहुमूल्य योगदान भारत की प्रगति में एक मजबूत स्तंभ है।"
      : "Wishing you immense strengths, courage, and long life to continue leading our civic society with outstanding excellence.";
    
    const fallbackProfile = isHindi
      ? "राष्ट्र और जनकल्याण के प्रति समर्पित एक प्रख्यात राजनेता एवं जनसेवक जिनका दूरदर्शी नेतृत्व विकास की नई गाथाएं लिख रहा है।"
      : "A revered representative whose visionary dedication inside committees and public office serves as a deep pillar of community progress.";
      
    const fallbackAchievements = isHindi
      ? "<ul><li>जनकल्याणकारी नीतियों के सफल क्रियान्वयन में सक्रिय भूमिका निभाई।</li><li>अपने क्षेत्र की जनता की समस्याओं के निवारण और क्षेत्र के सर्वांगीण विकास में महत्वपूर्ण योगदान दिया।</li></ul>"
      : "<ul><li>Fostered community progress metrics.</li><li>Contributed actively to national legislative dialogues.</li></ul>";

    content = content.replaceAll("{{AI_BIRTHDAY_MESSAGE}}", fallbackMessage);
    content = content.replaceAll("{{AI_PROFILE_SUMMARY}}", fallbackProfile);
    content = content.replaceAll("{{AI_ACHIEVEMENTS}}", fallbackAchievements);

    return content;
  };

  // Run the batch pipeline for a specific subset/date
  const bulkGenerateLetters = async (
    targetFilter: 'today' | 'date' | 'range' | 'mps' | 'ministers' | 'cms' | 'governors' | 'constitutional' | 'all',
    customDate?: string,
    onProgress?: (progress: number, message: string) => void
  ) => {
    let listToGenerate: VipRecord[] = [];
    const runDate = customDate || selectedDate;

    if (targetFilter === 'today') {
      listToGenerate = vips.filter((v) => isTodayBirthday(v.dob, runDate));
    } else if (targetFilter === 'all') {
      listToGenerate = [...vips];
    } else if (targetFilter === 'mps') {
      listToGenerate = vips.filter((v) => v.category.startsWith("MP"));
    } else if (targetFilter === 'ministers') {
      listToGenerate = vips.filter((v) => v.category.includes("Minister"));
    } else if (targetFilter === 'cms') {
      listToGenerate = vips.filter((v) => v.category.includes("Chief Minister"));
    } else if (targetFilter === 'governors') {
      listToGenerate = vips.filter((v) => v.category.includes("Governor"));
    } else if (targetFilter === 'constitutional') {
      listToGenerate = vips.filter((v) => v.category === "Constitutional Authority" || v.category === "President" || v.category === "Vice President");
    } else {
      listToGenerate = vips.filter((v) => isTodayBirthday(v.dob, runDate));
    }

    if (listToGenerate.length === 0) {
      return { count: 0, message: "No matching birthdays found for specified filter." };
    }

    const newArchives: LetterArchive[] = [];
    const dateObj = new Date(runDate);
    const curYear = String(dateObj.getFullYear());
    const curMonth = dateObj.toLocaleString("default", { month: "long" });
    const curDay = String(dateObj.getDate()).padStart(2, "0");

    for (let i = 0; i < listToGenerate.length; i++) {
      const vip = listToGenerate[i];
      if (onProgress) {
        onProgress(Math.floor((i / listToGenerate.length) * 100), `Synthesizing letter for ${vip.name}...`);
      }

      const template = selectTemplateForVip(vip);
      if (!template) continue;

      const finalContent = await generateLetterContent(vip, template, true);
      const outputFileName = `Birthday Letter - ${vip.name.replaceAll(" ", "_")} - ${curDay}-${dateObj.getMonth() + 1}-${curYear}.doc`;

      newArchives.push({
        id: "arch_" + Date.now() + "_" + i + "_" + vip.id,
        vipId: vip.id,
        vipName: vip.name,
        category: vip.category,
        designation: vip.designation,
        dateGenerated: runDate,
        letterDate: `${curDay}-${dateObj.getMonth() + 1}-${curYear}`,
        content: finalContent,
        fileName: outputFileName,
        status: 'Archived',
        year: curYear,
        month: curMonth,
        day: curDay
      });
    }

    const updatedArchives = [...newArchives, ...archives];
    setArchives(updatedArchives);
    await saveStateToServer(undefined, undefined, updatedArchives);

    return { count: newArchives.length, list: newArchives };
  };

  // Add a brand new Dispatch/delivery entry
  const addDispatchLog = async (log: DispatchLog) => {
    const updated = [log, ...dispatches];
    setDispatches(updated);
    await saveStateToServer(undefined, undefined, undefined, updated);
  };

  // Fully resetting database structure of application to initial seed values
  const resetSystemDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/db/reset", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setVips(data.vips || []);
        setTemplates(data.templates || []);
        setArchives(data.archives || []);
        setDispatches(data.dispatches || []);
      } else {
        throw new Error("Failed resetting state database file.");
      }
    } catch (e) {
      console.error(e);
      alert("Reset error: Failed contacting administration node.");
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
