import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const DATA_DIR = path.join(process.cwd(), "data");
const DATABASE_FILE = path.join(DATA_DIR, "db.json");

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default system data structures
const defaultTemplates = [
  {
    id: "t1",
    name: "Male MP Birthday Template",
    category: "MP - Lok Sabha (Male)",
    subject: "Warm Birthday Greetings & Best Wishes",
    content: `<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff;" id="letter-container">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: #b45309; font-weight: bold;">PARLIAMENT OF INDIA</div>
    <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #475569; margin-top: 4px;">OFFICIAL CORRESPONDENCE</div>
    <hr style="border: 0; border-top: 2px double #b45309; margin: 15px auto; width: 60%;" />
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-family: sans-serif; color: #475569;">
    <div><strong>Ref No:</strong> PARL/GEN/B-DAY/{{YEARS_COMPLETED}}</div>
    <div><strong>Date:</strong> {{CURRENT_DATE}}</div>
  </div>

  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif;">To,</p>
  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
    <strong>Shri {{NAME}}</strong><br />
    Hon'ble {{DESIGNATION}}<br />
    {{HOUSE}}, {{CONSTITUENCY}}<br />
    {{STATE}}<br />
    <strong>Address:</strong> {{ADDRESS}}
  </div>

  <p style="font-size: 16px; font-weight: 500; font-style: italic; margin-bottom: 18px;">{{SALUTATION}},</p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    Please accept my warmest and heartiest congratulations on the auspicious occasion of your birthday. Reaching the milestone of <strong>{{AGE}} years</strong> represents a journey of deep dedication to our nation.
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    {{AI_BIRTHDAY_MESSAGE}}
  </p>

  <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 25px 0; font-size: 15px; border-radius: 4px;">
    <strong style="color: #92400e; display: block; margin-bottom: 6px;">Profile & Achievements Recognition:</strong>
    <p style="margin: 0 0 8px 0; font-style: italic; color: #451a03;">"{{AI_PROFILE_SUMMARY}}"</p>
    <div style="margin-top: 10px; color: #4b5563;">
      {{AI_ACHIEVEMENTS}}
    </div>
  </div>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    Your tireless services as a Member of the Lok Sabha from {{CONSTITUENCY}} have left an indelible impact on public welfare. I pray for your long, healthy, and blessed life, so that you may continue to steer public progress and guide the citizens with distinction.
  </p>

  <p style="font-size: 16px; margin-bottom: 35px;">With warmest personal regards,</p>

  <div style="display: flex; justify-content: flex-end; text-align: right; margin-top: 40px;">
    <div>
      <div style="margin-bottom: 15px;">
        <span style="font-family: 'Caveat', cursive, sans-serif; font-size: 24px; color: #1e3a8a; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; display: inline-block;">Official Signature</span>
      </div>
      <strong>Administrative Director</strong><br />
      <span style="font-size: 12px; color: #64748b;">VIP Generation & Records Division</span>
    </div>
  </div>
</div>`
  },
  {
    id: "t2",
    name: "Female MP Birthday Template",
    category: "MP - Lok Sabha (Female)",
    subject: "Hearty Birthday Greetings and Commendation",
    content: `<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff;" id="letter-container">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: #0284c7; font-weight: bold;">PARLIAMENT OF INDIA</div>
    <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #475569; margin-top: 4px;">OFFICIAL RECOGNITION</div>
    <hr style="border: 0; border-top: 2px double #0284c7; margin: 15px auto; width: 60%;" />
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-family: sans-serif; color: #475569;">
    <div><strong>Ref No:</strong> PARL/GEN/B-DAY/FEMALE/{{YEARS_COMPLETED}}</div>
    <div><strong>Date:</strong> {{CURRENT_DATE}}</div>
  </div>

  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif;">To,</p>
  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
    <strong>Smt. {{NAME}}</strong><br />
    Hon'ble {{DESIGNATION}}<br />
    {{HOUSE}}, {{CONSTITUENCY}}<br />
    {{STATE}}<br />
    <strong>Address:</strong> {{ADDRESS}}
  </div>

  <p style="font-size: 16px; font-weight: 500; font-style: italic; margin-bottom: 18px;">{{SALUTATION}},</p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    I write to convey my sincere felicitations and heartiest greetings to you on the happy occasion of your birthday. As you complete <strong>{{AGE}} years</strong>, we reflect upon your outstanding initiatives and inspiring work inside the Parliament representing the constituency of {{CONSTITUENCY}}.
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    {{AI_BIRTHDAY_MESSAGE}}
  </p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 25px 0; font-size: 15px; border-radius: 4px;">
    <strong style="color: #0369a1; display: block; margin-bottom: 6px;">Profile & Achievements Recognition:</strong>
    <p style="margin: 0 0 8px 0; font-style: italic; color: #0c4a6e;">"{{AI_PROFILE_SUMMARY}}"</p>
    <div style="margin-top: 10px; color: #4b5563;">
      {{AI_ACHIEVEMENTS}}
    </div>
  </div>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    May Almighty bless you with robust health, happiness, and long life to continue your stellar leadership, ensuring women's perspective and regional issues find persistent voices in our democratic framework.
  </p>

  <p style="font-size: 16px; margin-bottom: 35px;">With high esteem and personal regards,</p>

  <div style="display: flex; justify-content: flex-end; text-align: right; margin-top: 40px;">
    <div>
      <div style="margin-bottom: 15px;">
        <span style="font-family: 'Caveat', cursive, sans-serif; font-size: 24px; color: #1e3a8a; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; display: inline-block;">Official Signature</span>
      </div>
      <strong>Administrative Director</strong><br />
      <span style="font-size: 12px; color: #64748b;">VIP Generation & Records Division</span>
    </div>
  </div>
</div>`
  },
  {
    id: "t3",
    name: "Cabinet Minister Birthday Template",
    category: "Union Cabinet Minister",
    subject: "Congratulatory Greetings on your Birthday",
    content: `<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff;" id="letter-container">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 15px; letter-spacing: 0.1em; text-transform: uppercase; color: #1e3a8a; font-weight: bold;">GOVERNMENT OF INDIA</div>
    <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #475569; margin-top: 4px;">CABINET MINISTER PROTOCOL OFFICE</div>
    <hr style="border: 0; border-top: 2px double #1e3a8a; margin: 15px auto; width: 60%;" />
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-family: sans-serif; color: #475569;">
    <div><strong>Ref No:</strong> GOI/M-CAB/BDAY-{{YEARS_COMPLETED}}</div>
    <div><strong>Date:</strong> {{CURRENT_DATE}}</div>
  </div>

  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif;">To,</p>
  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
    <strong>Shri {{NAME}}</strong><br />
    Hon'ble Union Cabinet Minister of {{MINISTRY}}<br />
    Government of India<br />
    New Delhi<br />
    <strong>Address:</strong> {{ADDRESS}}
  </div>

  <p style="font-size: 16px; font-weight: 500; font-style: italic; margin-bottom: 18px;">{{SALUTATION}},</p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    I have the high privilege of extending my heartfelt birthday felicitations to you. On completing <strong>{{AGE}} years</strong>, you represent a phenomenal journey of public administrative success and leadership that serves as an inspiration for the nation.
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    Your exceptional leadership in guiding the <strong>{{MINISTRY}}</strong> has accelerated the developmental agenda of our country, promoting deep administrative transformations.
  </p>

  <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0; font-size: 15px; border-radius: 4px;">
    <strong style="color: #065f46; display: block; margin-bottom: 6px;">Cabinet Recognition:</strong>
    <p style="margin: 0 0 8px 0; font-style: italic; color: #064e3b;">"{{AI_PROFILE_SUMMARY}}"</p>
    <div style="margin-top: 10px; color: #4b5563;">
      {{AI_ACHIEVEMENTS}}
    </div>
  </div>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    {{AI_BIRTHDAY_MESSAGE}}
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    I wish you robust health, safety, and a very rewarding journey ahead in your noble endeavors to serve public welfare.
  </p>

  <p style="font-size: 16px; margin-bottom: 35px;">With high regards,</p>

  <div style="display: flex; justify-content: flex-end; text-align: right; margin-top: 40px;">
    <div>
      <div style="margin-bottom: 15px;">
        <span style="font-family: 'Caveat', cursive, sans-serif; font-size: 24px; color: #1e3a8a; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; display: inline-block;">Official Signature</span>
      </div>
      <strong>Administrative Director</strong><br />
      <span style="font-size: 12px; color: #64748b;">VIP Generation & Records Division</span>
    </div>
  </div>
</div>`
  }
];

