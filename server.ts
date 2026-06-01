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
  },
  {
    id: "t4",
    name: "Chief Minister Birthday Template",
    category: "Chief Minister",
    subject: "Sincere Birthday Greetings & Best Wishes",
    content: `<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff;" id="letter-container">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; color: #0f766e; font-weight: bold;">STATE PROTOCOL OFFICE</div>
    <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #64748b; margin-top: 4px;">CONGRATULATORY REGISTRY</div>
    <hr style="border: 0; border-top: 2px double #0f766e; margin: 15px auto; width: 60%;" />
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-family: sans-serif; color: #64748b;">
    <div><strong>Ref No:</strong> STATE/CM-BDAY/{{YEARS_COMPLETED}}</div>
    <div><strong>Date:</strong> {{CURRENT_DATE}}</div>
  </div>

  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif;">To,</p>
  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
    <strong>Hon'ble Chief Minister, Shri/Smt {{NAME}}</strong><br />
    Government of {{STATE}}<br />
    <strong>Address:</strong> {{ADDRESS}}
  </div>

  <p style="font-size: 16px; font-weight: 500; font-style: italic; margin-bottom: 18px;">{{SALUTATION}},</p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    It gives me great pleasure to extend my heartiest greetings and best wishes to you on the happy occasion of your birthday today. As you complete <strong>{{AGE}} years</strong> of life, we celebrate your exceptional path of governance and service to the people of {{STATE}}.
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    {{AI_BIRTHDAY_MESSAGE}}
  </p>

  <div style="background-color: #f0fdf4; border-left: 4px solid #0f766e; padding: 15px; margin: 25px 0; font-size: 15px; border-radius: 4px;">
    <strong style="color: #115e59; display: block; margin-bottom: 6px;">Governance & Leadership Summary:</strong>
    <p style="margin: 0 0 8px 0; font-style: italic; color: #134e4a;">"{{AI_PROFILE_SUMMARY}}"</p>
    <div style="margin-top: 10px; color: #475569;">
      {{AI_ACHIEVEMENTS}}
    </div>
  </div>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    Through creative public policy and unyielding determination, you have successfully driven deep development, infrastructure expansion, and popular empowerment. I pray that you are blessed with supreme physical health, longevity, and continuous peace of mind to guide {{STATE}} towards new paradigms of growth.
  </p>

  <p style="font-size: 16px; margin-bottom: 35px;">With compliments and progressive regards,</p>

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
    id: "t5",
    name: "Governor Birthday Template",
    category: "Governor",
    subject: "Respected Birthday Greetings & Highest Compliments",
    content: `<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff;" id="letter-container">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; color: #4338ca; font-weight: bold;">RAJ BHAVAN CONSTITUTIONAL REGISTRY</div>
    <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #64748b; margin-top: 4px;">OFFICIAL PROTOCOL CORRESPONDENCE</div>
    <hr style="border: 0; border-top: 2px double #4338ca; margin: 15px auto; width: 60%;" />
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-family: sans-serif; color: #64748b;">
    <div><strong>Ref No:</strong> BHAVAN/GOV-BDAY/{{YEARS_COMPLETED}}</div>
    <div><strong>Date:</strong> {{CURRENT_DATE}}</div>
  </div>

  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif;">To,</p>
  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
    <strong>Hon'ble Governor, Shri/Smt {{NAME}}</strong><br />
    Governor of {{STATE}}<br />
    <strong>Address:</strong> {{ADDRESS}}
  </div>

  <p style="font-size: 16px; font-weight: 500; font-style: italic; margin-bottom: 18px;">{{SALUTATION}},</p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    I have the highest honor and privilege of conveying my sincere felicitations and respectful greetings to you on the occasion of your birthday. Meeting the glorious milestone of <strong>{{AGE}} years</strong> reflects a lifetime of constitutional wisdom, administrative rectitude, and dedicated public stewardship.
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    {{AI_BIRTHDAY_MESSAGE}}
  </p>

  <div style="background-color: #f5f3ff; border-left: 4px solid #4338ca; padding: 15px; margin: 25px 0; font-size: 15px; border-radius: 4px;">
    <strong style="color: #3730a3; display: block; margin-bottom: 6px;">Constitutional Summary & Profile:</strong>
    <p style="margin: 0 0 8px 0; font-style: italic; color: #312e81;">"{{AI_PROFILE_SUMMARY}}"</p>
    <div style="margin-top: 10px; color: #475569;">
      {{AI_ACHIEVEMENTS}}
    </div>
  </div>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    Your noble role as the Constitutional Head of {{STATE}} has preserved democratic values, encouraging legal, educational, and voluntary programs. I pray to the Almighty to bless you with many more years of active, healthy, and happy life, with continuous strength to guide the administration.
  </p>

  <p style="font-size: 16px; margin-bottom: 35px;">With highest regards and respectful compliments,</p>

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
    id: "t6",
    name: "Male Rajya Sabha MP Birthday Template",
    category: "MP - Rajya Sabha (Male)",
    subject: "Sincere Birthday Greetings & Parliamentary Respects",
    content: `<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff;" id="letter-container">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: #9c27b0; font-weight: bold;">PARLIAMENT OF INDIA</div>
    <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #475569; margin-top: 4px;">RAJYA SABHA (COUNCIL OF STATES) SPECIAL REGISTRY</div>
    <hr style="border: 0; border-top: 2px double #9c27b0; margin: 15px auto; width: 60%;" />
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-family: sans-serif; color: #475569;">
    <div><strong>Ref No:</strong> RS/GEN/B-DAY/{{YEARS_COMPLETED}}</div>
    <div><strong>Date:</strong> {{CURRENT_DATE}}</div>
  </div>

  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif;">To,</p>
  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
    <strong>Shri {{NAME}}</strong><br />
    Hon'ble Member of Parliament, Rajya Sabha<br />
    Representing {{STATE}}<br />
    <strong>Address:</strong> {{ADDRESS}}
  </div>

  <p style="font-size: 16px; font-weight: 500; font-style: italic; margin-bottom: 18px;">{{SALUTATION}},</p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    Please accept my warmest and heartiest congratulations on the happy occasion of your birthday. Your milestones of <strong>{{AGE}} years</strong> represents a highly remarkable record of public deliberation, intellectual foresight, and deep legislative inputs in India's Upper House.
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    {{AI_BIRTHDAY_MESSAGE}}
  </p>

  <div style="background-color: #faf5ff; border-left: 4px solid #9c27b0; padding: 15px; margin: 25px 0; font-size: 15px; border-radius: 4px;">
    <strong style="color: #7b1fa2; display: block; margin-bottom: 6px;">Upper House Legislative Profile & Recognition:</strong>
    <p style="margin: 0 0 8px 0; font-style: italic; color: #4a148c;">"{{AI_PROFILE_SUMMARY}}"</p>
    <div style="margin-top: 10px; color: #4b5563;">
      {{AI_ACHIEVEMENTS}}
    </div>
  </div>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    As an esteemed Member of the Rajya Sabha from {{STATE}}, you have safeguarded federal consensus, guided our policies, and voiced local issues with marvelous excellence. I pray for your pristine health, joy, and long life to persist in steering democratic governance.
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
    id: "t7",
    name: "Female Rajya Sabha MP Birthday Template",
    category: "MP - Rajya Sabha (Female)",
    subject: "Respected Birthday Greetings & Upper House Commendation",
    content: `<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; background: #fff;" id="letter-container">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: #ec407a; font-weight: bold;">PARLIAMENT OF INDIA</div>
    <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #475569; margin-top: 4px;">RAJYA SABHA CHANCERY REGISTRY</div>
    <hr style="border: 0; border-top: 2px double #ec407a; margin: 15px auto; width: 60%;" />
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-family: sans-serif; color: #475569;">
    <div><strong>Ref No:</strong> RS/GEN/B-DAY/FEMALE/{{YEARS_COMPLETED}}</div>
    <div><strong>Date:</strong> {{CURRENT_DATE}}</div>
  </div>

  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif;">To,</p>
  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
    <strong>Smt. {{NAME}}</strong><br />
    Hon'ble Member of Parliament, Rajya Sabha<br />
    Representing {{STATE}}<br />
    <strong>Address:</strong> {{ADDRESS}}
  </div>

  <p style="font-size: 16px; font-weight: 500; font-style: italic; margin-bottom: 18px;">{{SALUTATION}},</p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    I have the pleasure of conveying my sincerest birthday greetings and absolute compliments to you on this special day. Your magnificent milestone of <strong>{{AGE}} years</strong> reflects a journey of public integrity and active contribution in the Upper House of Parliament.
  </p>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 18px; text-indent: 40px;">
    {{AI_BIRTHDAY_MESSAGE}}
  </p>

  <div style="background-color: #fdf2f8; border-left: 4px solid #ec407a; padding: 15px; margin: 25px 0; font-size: 15px; border-radius: 4px;">
    <strong style="color: #c2185b; display: block; margin-bottom: 6px;">Chancery Recognition & Legislative Impact:</strong>
    <p style="margin: 0 0 8px 0; font-style: italic; color: #880e4f;">"{{AI_PROFILE_SUMMARY}}"</p>
    <div style="margin-top: 10px; color: #4b5563;">
      {{AI_ACHIEVEMENTS}}
    </div>
  </div>

  <p style="font-size: 16px; text-align: justify; margin-bottom: 30px; text-indent: 40px;">
    We highly respect your persistent efforts inside Rajya Sabha representing {{STATE}} and forwarding structural reforms, educational equity, and social protection. I pray for your long, happy, and robust life, with persistent clarity and peace.
  </p>

  <p style="font-size: 16px; margin-bottom: 35px;">With warmest regards and high esteem,</p>

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
    id: "vip_birla",
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
    mobile: "011-23017411",
    salutation: "Respected Shri Om Birla Ji",
    priority: "High",
    remarks: "Hon'ble Speaker of the Lok Sabha"
  },
  {
    id: "vip_modi",
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
    mobile: "011-23012312",
    salutation: "Respected Prime Minister Narendra Modi Ji",
    priority: "High",
    remarks: "Head of Government"
  },
  {
    id: "vip_murmu",
    name: "Droupadi Murmu",
    gender: "Female",
    dob: "1958-06-20",
    category: "President",
    designation: "President of India",
    house: "None",
    constituency: "None",
    state: "Odisha",
    politicalParty: "Independent",
    address: "Rashtrapati Bhavan, New Delhi - 110004",
    email: "presidentofindia@rb.nic.in",
    mobile: "011-23015321",
    salutation: "Respected Madam President",
    priority: "High",
    remarks: "Constitutional Head of State (Birthday upcoming June 20!)"
  },
  {
    id: "vip_shah",
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
    id: "vip_rajnath",
    name: "Rajnath Singh",
    gender: "Male",
    dob: "1951-07-10",
    category: "Union Cabinet Minister",
    designation: "Union Cabinet Minister of Defence",
    ministry: "Ministry of Defence",
    house: "Lok Sabha",
    constituency: "Lucknow",
    state: "Uttar Pradesh",
    politicalParty: "BJP",
    address: "17, Akbar Road, New Delhi",
    email: "rajnath.singh@sansad.nic.in",
    mobile: "011-23018865",
    salutation: "Dear Shri Rajnath Singh Ji",
    priority: "High"
  },
  {
    id: "vip_gadkari",
    name: "Nitin Gadkari",
    gender: "Male",
    dob: "1957-05-27",
    category: "Union Cabinet Minister",
    designation: "Union Cabinet Minister of Road Transport and Highways",
    ministry: "Ministry of Road Transport and Highways",
    house: "Lok Sabha",
    constituency: "Nagpur",
    state: "Maharashtra",
    politicalParty: "BJP",
    address: "2, Motilal Nehru Place, New Delhi",
    email: "nitin.gadkari@nic.in",
    mobile: "011-23062019",
    salutation: "Respected Shri Nitin Gadkari Ji",
    priority: "High"
  },
  {
    id: "vip_sitharaman",
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
    id: "vip_jaishankar",
    name: "Subrahmanyam Jaishankar",
    gender: "Male",
    dob: "1955-01-09",
    category: "Union Cabinet Minister",
    designation: "Union Cabinet Minister of External Affairs",
    ministry: "Ministry of External Affairs",
    house: "Rajya Sabha",
    state: "Gujarat",
    politicalParty: "BJP",
    address: "3, Motilal Nehru Marg, New Delhi",
    email: "subrahmanyam.j@sansad.nic.in",
    mobile: "011-23011127",
    salutation: "Dear Dr. S. Jaishankar Ji",
    priority: "High"
  },
  {
    id: "vip_nadda",
    name: "Jagat Prakash Nadda",
    gender: "Male",
    dob: "1960-12-02",
    category: "Union Cabinet Minister",
    designation: "Union Cabinet Minister of Health and Family Welfare",
    ministry: "Ministry of Health and Family Welfare",
    house: "Rajya Sabha",
    state: "Gujarat",
    politicalParty: "BJP",
    address: "9, Teen Murti Marg, New Delhi",
    email: "jp.nadda@sansad.nic.in",
    mobile: "011-23018162",
    salutation: "Dear Shri J. P. Nadda Ji",
    priority: "High"
  },
  {
    id: "vip_paswan",
    name: "Chirag Paswan",
    gender: "Male",
    dob: "1982-10-31",
    category: "Union Cabinet Minister",
    designation: "Union Cabinet Minister of Food Processing Industries",
    ministry: "Ministry of Food Processing Industries",
    house: "Lok Sabha",
    constituency: "Hajipur",
    state: "Bihar",
    politicalParty: "LJP",
    address: "12, Janpath, New Delhi",
    email: "chirag.paswan@sansad.nic.in",
    mobile: "011-23017245",
    salutation: "Dear Shri Chirag Paswan Ji",
    priority: "Medium"
  },
  {
    id: "vip_yogi",
    name: "Yogi Adityanath",
    gender: "Male",
    dob: "1972-06-05",
    category: "Chief Minister",
    designation: "Chief Minister of Uttar Pradesh",
    state: "Uttar Pradesh",
    politicalParty: "BJP",
    address: "5, Kalidas Marg, Lucknow, Uttar Pradesh",
    email: "cmup@nic.in",
    mobile: "0522-2239296",
    salutation: "Respected Chief Minister Yogi Adityanath Ji",
    priority: "High",
    remarks: "Upcoming Birthday June 5!"
  },
  {
    id: "vip_atishi",
    name: "Atishi Marlena",
    gender: "Female",
    dob: "1981-06-08",
    category: "Chief Minister",
    designation: "Chief Minister of Delhi",
    state: "Delhi",
    politicalParty: "AAP",
    address: "6, Flag Staff Road, Civil Lines, Delhi",
    email: "cmdelhi@nic.in",
    mobile: "011-23392020",
    salutation: "Dear Smt. Atishi Ji",
    priority: "High",
    remarks: "Upcoming Birthday June 8!"
  },
  {
    id: "vip_mamata",
    name: "Mamata Banerjee",
    gender: "Female",
    dob: "1955-01-05",
    category: "Chief Minister",
    designation: "Chief Minister of West Bengal",
    state: "West Bengal",
    politicalParty: "AITC",
    address: "Nabanna, Howrah, West Bengal",
    email: "cm-wb@nic.in",
    mobile: "033-22145555",
    salutation: "Respected Mamata Didi",
    priority: "High"
  },
  {
    id: "vip_nitish",
    name: "Nitish Kumar",
    gender: "Male",
    dob: "1951-03-01",
    category: "Chief Minister",
    designation: "Chief Minister of Bihar",
    state: "Bihar",
    politicalParty: "JD(U)",
    address: "1, Anne Marg, Patna, Bihar",
    email: "cmbihar@nic.in",
    mobile: "0612-2223840",
    salutation: "Dear Shri Nitish Kumar Ji",
    priority: "High"
  },
  {
    id: "vip_stalin",
    name: "M. K. Stalin",
    gender: "Male",
    dob: "1953-03-01",
    category: "Chief Minister",
    designation: "Chief Minister of Tamil Nadu",
    state: "Tamil Nadu",
    politicalParty: "DMK",
    address: "CM Residence, Alwarpet, Chennai, Tamil Nadu",
    email: "cmcell@tn.gov.in",
    mobile: "044-25672345",
    salutation: "Dear Thiru M.K. Stalin Ji",
    priority: "High"
  },
  {
    id: "vip_sidda",
    name: "Siddaramaiah",
    gender: "Male",
    dob: "1948-08-12",
    category: "Chief Minister",
    designation: "Chief Minister of Karnataka",
    state: "Karnataka",
    politicalParty: "INC",
    address: "Krishna, CM Official Residence, Bengaluru, Karnataka",
    email: "cm.karnataka@nic.in",
    mobile: "080-22251792",
    salutation: "Dear Shri Siddaramaiah Ji",
    priority: "High"
  },
  {
    id: "vip_himanta",
    name: "Himanta Biswa Sarma",
    gender: "Male",
    dob: "1969-02-01",
    category: "Chief Minister",
    designation: "Chief Minister of Assam",
    state: "Assam",
    politicalParty: "BJP",
    address: "CM Block, Janata Bhawan, Dispur, Assam",
    email: "cm.assam@nic.in",
    mobile: "0361-2262222",
    salutation: "Dear Dr. Himanta Biswa Sarma Ji",
    priority: "High"
  },
  {
    id: "vip_mohan",
    name: "Mohan Yadav",
    gender: "Male",
    dob: "1965-03-25",
    category: "Chief Minister",
    designation: "Chief Minister of Madhya Pradesh",
    state: "Madhya Pradesh",
    politicalParty: "BJP",
    address: "CM House, Shyamla Hills, Bhopal",
    email: "cmmp@nic.in",
    mobile: "0755-2441010",
    salutation: "Dear Dr. Mohan Yadav Ji",
    priority: "High"
  },
  {
    id: "vip_shinde",
    name: "Eknath Shinde",
    gender: "Male",
    dob: "1964-02-09",
    category: "Chief Minister",
    designation: "Chief Minister of Maharashtra",
    state: "Maharashtra",
    politicalParty: "Shiv Sena",
    address: "Varsha Bungalow, Malabar Hill, Mumbai",
    email: "cm.maharashtra@gov.in",
    mobile: "022-22025151",
    salutation: "Dear Shri Eknath Shinde Ji",
    priority: "High"
  },
  {
    id: "vip_naidu",
    name: "Nara Chandrababu Naidu",
    gender: "Male",
    dob: "1950-04-20",
    category: "Chief Minister",
    designation: "Chief Minister of Andhra Pradesh",
    state: "Andhra Pradesh",
    politicalParty: "TDP",
    address: "CM Residence, Amaravati, Andhra Pradesh",
    email: "cmap@ap.gov.in",
    mobile: "0863-2441515",
    salutation: "Dear Nara Chandrababu Naidu Ji",
    priority: "High"
  },
  {
    id: "vip_revanth",
    name: "Anumula Revanth Reddy",
    gender: "Male",
    dob: "1969-11-08",
    category: "Chief Minister",
    designation: "Chief Minister of Telangana",
    state: "Telangana",
    politicalParty: "INC",
    address: "Pragathi Bhavan, Hyderabad, Telangana",
    email: "cm.telangana@nic.in",
    mobile: "040-23456789",
    salutation: "Dear Anumula Revanth Reddy Ji",
    priority: "High"
  },
  {
    id: "vip_mangubhai",
    name: "Mangubhai C. Patel",
    gender: "Male",
    dob: "1944-06-01",
    category: "Governor",
    designation: "Governor of Madhya Pradesh",
    state: "Madhya Pradesh",
    politicalParty: "BJP",
    address: "Raj Bhavan, Bhopal, Madhya Pradesh",
    email: "govmp@nic.in",
    mobile: "0755-2551670",
    salutation: "Respected Governor Shri Mangubhai Patel Ji",
    priority: "High",
    remarks: "Constitutional Head (Birthday TODAY! June 1)"
  },
  {
    id: "vip_bandaru",
    name: "Bandaru Dattatreya",
    gender: "Male",
    dob: "1947-06-12",
    category: "Governor",
    designation: "Governor of Haryana",
    state: "Haryana",
    politicalParty: "BJP",
    address: "Raj Bhavan, Sector 6, Chandigarh",
    email: "govhry@nic.in",
    mobile: "0172-2740611",
    salutation: "Respected Governor Shri Bandaru Dattatreya Ji",
    priority: "High",
    remarks: "Constitutional Head (Birthday upcoming June 12)"
  },
  {
    id: "vip_anandiben",
    name: "Anandiben Patel",
    gender: "Female",
    dob: "1941-11-21",
    category: "Governor",
    designation: "Governor of Uttar Pradesh",
    state: "Uttar Pradesh",
    politicalParty: "BJP",
    address: "Raj Bhavan, Lucknow, Uttar Pradesh",
    email: "governorup@nic.in",
    mobile: "0522-2236497",
    salutation: "Respected Governor Smt. Anandiben Patel Ji",
    priority: "High"
  },
  {
    id: "vip_cpr",
    name: "C. P. Radhakrishnan",
    gender: "Male",
    dob: "1957-05-04",
    category: "Governor",
    designation: "Governor of Maharashtra",
    state: "Maharashtra",
    politicalParty: "BJP",
    address: "Raj Bhavan, Malabar Hill, Mumbai",
    email: "gov-mah@nic.in",
    mobile: "022-23632343",
    salutation: "Respected Governor Shri C. P. Radhakrishnan Ji",
    priority: "High"
  },
  {
    id: "vip_bose",
    name: "Dr. C. V. Ananda Bose",
    gender: "Male",
    dob: "1951-01-02",
    category: "Governor",
    designation: "Governor of West Bengal",
    state: "West Bengal",
    politicalParty: "Independent",
    address: "Raj Bhavan, Kolkata, West Bengal",
    email: "gov-wb@nic.in",
    mobile: "033-22001641",
    salutation: "Respected Governor Dr. C.V. Ananda Bose Ji",
    priority: "High"
  },
  {
    id: "vip_ravi",
    name: "R. N. Ravi",
    gender: "Male",
    dob: "1952-05-10",
    category: "Governor",
    designation: "Governor of Tamil Nadu",
    state: "Tamil Nadu",
    politicalParty: "Independent",
    address: "Raj Bhavan, Guindy, Chennai",
    email: "govtn@cell.gov.in",
    mobile: "044-22351313",
    salutation: "Respected Governor Shri R. N. Ravi Ji",
    priority: "High"
  },
  {
    id: "vip_rahul",
    name: "Rahul Gandhi",
    gender: "Male",
    dob: "1970-06-19",
    category: "MP - Lok Sabha (Male)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "Rae Bareli",
    state: "Uttar Pradesh",
    politicalParty: "INC",
    address: "12, Tughlak Lane, New Delhi",
    email: "rahul.gandhi@sansad.nic.in",
    mobile: "011-23019080",
    salutation: "Dear Shri Rahul Gandhi Ji",
    priority: "High",
    remarks: "Leader of Opposition, Lok Sabha (Birthday upcoming June 19)"
  },
  {
    id: "vip_goel",
    name: "Piyush Goyal",
    gender: "Male",
    dob: "1964-06-13",
    category: "MP - Lok Sabha (Male)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "Mumbai North",
    state: "Maharashtra",
    politicalParty: "BJP",
    address: "8, Teen Murti Marg, New Delhi",
    email: "piyush.goyal@sansad.nic.in",
    mobile: "011-23017777",
    salutation: "Dear Shri Piyush Goyal Ji",
    priority: "Medium",
    remarks: "Upcoming Birthday June 13!"
  },
  {
    id: "vip_tharoor",
    name: "Dr. Shashi Tharoor",
    gender: "Male",
    dob: "1956-03-09",
    category: "MP - Lok Sabha (Male)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "Thiruvananthapuram",
    state: "Kerala",
    politicalParty: "INC",
    address: "97, Lodhi Estate, New Delhi",
    email: "shashi.tharoor@sansad.nic.in",
    mobile: "011-24641740",
    salutation: "Dear Dr. Shashi Tharoor Ji",
    priority: "Medium"
  },
  {
    id: "vip_akhilesh",
    name: "Akhilesh Yadav",
    gender: "Male",
    dob: "1973-07-01",
    category: "MP - Lok Sabha (Male)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "Kannauj",
    state: "Uttar Pradesh",
    politicalParty: "SP",
    address: "4, Vikramaditya Marg, Lucknow, Uttar Pradesh",
    email: "akhilesh.yadav@sansad.nic.in",
    mobile: "0522-2213456",
    salutation: "Dear Shri Akhilesh Yadav Ji",
    priority: "High",
    remarks: "Upcoming Birthday July 1!"
  },
  {
    id: "vip_supriya",
    name: "Supriya Sule",
    gender: "Female",
    dob: "1969-06-30",
    category: "MP - Lok Sabha (Female)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "Baramati",
    state: "Maharashtra",
    politicalParty: "NCP",
    address: "6, Janpath, New Delhi",
    email: "supriya.sule@sansad.nic.in",
    mobile: "011-23011333",
    salutation: "Dear Smt. Supriya Sule Ji",
    priority: "Medium",
    remarks: "Upcoming Birthday June 30!"
  },
  {
    id: "vip_mahua",
    name: "Mahua Moitra",
    gender: "Female",
    dob: "1974-10-12",
    category: "MP - Lok Sabha (Female)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "Krishnanagar",
    state: "West Bengal",
    politicalParty: "AITC",
    address: "9-B, Sujan Singh Park, New Delhi",
    email: "mahua.moitra@sansad.nic.in",
    mobile: "011-23018210",
    salutation: "Dear Smt. Mahua Moitra Ji",
    priority: "Medium"
  },
  {
    id: "vip_hema",
    name: "Hema Malini",
    gender: "Female",
    dob: "1948-10-16",
    category: "MP - Lok Sabha (Female)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "Mathura",
    state: "Uttar Pradesh",
    politicalParty: "BJP",
    address: "17, Rajaji Marg, New Delhi",
    email: "hema.malini@sansad.nic.in",
    mobile: "011-23018151",
    salutation: "Dear Smt. Hema Malini Ji",
    priority: "Medium"
  },
  {
    id: "vip_bansuri",
    name: "Bansuri Swaraj",
    gender: "Female",
    dob: "1984-01-03",
    category: "MP - Lok Sabha (Female)",
    designation: "Member of Parliament (Lok Sabha)",
    house: "Lok Sabha",
    constituency: "New Delhi",
    state: "Delhi",
    politicalParty: "BJP",
    address: "8, Tughlak Crescent, New Delhi",
    email: "bansuri.swaraj@sansad.nic.in",
    mobile: "011-23011112",
    salutation: "Dear Smt. Bansuri Swaraj Ji",
    priority: "Medium"
  },
  {
    id: "vip_kharge",
    name: "Mallikarjun Kharge",
    gender: "Male",
    dob: "1942-07-21",
    category: "MP - Rajya Sabha (Male)",
    designation: "Member of Parliament (Rajya Sabha)",
    house: "Rajya Sabha",
    state: "Karnataka",
    politicalParty: "INC",
    address: "10, Rajaji Marg, New Delhi",
    email: "m.kharge@sansad.nic.in",
    mobile: "011-23018212",
    salutation: "Dear Shri Mallikarjun Kharge Ji",
    priority: "High",
    remarks: "Leader of Opposition, Rajya Sabha (Upcoming Birthday July 21)"
  },
  {
    id: "vip_sibal",
    name: "Kapil Sibal",
    gender: "Male",
    dob: "1948-08-08",
    category: "MP - Rajya Sabha (Male)",
    designation: "Member of Parliament (Rajya Sabha)",
    house: "Rajya Sabha",
    state: "Uttar Pradesh",
    politicalParty: "Independent",
    address: "19, Teen Murti Marg, New Delhi",
    email: "k.sibal@sansad.nic.in",
    mobile: "011-23019451",
    salutation: "Dear Shri Kapil Sibal Ji",
    priority: "Medium"
  },
  {
    id: "vip_priyanka",
    name: "Priyanka Chaturvedi",
    gender: "Female",
    dob: "1979-11-19",
    category: "MP - Rajya Sabha (Female)",
    designation: "Member of Parliament (Rajya Sabha)",
    house: "Rajya Sabha",
    state: "Maharashtra",
    politicalParty: "Shiv Sena",
    address: "601, Windermere, Oshiwara, Andheri West, Mumbai",
    email: "priyanka.c@sansad.nic.in",
    mobile: "022-26330000",
    salutation: "Dear Smt. Priyanka Chaturvedi Ji",
    priority: "Medium"
  }
];

// Load full DB
function loadDatabase() {
  let loadedData: any = null;
  if (fs.existsSync(DATABASE_FILE)) {
    try {
      loadedData = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading database. Initializing defaults.", e);
    }
  }
  
  if (!loadedData) {
    const data = {
      vips: defaultVips,
      templates: defaultTemplates,
      archives: [],
      dispatches: []
    };
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  } else {
    // Automatically overwrite the VIP list to ensure the authentic entries are visible immediately
    loadedData.vips = defaultVips;
    
    // Merge new default templates (by checking ID) to avoid overwriting user adjustments to existing templates
    if (!loadedData.templates) {
      loadedData.templates = [];
    }
    const existingTemplateIds = new Set(loadedData.templates.map((t: any) => t.id));
    defaultTemplates.forEach((t) => {
      if (!existingTemplateIds.has(t.id)) {
        loadedData.templates.push(t);
      }
    });

    try {
      fs.writeFileSync(DATABASE_FILE, JSON.stringify(loadedData, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to sync migrated databases:", err);
    }
    
    return {
      vips: loadedData.vips || [],
      templates: loadedData.templates || [],
      archives: loadedData.archives || [],
      dispatches: loadedData.dispatches || []
    };
  }
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
