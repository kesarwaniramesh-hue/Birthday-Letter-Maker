export interface VipRecord {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  dob: string; // YYYY-MM-DD or DD-MM-YYYY
  category: string;
  designation: string;
  ministry?: string;
  house?: string; // e.g. Lok Sabha, Rajya Sabha
  constituency?: string;
  state?: string;
  politicalParty?: string;
  address: string;
  email?: string;
  mobile?: string;
  salutation: string;
  priority: 'High' | 'Medium' | 'Low';
  remarks?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string; // Category mapped e.g. "Male MP", "Female MP", "Cabinet Minister", etc.
  content: string; // HTML/RichText markdown with placeholders
  subject: string; // Baseline letter subject/heading
  watermark?: string; // Watermark text or status
  letterheadText?: string; // Default header text
  signatureName?: string; // Default sender/signee name
  signatureDesignation?: string; // Sender designation
  signatureImage?: string; // Base64 signature image
}

export interface LetterArchive {
  id: string;
  vipId: string;
  vipName: string;
  category: string;
  designation: string;
  dateGenerated: string; // YYYY-MM-DD
  letterDate: string; // DD-MM-YYYY
  content: string; // Saved final letter content
  fileName: string; // e.g. Birthday Letter - Shri Om Birla - 04-11-2026.docx
  status: 'Draft' | 'Sent' | 'Printed' | 'Archived';
  year: string;
  month: string;
  day: string;
}

export interface DispatchLog {
  id: string;
  archiveId: string;
  vipName: string;
  date: string;
  method: 'Email' | 'Hand Delivery' | 'Post';
  recipientAddress: string;
  status: 'Dispatched' | 'Failed' | 'Pending';
  trackingNumber?: string;
}

// Default categories supported in dropdowns and selections
export const SUPPORTED_CATEGORIES = [
  "President",
  "Vice President",
  "Prime Minister",
  "Former President",
  "Former Vice President",
  "Former Prime Minister",
  "Speaker",
  "Deputy Speaker",
  "Chairman, Rajya Sabha",
  "Deputy Chairman, Rajya Sabha",
  "Former Lok Sabha Speaker",
  "MP - Lok Sabha (Male)",
  "MP - Lok Sabha (Female)",
  "MP - Rajya Sabha (Male)",
  "MP - Rajya Sabha (Female)",
  "Union Cabinet Minister",
  "Union Minister of State (Independent Charge)",
  "Union Minister of State",
  "Chief Minister",
  "Deputy Chief Minister",
  "State Cabinet Minister",
  "State Minister of State",
  "Governor",
  "Lieutenant Governor",
  "Leader of Opposition",
  "State Assembly Speaker",
  "State Legislative Council Chairperson",
  "Constitutional Authority",
  "Distinguished Public Personality",
  "Other VIP (Custom)"
];

// Mapping helper for automated selection logic
export const CATEGORY_TEMPLATE_MAPPING: Record<string, string> = {
  "President": "President Template",
  "Vice President": "Vice President Template",
  "Prime Minister": "Prime Minister Template",
  "Speaker": "Speaker Template",
  "Deputy Speaker": "Deputy Speaker Template",
  "Union Cabinet Minister": "Cabinet Minister Template",
  "Union Minister of State (Independent Charge)": "MoS Independent Charge Template",
  "Union Minister of State": "MoS Template",
  "Chief Minister": "Chief Minister Template",
  "Governor": "Governor Template",
  "Lieutenant Governor": "Lieutenant Governor Template",
  "Leader of Opposition": "Opposition Leader Template",
  "MP - Lok Sabha (Male)": "Male MP Template",
  "MP - Lok Sabha (Female)": "Female MP Template",
  "MP - Rajya Sabha (Male)": "Male MP Template",
  "MP - Rajya Sabha (Female)": "Female MP Template",
};