const defaultVips = [
  {
    id: "vip1",
    name: "Om Birla",
    gender: "Male",
    dob: "1962-11-23",
    category: "Speaker",
    designation: "Speaker, Lok Sabha",
    house: "Lok Sabha",
    constituency: "Kota",
    state: "Rajasthan",
    politicalParty: "BJP",
    address: "20, Akbar Road, New Delhi - 110011",
    email: "speakerloksabha@sansad.nic.in",
    mobile: "+911123017411",
    salutation: "Respected Shri Om Birla Ji",
    priority: "High",
    remarks: "Hon'ble Speaker"
  },
  {
    id: "vip2",
    name: "Narendra Modi",
    gender: "Male",
    dob: "1950-09-17",
    category: "Prime Minister",
    designation: "Prime Minister of India",
    house: "Lok Sabha",
    constituency: "Varanasi",
    state: "Uttar Pradesh",
    politicalParty: "BJP",
    address: "7, Lok Kalyan Marg, New Delhi",
    email: "pmo@gov.in",
    mobile: "+911123012312",
    salutation: "Respected Prime Minister Narendra Modi Ji",
    priority: "High",
    remarks: "Head of Government"
  },
  {
    id: "vip3",
    name: "Droupadi Murmu",
    gender: "Female",
    dob: "1958-06-20",
    category: "President",
    designation: "President of India",
    address: "Rashtrapati Bhavan, New Delhi - 110004",
    email: "presidentofindia@rb.nic.in",
    mobile: "011-23015321",
    salutation: "Respected Madam President",
    priority: "High",
    remarks: "Constitutional Head"
  },
  {
    id: "vip4",
    name: "Amit Shah",
    gender: "Male",
    dob: "1964-10-22",
    category: "Union Cabinet Minister",
    designation: "Union Cabinet Minister of Home Affairs",
    ministry: "Ministry of Home Affairs",
    house: "Lok Sabha",
    constituency: "Gandhinagar",
    state: "Gujarat",
    politicalParty: "BJP",
    address: "6, Krishna Menon Marg, New Delhi",
    email: "amit.shah@sansad.nic.in",
    mobile: "011-23019318",
    salutation: "Respected Cabinet Minister Amit Shah Ji",
    priority: "High"
  },
  {
    id: "vip5",
    name: "Nirmala Sitharaman",
    gender: "Female",
    dob: "1959-08-18",
    category: "Union Cabinet Minister",
    designation: "Union Cabinet Minister of Finance",
    ministry: "Ministry of Finance",
    house: "Rajya Sabha",
    state: "Karnataka",
    politicalParty: "BJP",
    address: "15, Safdarjung Road, New Delhi",
    email: "nirmala.sitharaman@gov.in",
    mobile: "011-23092510",
    salutation: "Dear Finance Minister Smt. Nirmala Sitharaman Ji",
    priority: "High"
  },
  {
    id: "vip6",
    name: "Yogi Adityanath",
    gender: "Male",
    dob: "1972-06-05", // Let's set some dates close to current date June/July for dynamic demo!
    category: "Chief Minister",
    designation: "Chief Minister of Uttar Pradesh",
    state: "Uttar Pradesh",
    politicalParty: "BJP",
    address: "5, Kalidas Marg, Lucknow, Uttar Pradesh",
    email: "cmup@nic.in",
    mobile: "0522-2239296",
    salutation: "Dear Chief Minister Yogi Adityanath Ji",
    priority: "High"
  },
  {
    id: "vip7",
    name: "Mallikarjun Kharge",
    gender: "Male",
    dob: "1942-07-21",
    category: "Leader of Opposition",
    designation: "Leader of Opposition, Rajya Sabha",
    house: "Rajya Sabha",
    state: "Karnataka",
    politicalParty: "INC",
    address: "10, Rajaji Marg, New Delhi",
    email: "m.kharge@sansad.nic.in",
    mobile: "011-23018212",
    salutation: "Dear Shri Mallikarjun Kharge Ji",
    priority: "High"
  }
];

// Load full DB
function loadDatabase() {
  if (fs.existsSync(DATABASE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf-8"));
      return {
        vips: data.vips || [],
        templates: data.templates || [],
        archives: data.archives || [],
        dispatches: data.dispatches || []
      };
    } catch (e) {
      console.error("Error reading database. Initializing defaults.", e);
    }
  }
  
  // Write defaults if not exist
  const data = {
    vips: defaultVips,
    templates: defaultTemplates,
    archives: [],
    dispatches: []
  };
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

// Save Full DB
function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error saving database file", e);
    return false;
  }
}

// Database API endpoints
app.get("/api/db/data", (req, res) => {
  const db = loadDatabase();
  res.json(db);
});

app.post("/api/db/save", (req, res) => {
  const { vips, templates, archives, dispatches } = req.body;
  const success = saveDatabase({ vips, templates, archives, dispatches });
  if (success) {
    res.json({ success: true, message: "System state persisted successfully." });
  } else {
    res.status(500).json({ success: false, message: "Failed to persist data to server disk" });
  }
});

app.post("/api/db/reset", (req, res) => {
  try {
    if (fs.existsSync(DATABASE_FILE)) {
      fs.unlinkSync(DATABASE_FILE);
    }
    const db = loadDatabase();
    res.json({ success: true, ...db });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Reset failed" });
  }
});

// Lazy initialize Gemini API client to prevent crashing if GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please set it in the Settings secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Endpoint to generate content using Gemini
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { name, designation, category, state, ministry, politicalParty, age, salutation } = req.body;

    const promptText = `
Generate standard dignitary birthday letter items for this public personality:
Name: ${name}
Designation: ${designation}
Category: ${category}
State: ${state || 'N/A'}
Ministry: ${ministry || 'N/A'}
Political Party: ${politicalParty || 'N/A'}
Age: ${age || 'N/A'}
Salutation: ${salutation}

Make sure the output strictly contains high-level parliamentary, formal, dignified language, worthy of official Union government correspondence.

Please return your response in standard JSON format containing exactly these three fields:
1. "message": A customized formal birthday wish incorporating their public role (approx 2 sentences, e.g., representing people of their constituency, steering developmental projects, etc.). Keep it neutral, non-partisan, grand, and inspiring.
2. "profile": A concise summary narrative (1-2 sentences) of their devotion to the progress of the nation.
3. "achievements": Hand-crafted formal details formatted as an HTML list (e.g., "<ul><li>Led active initiatives in public policy...</li><li>Represented the State/constituency with administrative excellence...</li></ul>") listing 2-3 significant dignitary achievements suitable for inclusion in an official greeting letter. Utilize details of their listed Ministry, state or category dynamically.

Ensure the return is clean JSON. Do not add markdown backticks (\`\`\`json) or any preamble outside of the JSON parseable block.
`;

    // Attempt to utilize Gemini
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING },
              profile: { type: Type.STRING },
              achievements: { type: Type.STRING }
            },
            required: ["message", "profile", "achievements"]
          }
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ success: true, ...parsed });
      } else {
        throw new Error("Empty response from Gemini model.");
      }
    } catch (e: any) {
      console.warn("Failing back to fallback generator due to Gemini API failure or missing keys:", e.message);
      
      // Stand-by fallback engine for robustness when API key is missing
      const fallbackGreetings = [
        `On this special day, we express our profound gratitude for your exceptional contributions and the integrity with which you represent your constituency. Your high level of leadership in governance and unwavering energy continues to steer our democracy onto strides of public progress.`,
        `As we commemorate the anniversary of your birth, we recognize the dedication and visionary spirit you bring to public service. Your contribution as a guardian of national policy has profoundly enriched the lives of civil society.`,
        `Please accept our sincere appreciation for your devotion and outstanding stewardship of the nation's public concerns. Your long career stands as a lighthouse of integrity and guidance for subsequent generations.`
      ];

      const chosenGreeting = fallbackGreetings[Math.floor(Math.random() * fallbackGreetings.length)];
      const fallbackSummary = `A distinguished public figure whose extensive administrative wisdom, leadership of ${ministry || designation}, and parliamentary dedication have been catalysts of enduring developmental transformations.`;
      
      const fallbackAchievements = `<ul>
        <li>Spearheaded pivotal initiatives of regional governance, championing local community welfare and societal inclusivity.</li>
        <li>Nurtured seamless execution of state policies and legislative duties in the service of democratic representation.</li>
        <li>Contributed substantially to committees of strategic policy, ensuring the public concerns of ${state || 'India'} are addressed.</li>
      </ul>`;

      return res.json({
        success: true,
        message: `${salutation}, we wish to highlight your exemplary record. ${chosenGreeting}`,
        profile: fallbackSummary,
        achievements: fallbackAchievements,
        isFallback: true,
        info: "Generated via server-side fallback engine (No active Gemini API key or quota exceeded)"
      });
    }

  } catch (err: any) {
    console.error("General API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Configure Vite or Static Assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();
