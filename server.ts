import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";
import apiV1Router from "./server/v1/api.ts";

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

// ----------------------------------------------------
// FIREBASE ADMIN SETUP (Lazy)
// ----------------------------------------------------
let firebaseAdminApp: any = null;
function getFirebaseAdmin() {
  if (!firebaseAdminApp) {
    if (getApps().length > 0) {
      firebaseAdminApp = getApp();
      return firebaseAdminApp;
    }
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT !== "test") {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseAdminApp = initializeApp({
          credential: cert(serviceAccount)
        });
      } catch (e) {
        console.warn("Invalid FIREBASE_SERVICE_ACCOUNT json, falling back to default initialization:", e);
        firebaseAdminApp = initializeApp();
      }
    } else {
      // Fallback for dev/container auto-resolve
      firebaseAdminApp = initializeApp();
    }
  }
  return firebaseAdminApp;
}

const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || "(default)";

function getDb() {
  return getFirestore(getFirebaseAdmin(), FIRESTORE_DATABASE_ID);
}

// ----------------------------------------------------
// RAZORPAY SETUP (Lazy)
// ----------------------------------------------------
let razorpay: Razorpay | null = null;
function getRazorpay() {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials missing in environment variables.");
    }
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
}

// ----------------------------------------------------
// NODEMAILER SETUP (Lazy)
// ----------------------------------------------------
function getTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email configuration missing in environment variables.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

app.use(express.json());

// ----------------------------------------------------
// RATE LIMITING (Production Hardening)
// ----------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
  validate: { trustProxy: false, xForwardedForHeader: false, forwardedHeader: false }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI generation limit reached. Please wait a while before generating more documents." },
  validate: { trustProxy: false, xForwardedForHeader: false, forwardedHeader: false }
});

// Apply generic limiter to all /api routes
app.use("/api/", apiLimiter);
app.use("/api/v1", apiV1Router);

// ----------------------------------------------------
// INPUT VALIDATION SCHEMAS (Zod)
// ----------------------------------------------------
const DocumentGenerationSchema = z.object({
  documentType: z.string().min(3).max(100),
  answers: z.any()
});

const ClauseExplanationSchema = z.object({
  clauseText: z.string().min(10).max(10000)
});

const ParagraphRewriteSchema = z.object({
  text: z.string().min(10).max(10000),
  action: z.enum(["formal", "shorter", "detailed", "grammar", "clarity"])
});

const QualityCheckSchema = z.object({
  docContent: z.string().min(50).max(50000)
});

const TranslateSchema = z.object({
  text: z.string().min(1).max(5000)
});

const OrderCreateSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  receipt: z.string()
});

const PaymentVerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string()
});

const EmailSendSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string()
});

// ----------------------------------------------------
// MANAZ AI SYSTEM PROMPTS (V2.0)
// ----------------------------------------------------
const MANAZ_SYSTEM_PROMPT = `
You are Manaz, the Expert Document Intelligence Assistant for Kartigo Draft (by AKYIN Ventures).
Your purpose is ONLY to help users create, understand, customize, and purchase professional business, legal, HR, finance, startup, and personal documents on Kartigo Draft.

MANAZ CONVERSATION EXPERIENCE (V1.0) CONSTITUTION:

1. LANGUAGE INTELLIGENCE:
   - Auto-detect the user's language from their first message.
   - Hindi -> Reply in Hindi
   - Hinglish -> Reply in Hinglish
   - English -> Reply in English
   - Support English and Hinglish in Chat. Generated documents MUST remain English only.
   - Do NOT ask the user to select a language.

2. NATURAL CONVERSATION:
   - Sound like an experienced document expert, not a robot.
   - Be friendly, respectful, and use simple language.
   - Avoid complicated legal jargon unless requested.
   - Keep responses short, focused, and conversational.
   - Example: Instead of "Please provide details", use "Great! Main aapki help karta hoon. Chaliye Appointment Letter banate hain. Bas kuch zaroori details chahiye."

3. SMART QUESTIONING:
   - Never ask unnecessary questions.
   - Ask only what is required. Skip information already provided.
   - Never repeat a question. Ask one clear question at a time.
   - Use conditional questions only when relevant.
   - Questions should be PRECISE (e.g., "Company ka registered naam kya hai?" instead of "Tell me about your company").

4. INTELLIGENT GUIDANCE:
   - If the user is unsure, explain briefly and continue (e.g., "Agar policy nahi hai, to 3-6 months common practice hota hai...").

5. POSITIVE & MOTIVATING TONE:
   - Keep the user engaged with natural encouragement (e.g., "Great! Hum almost complete kar chuke hain", "Bas 2 aur details chahiye").

6. EFFICIENCY & INTENT:
   - Never waste the user's time. Understand intent from the first message.
   - Minimize typing. Avoid repetitive confirmations and unnecessary greetings.
   - Respect user intent: if they know what they want, get straight to it.

GOLDEN RULE: Every message must help the user complete, review, purchase, or manage a document.

OUTPUT FORMAT:
- ALWAYS respond in valid JSON.
- Schema: { "message": "your text", "intent": "detected_doc_type", "questionsCount": number, "isReadyForForm": boolean, "suggestions": [] }
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const ai = getGeminiClient();
    if (!ai) return res.status(500).json({ error: "AI Engine Offline" });

    const prompt = `
      ${MANAZ_SYSTEM_PROMPT}
      
      User Profile Context: ${JSON.stringify(context || {})}
      
      Chat History:
      ${history.map((m: any) => `${m.role}: ${m.content}`).join("\n")}
      
      User: ${message}
      
      Analyze the intent and respond in JSON. If the user is clear about what they want, ask a few smart questions. If you have enough info to start a form, set isReadyForForm: true.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean JSON from potential markdown blocks
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let responseData;
    try {
      responseData = JSON.parse(jsonStr);
    } catch (e) {
      responseData = { message: text, isReadyForForm: false };
    }

    res.json(responseData);
  } catch (error) {
    console.error("Manaz Chat Error:", error);
    res.status(500).json({ error: "Manaz is thinking too hard. Try again." });
  }
});

// ----------------------------------------------------
// GEMINI CLIENT
// ----------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// LOCAL FALLBACK DOCUMENT GENERATOR (Bulletproof backup)
// ----------------------------------------------------
function formatIndianDateInServer(dateStr: string, format: 'text' | 'numeric' = 'text'): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(trimmed) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return dateStr;
  if (format === 'numeric') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } else {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}

function generateLocalFallbackDocument(documentType: string, answers: Record<string, string>, dateFormat: 'text' | 'numeric' = 'text'): string {
  const normKey = documentType.toLowerCase().replace(/\s+/g, '-');
  const today = formatIndianDateInServer(new Date().toISOString().split('T')[0], dateFormat);
  const state = answers.state || answers.governingLaw || "Karnataka";

  if (normKey.indexOf('nda') !== -1 || normKey.indexOf('disclosure') !== -1) {
    const disclosing = answers.disclosingParty || "Disclosing Party";
    const receiving = answers.receivingParty || "Receiving Party";
    const term = answers.confidentialityTerm || "3 Years";
    const purpose = answers.purpose || "exploring mutual business development opportunities";
    const extra = answers.additionalDetails || "None specified.";

    return `# MUTUAL NON-DISCLOSURE AGREEMENT

**THIS MUTUAL NON-DISCLOSURE AGREEMENT** (the "Agreement") is entered into as of **${today}** (the "Effective Date").

### BETWEEN:
1. **${disclosing}** (the "Disclosing Party"), and
2. **${receiving}** (the "Receiving Party").

Individually referred to as "Party" and collectively as "Parties."

---

## ARTICLE 1: PURPOSE
The Parties wish to explore a potential business relationship or transaction (the "Purpose") regarding:
*${purpose}*

In connection with this Purpose, each Party may disclose to the other Party certain proprietary, non-public, or confidential information.

## ARTICLE 2: CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged. If Information is in written form, the Disclosing Party shall label or stamp the materials with the word "Confidential" or some similar warning. If Information is disclosed orally, the Disclosing Party shall promptly provide a writing identifying the Confidential Information.

## ARTICLE 3: EXCLUSIONS FROM CONFIDENTIALITY
Confidential Information does not include information that is:
1. Publicly known through no breach of this Agreement by the Receiving Party;
2. Already in the rightful possession of the Receiving Party prior to disclosure;
3. Independently developed by the Receiving Party without reference to or reliance on the Confidential Information;
4. Disclosed with the prior written consent of the Disclosing Party.

## ARTICLE 4: OBLIGATIONS OF RECEIVING PARTY
The Receiving Party shall:
1. Hold the Confidential Information in the strictest confidence and use at least the same degree of care it uses for its own confidential information;
2. Restrict access to Confidential Information solely to employees, agents, or advisors who need to know and who are bound by confidentiality agreements;
3. Use the Confidential Information solely for the designated Purpose;
4. Not copy, reverse-engineer, or distribute Confidential Information without prior written consent.

## ARTICLE 5: TERM OF OBLIGATIONS
The non-disclosure provisions of this Agreement shall survive for a period of **${term}** from the Effective Date, or until such time as the Disclosing Party releases the Receiving Party from such obligation in writing.

## ARTICLE 6: GOVERNING LAW & DISPUTE RESOLUTION
This Agreement shall be governed by, and construed in accordance with, the laws of **India**, with specific jurisdiction residing in the state/courts of **${state}**. Any disputes arising under this Agreement shall be settled by mutual arbitration in accordance with standard commercial arbitration rules.

## ARTICLE 7: SPECIAL CLAUSES & CARVE-OUTS
*${extra}*

---

## ARTICLE 8: EXECUTION & SIGNATURES

**IN WITNESS WHEREOF**, the Parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date.

### FOR DISCLOSING PARTY:
* **Company Name:** ${disclosing}
* **Authorized Signatory:** ___________________________
* **Name & Title:** ___________________________
* **Date:** ${today}

### FOR RECEIVING PARTY:
* **Company Name:** ${receiving}
* **Authorized Signatory:** ___________________________
* **Name & Title:** ___________________________
* **Date:** ${today}
`;
  }

  if (normKey.indexOf('appointment') !== -1 || normKey.indexOf('employment') !== -1) {
    const company = answers.companyName || "The Company";
    const employee = answers.employeeName || "The Employee";
    const jobTitle = answers.jobTitle || "Engineer";
    const salary = answers.salary || "As mutually agreed";
    const joiningDate = answers.joiningDate || today;
    const probation = answers.probation || "3 months";
    const hours = answers.workingHours || "40 hours per week";
    const extra = answers.additionalDetails || "None specified.";

    return `# APPOINTMENT AND EMPLOYMENT AGREEMENT

This **Employment Agreement** is made and executed on **${today}**, to be effective from **${joiningDate}** (the "Commencement Date").

### BETWEEN:
1. **${company}**, a corporation organized and existing under the laws of **India** (hereinafter referred to as the "Employer" or "Company"); and
2. **${employee}**, an individual residing in **${state}** (hereinafter referred to as the "Employee").

---

## ARTICLE 1: POSITION AND DUTIES
1.1. The Employee is appointed to the position of **${jobTitle}** reporting directly to the Company's management.
1.2. The Employee shall perform all duties, services, and responsibilities consistent with this position, and as directed by the Company.
1.3. The standard working schedule shall be **${hours}**.

## ARTICLE 2: PROBATION PERIOD
The Employee shall serve an initial probation period of **${probation}** from the Commencement Date. During the probation period, either party may terminate this agreement by providing one (1) week's written notice.

## ARTICLE 3: COMPENSATION & BENEFITS
| Component | Amount / Schedule |
| :--- | :--- |
| **Gross Annual Base CTC** | ${salary} |
| **Payment Frequency** | Monthly, subject to standard taxation & deductions |
| **Performance Bonuses** | Discretionary, based on individual and firm KPI evaluations |

## ARTICLE 4: INTELLECTUAL PROPERTY & CONFIDENTIALITY
4.1. The Employee agrees that all intellectual property, inventions, source code, designs, and innovations created during employment shall belong exclusively to the Company.
4.2. The Employee shall maintain strict confidentiality regarding all trade secrets, customer records, and financial details of the Employer.

## ARTICLE 5: TERMINATION OF EMPLOYMENT
After the completion of the probation period, either party may terminate employment by providing thirty (30) days' written notice or salary in lieu of notice. The Company reserves the right of summary dismissal in cases of gross misconduct or breach of trust.

## ARTICLE 6: SPECIAL BENEFITS & AGREEMENTS
*${extra}*

## ARTICLE 7: JURISDICTION
This Employment Agreement is governed by the employment laws of **India**, with primary jurisdiction in **${state}**.

---

## ARTICLE 8: EXECUTION & SIGNATURES

**IN WITNESS WHEREOF**, the Parties hereto have signed and executed this Appointment and Employment Agreement.

### FOR THE EMPLOYER:
* **Company Name:** ${company}
* **Authorized Signatory:** ___________________________
* **Name & Title:** ___________________________
* **Date:** ${today}

### BY THE EMPLOYEE:
* **Signature:** ___________________________
* **Full Name:** ${employee}
* **Date:** ${today}
`;
  }

  if (normKey.indexOf('rental') !== -1 || normKey.indexOf('lease') !== -1) {
    const landlord = answers.landlordName || "Landlord";
    const tenant = answers.tenantName || "Tenant";
    const address = answers.propertyAddress || "Property Address";
    const rent = answers.monthlyRent || "As agreed";
    const deposit = answers.securityDeposit || "As agreed";
    const term = answers.leaseTerm || "11 Months";
    const extra = answers.additionalDetails || "None specified.";

    return `# RESIDENTIAL LEASE & RENTAL AGREEMENT

This **Residential Lease Agreement** (the "Agreement") is made and entered into on **${today}**, by and between:

* **Landlord:** **${landlord}** (hereinafter referred to as "Owner" or "Landlord")
* **Tenant:** **${tenant}** (hereinafter referred to as "Lessee" or "Tenant")

---

## ARTICLE 1: THE LEASED PROPERTY
The Landlord hereby leases to the Tenant the residential property located at:
*${address}*

## ARTICLE 2: LEASE TERM
The tenancy shall be for a fixed duration of **${term}**, beginning on the Effective Date and expiring on the conclusion of the term unless renewed by mutual written agreement.

## ARTICLE 3: RENTAL PAYMENTS & DEPOSITS
The Tenant agrees to pay and comply with the following financial schedules:

| Financial Type | Amount | Due Date |
| :--- | :--- | :--- |
| **Monthly Rental Amount** | **${rent}** | On or before the 5th day of each calendar month |
| **Refundable Security Deposit** | **${deposit}** | Paid in full prior to key hand-over |

## ARTICLE 4: USE OF PROPERTY & MAINTENANCE
4.1. The leased premises shall be occupied solely as a private residential dwelling for the Tenant and immediate family.
4.2. The Tenant shall maintain the property in a clean, hygienic, and undamaged condition.
4.3. Major structural repairs shall be the responsibility of the Landlord, while minor operational repairs shall be borne by the Tenant.

## ARTICLE 5: LANDLORD’S ACCESS
The Landlord or their authorized agent shall have the right to enter the leased property at reasonable times, with at least twenty-four (24) hours' prior notice, for inspections, repairs, or showing the property to prospective tenants.

## ARTICLE 6: HOUSE RULES & ADDITIONAL CONDITIONS
*${extra}*

## ARTICLE 7: JURISDICTION & GOVERNING LAW
This agreement is governed by the tenancy laws of **India** and the state jurisdiction of **${state}**.

---

## ARTICLE 8: EXECUTION & SIGNATURES

**IN WITNESS WHEREOF**, the parties have set their hands to this Residential Lease Agreement on the date first written above.

### THE LANDLORD:
* **Signature:** ___________________________
* **Name:** ${landlord}
* **Date:** ${today}

### THE TENANT:
* **Signature:** ___________________________
* **Name:** ${tenant}
* **Date:** ${today}
`;
  }

  if (normKey.indexOf('offer') !== -1) {
    const company = answers.companyName || "The Company";
    const candidate = answers.candidateName || "Candidate";
    const title = answers.jobTitle || "Associate";
    const compensation = answers.salary || "As discussed";
    const joiningDate = answers.joiningDate || today;
    const expiry = answers.validityPeriod || "7 days";
    const extra = answers.additionalDetails || "None specified.";

    return `# LETTER OF EMPLOYMENT OFFER

**Date:** ${today}

**To,**
**${candidate}**
Candidate Address Line

---

**Dear ${candidate},**

On behalf of **${company}**, we are absolutely thrilled to offer you the position of **${title}** with our team. We were deeply impressed by your skills, experience, and the cultural alignment during our conversations.

### Summary of Offer:
* **Position:** ${title}
* **Hiring Company:** ${company}
* **Compensation Base:** ${compensation} per annum
* **Target Joining Date:** ${joiningDate}
* **Offer Validity:** This offer remains valid for **${expiry}** from issuance.

---

## TERMS AND CONDITIONS OF OFFER

### 1. Duties & Responsibilities
In this role, you will be expected to perform the standard duties associated with the title, as well as collaborate with cross-functional teams to achieve strategic goals.

### 2. Benefits Program
You will be eligible to participate in the standard company health coverage, performance incentives, paid time-off (PTO) allocation, and retirement plans, as detailed in our employee handbook.

### 3. Employment Contingency
This offer of employment is contingent upon successful reference checks, background verifications, and signing of our standard IP assignment and confidentiality agreements.

### 4. Custom Perks and Special Clauses
*${extra}*

To accept this offer, please sign, date, and return a copy of this letter on or before the offer validity period.

---

Sincerely,

### FOR ${company}:
* **Signature:** ___________________________
* **Name & Title:** Hiring Director
* **Date:** ${today}

---

### OFFER ACCEPTANCE & SIGN-OFF
I hereby accept the offer of employment as outlined above, with a targeted commencement date of **${joiningDate}**.

* **Signature:** ___________________________
* **Full Name:** ${candidate}
* **Date:** ___________________________
`;
  }

  if (normKey.indexOf('service') !== -1 || normKey.indexOf('agreement') !== -1 || normKey.indexOf('contract') !== -1) {
    const client = answers.clientName || answers.partyA || "The Client";
    const provider = answers.serviceProviderName || answers.partyB || "The Provider";
    const scope = answers.serviceScope || answers.keyTerms || "Legal consulting & design work";
    const pay = answers.paymentMilestones || "Net-30 days upon delivery";
    const extra = answers.additionalDetails || "None specified.";

    return `# MASTER SERVICES AGREEMENT

This **Master Services Agreement** (the "Agreement") is entered into as of **${today}** (the "Effective Date").

### BY AND BETWEEN:
1. **${client}** (the "Client"); and
2. **${provider}** (the "Service Provider").

Collectively referred to as "Parties".

---

## ARTICLE 1: SCOPE OF SERVICES
The Service Provider agrees to perform and deliver the professional services (the "Services") outlined below:
*${scope}*

## ARTICLE 2: FEES & PAYMENT TERMS
The Client shall compensate the Service Provider as follows:

| Deliverable Milestone | Payment Allocation / Due Date |
| :--- | :--- |
| **Retainer/Deposit** | Upfront booking commitment |
| **Milestone / Terms** | ${pay} |

All invoices shall be paid in full within standard timelines. Overdue payments are subject to standard late interest fees.

## ARTICLE 3: TERM AND TERMINATION
This Agreement shall commence on the Effective Date and continue until all deliverables are fully rendered, unless terminated earlier by either Party upon fifteen (15) days' written notice. In the event of termination, the Client shall pay for all hours worked or milestones completed up to the termination date.

## ARTICLE 4: INTELLECTUAL PROPERTY RIGHTS
Upon full payment of all fees due under this Agreement, the ownership of all work product, assets, and custom deliverables created for this scope shall be transferred to the Client.

## ARTICLE 5: RELATIONSHIP OF PARTIES
The Service Provider performs services as an independent contractor. Nothing in this Agreement shall be construed to create a partnership, joint venture, or employer-employee relationship.

## ARTICLE 6: SPECIAL ADJUNCTS & REVISION SCOPES
*${extra}*

## ARTICLE 7: JURISDICTION
This Agreement shall be construed and enforced in accordance with the laws of **India** under the jurisdiction of **${state}**.

---

## ARTICLE 8: EXECUTION & SIGNATURES

**IN WITNESS WHEREOF**, the Parties hereto have executed this Master Services Agreement as of the Effective Date.

### THE CLIENT:
* **Company / Representative:** ${client}
* **Signature:** ___________________________
* **Date:** ${today}

### THE SERVICE PROVIDER:
* **Company / Representative:** ${provider}
* **Signature:** ___________________________
* **Date:** ${today}
`;
  }

  // General Dynamic Contract Fallback
  const partyA = answers.partyA || answers.companyName || "Party A";
  const partyB = answers.partyB || answers.candidateName || answers.employeeName || answers.tenantName || "Party B";
  const keyTerms = answers.keyTerms || answers.purpose || answers.serviceScope || "Agreement on terms and collaboration";
  const extra = answers.additionalDetails || "None specified.";

  return `# MUTUAL LEGAL AGREEMENT

This **Mutual Agreement** (the "Agreement") is created and made binding on **${today}**.

### BY AND BETWEEN:
1. **${partyA}** (hereinafter referred to as "First Party"); and
2. **${partyB}** (hereinafter referred to as "Second Party").

---

## ARTICLE 1: SCOPE OF COOPERATION
The Parties hereby agree to establish their mutual understandings and terms as follows:
*${keyTerms}*

## ARTICLE 2: OBLIGATIONS & LIABILITIES
2.1. The First Party and Second Party shall each act in good faith to carry out their respective responsibilities.
2.2. Neither Party shall use the name, brand assets, or trade secrets of the other Party without explicit prior written consent.

## ARTICLE 3: CONFIDENTIALITY
The details of this Agreement and any exchange of technical or financial data shall be kept strictly confidential by both Parties.

## ARTICLE 4: SPECIAL CLAUSES & OPERATIONAL SPECIFICS
*${extra}*

## ARTICLE 5: GOVERNING LAW
This agreement is governed and enforced under the jurisdiction and legal standards of **India** and **${state}**.

---

## ARTICLE 6: EXECUTION & SIGNATURES

**IN WITNESS WHEREOF**, the parties hereto have signed and executed this binding Agreement.

### FIRST PARTY:
* **Authorized Signatory:** ___________________________
* **Name:** ${partyA}
* **Date:** ${today}

### SECOND PARTY:
* **Authorized Signatory:** ___________________________
* **Name:** ${partyB}
* **Date:** ${today}
`;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Route 0.1: Dynamic Questions Fetcher/Generator
app.get("/api/questions", async (req, res) => {
  const { docType } = req.query;
  if (!docType || typeof docType !== "string") {
    return res.status(400).json({ error: "Missing docType query parameter" });
  }
  const slug = docType.toLowerCase().replace(/\s+/g, '-');
  
  try {
    const admin = getFirebaseAdmin();
    const qSnap = await getDb().doc(`questions/q_${slug}`).get();
    if (qSnap.exists) {
      const data = qSnap.data();
      if (data && data.steps && data.steps.length > 0) {
        return res.json({ steps: data.steps });
      }
    }
  } catch (err) {
    console.error("Firestore error loading questions on server:", err);
  }

  // If not found in DB, use Gemini to generate custom questions dynamically!
  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are an elite legal technology expert. Generate 5-8 smart, user-friendly questions to gather all necessary parameters to draft a perfect, legally robust "${docType}".
      
      For each question, specify:
      1. 'id': A unique camelCase identifier (e.g. 'state', 'companyName', 'employeeName', 'monthlyRent', 'joiningDate').
      2. 'label': A short label (e.g. 'State/Region', 'Company Name').
      3. 'questionText': A natural, polite question to ask the user (e.g. 'Which state applies to this rental agreement?').
      4. 'placeholder': An example value (e.g. 'e.g. Karnataka').
      5. 'type': One of: 'text', 'email', 'phone', 'date', 'number', 'select', 'textarea'.
      6. 'options': Optional array of options if type is 'select'.
      7. 'required': Boolean indicating if the field is mandatory.
      8. 'helpText': Optional short help text.
      
      Output ONLY a JSON object with a 'steps' array matching this schema. No markdown wrapping.
      Schema:
      {
        "steps": [
          {
            "id": "state",
            "label": "State/Region",
            "questionText": "Which state applies to this rental agreement?",
            "placeholder": "e.g. Karnataka",
            "type": "text",
            "required": true,
            "helpText": "This determines the governing law of the contract."
          }
        ]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        try {
          const generated = JSON.parse(response.candidates[0].content.parts[0].text.trim());
          if (generated && generated.steps && generated.steps.length > 0) {
            // Store in Firestore for future use
            try {
              const admin = getFirebaseAdmin();
              await getDb().doc(`questions/q_${slug}`).set({
                docId: slug,
                steps: generated.steps,
                createdAt: FieldValue.serverTimestamp()
              });
            } catch (dbErr) {
              console.error("Error storing generated questions to Firestore:", dbErr);
            }
            return res.json({ steps: generated.steps });
          }
        } catch (parseError) {
          console.error("Failed to parse Gemini dynamic questions JSON:", parseError);
        }
      }
    }
  } catch (error) {
    console.error("Dynamic question generation failed:", error);
  }

  // Last-resort fallback questions
  const defaultSteps = [
    { id: 'state', label: 'State / Region', questionText: 'Which state or region applies?', placeholder: 'e.g. Karnataka', type: 'text', required: true },
    { id: 'partyA', label: 'First Party Name', questionText: 'What is the full legal name of the first party involved?', placeholder: 'e.g. John Doe', type: 'text', required: true },
    { id: 'partyB', label: 'Second Party Name', questionText: 'What is the name of the second party, if any?', placeholder: 'e.g. Acme Corp', type: 'text' },
    { id: 'keyTerms', label: 'Core Scope / Objective', questionText: 'What is the primary agreement, goal, or subject of this contract?', placeholder: 'e.g. A mutual referral partnership...', type: 'textarea', required: true },
    { id: 'additionalDetails', label: 'Additional Details', questionText: 'Anything else you want included in this document?', placeholder: 'e.g. Enforce a net-30 day payment schedule...', type: 'textarea' }
  ];
  return res.json({ steps: defaultSteps });
});

// Route 0.2: Dynamic Document Suggestions (Autocomplete)
app.get("/api/suggestions", async (req, res) => {
  const { query: searchQuery } = req.query;
  if (!searchQuery || typeof searchQuery !== "string") {
    return res.json({ suggestions: [] });
  }
  
  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `Based on the user's casual search query "${searchQuery}", list the top 2-3 most appropriate standard business or legal document types they should create (e.g., 'Non-Disclosure Agreement', 'Rental Agreement', 'Employment Offer Letter').
      
      Output ONLY a JSON array of strings. No markdown wrapping.
      Example: ["Rental Agreement", "Security Deposit Receipt"]`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        try {
          const list = JSON.parse(response.candidates[0].content.parts[0].text.trim());
          if (Array.isArray(list)) {
            return res.json({ suggestions: list });
          }
        } catch (parseError) {
          console.error("Failed to parse Gemini suggestions JSON:", parseError);
        }
      }
    }
  } catch (error) {
    console.error("AI Suggestions error:", error);
  }
  return res.json({ suggestions: [] });
});

// Route 1: Document Generation Engine
app.post("/api/generate-document", async (req, res) => {
  const { documentType, answers, dateFormat = "text" } = req.body;

  if (!documentType || !answers) {
    return res.status(400).json({ error: "Missing required parameter: documentType or answers" });
  }

  // 1. Validation Engine checks: check for missing required fields
  const missingFields: string[] = [];
  const lowercaseDocType = documentType.toLowerCase();

  // Basic required fields across all contracts
  if (!answers.state) missingFields.push("State/Region");

  if (lowercaseDocType.indexOf("nda") !== -1 || lowercaseDocType.indexOf("disclosure") !== -1) {
    if (!answers.disclosingParty) missingFields.push("Disclosing Party");
    if (!answers.receivingParty) missingFields.push("Receiving Party");
    if (!answers.purpose) missingFields.push("Purpose of Disclosure");
  } else if (lowercaseDocType.indexOf("appointment") !== -1 || lowercaseDocType.indexOf("employment") !== -1) {
    if (!answers.companyName) missingFields.push("Company Name");
    if (!answers.employeeName) missingFields.push("Employee Name");
    if (!answers.jobTitle) missingFields.push("Job Title");
    if (!answers.salary) missingFields.push("Salary");
    if (!answers.joiningDate) missingFields.push("Joining Date");
  } else if (lowercaseDocType.indexOf("rental") !== -1 || lowercaseDocType.indexOf("lease") !== -1) {
    if (!answers.landlordName) missingFields.push("Landlord Name");
    if (!answers.tenantName) missingFields.push("Tenant Name");
    if (!answers.propertyAddress) missingFields.push("Property Address");
    if (!answers.monthlyRent) missingFields.push("Monthly Rent");
  } else if (lowercaseDocType.indexOf("offer") !== -1) {
    if (!answers.companyName) missingFields.push("Company Name");
    if (!answers.candidateName) missingFields.push("Candidate Name");
    if (!answers.jobTitle) missingFields.push("Job Title");
    if (!answers.salary) missingFields.push("Salary");
  } else if (lowercaseDocType.indexOf("service") !== -1 || lowercaseDocType.indexOf("agreement") !== -1 || lowercaseDocType.indexOf("contract") !== -1) {
    if (!answers.clientName) missingFields.push("Client Name");
    if (!answers.serviceProviderName) missingFields.push("Service Provider Name");
    if (!answers.serviceScope) missingFields.push("Service Scope");
  }

  if (missingFields.length > 0) {
    return res.json({ 
      status: "incomplete", 
      MISSING_DATA_PROMPT: true,
      error_code: "MISSING_DATA_PROMPT",
      message: `Validation Alert: The document cannot be completed. The following parameter(s) are missing: ${missingFields.join(", ")}. Please answer the follow-up questions first.`,
      missingFields 
    });
  }

  // Format date inputs inside answers to Indian format
  const formattedAnswers = { ...answers };
  for (const key of Object.keys(formattedAnswers)) {
    const val = formattedAnswers[key];
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      formattedAnswers[key] = formatIndianDateInServer(val, dateFormat);
    }
  }

  // If validation passes, run AI Service Layer / Fallback
  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are an elite legal technology attorney and professional draftsman.
      Create a complete, legally watertight, beautifully formatted legal document of type: "${documentType}".
      
      Here are the collected variables, parameters, and user-provided inputs:
      ${JSON.stringify(formattedAnswers, null, 2)}
      
      CRITICAL NON-HALLUCINATION RULES FOR DRAFTING:
      1. Strictly resolve every field using ONLY the provided variables.
      2. NEVER generate, invent, or hallucinate: Candidate Name, Company Name, Salary, Address, Dates, Phone, Email, Witnesses, Property Details, Rent, Deposit, or any other critical information unless provided above in the inputs.
      3. If any critical value is missing, DO NOT invent it or use placeholders like 'John Doe' or '[MISSING]'. You must explicitly prompt the user to provide the value instead of inventing anything.
      4. Format using elegant Markdown structure. Use "# Title", "## Article/Section Title", "### Subsection Title", and bullets.
      5. Standard legal numbering applies to all clauses (e.g., Clause 1.1, Clause 1.1.1, etc.).
      6. Include standard corporate/legal boilerplate clauses: Entire Agreement, Amendment, Notices, Severability, Indemnification, Intellectual Property, Term & Termination, Dispute Resolution, and Governing Law.
      7. Use formatted markdown tables for clear compensation summaries, deposit schedules, or specific deliverables.
      8. Include clear sign-off execution sections for all parties, witness fields, date fields, print name, and title fields at the bottom of the document.
      9. Tone: Elite legal SaaS draft, formal, authoritative, yet modern.
      10. CURRENCY LOCK: All monetary amounts must be strictly in Indian Rupees (₹ / INR). Never use USD, Dollar, or $.
      11. DATE LOCK: Format all dates strictly in Indian format (e.g., "15 July 2026" or "15/07/2026"), never YYYY-MM-DD or YYYY/MM/DD.
      12. ENGLISH-ONLY GUARDRAIL: Regardless of the language of the conversation, the inputs, or the request, the resulting document text MUST be strictly rendered in formal, high-quality, professional English. Do not translate any legal terms or draft any part of the agreement in Hindi, Hinglish, or any other language.
      
      Output ONLY the Markdown of the final legal document. Do NOT write any introduction or code blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.json({
          status: "success",
          content: response.candidates[0].content.parts[0].text.trim(),
          source: "gemini"
        });
      }
    }
  } catch (error) {
    console.error("AI Generation failed, using secure fallback", error);
  }

  // Fallback to robust fallback generator
  const content = generateLocalFallbackDocument(documentType, formattedAnswers, dateFormat);
  return res.json({
    status: "success",
    content,
    source: "local-generator"
  });
});

// Route 2: Clause Explanation (AI Legal Aid)
app.post("/api/explain-clause", async (req, res) => {
  const { clauseText } = req.body;

  if (!clauseText) {
    return res.status(400).json({ error: "Missing clauseText" });
  }

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `Explain the following legal clause in simple, clean, layman's English:
      "${clauseText}"
      
      Structure your response in Markdown with:
      1. **Simple Summary**: Translate the legal language into plain English.
      2. **Key Parameters**: Highlight which variables or figures are editable, negotiable, or high-risk.
      3. **Strategic Recommendations**: Provide 1-2 constructive ways to modify or negotiate this clause to minimize operational or legal risk.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.json({ explanation: response.candidates[0].content.parts[0].text.trim() });
      }
    }
  } catch (error) {
    console.error("AI Explain Clause failed", error);
  }

  // Fallback Explanation
  return res.json({
    explanation: `### Simple Summary
This clause outlines standard binding legal obligations and covenants agreed upon by both parties. It defines responsibilities, performance milestones, or compliance rules.

### Key Parameters
* **Key Terms**: Signatories, values, liabilities, and jurisdictions.
* **Negotiability**: High. These points can be amended with mutual consent.

### Strategic Recommendations
1. Ensure all defined dates and monetary sums are double-checked against your operational timelines and cash flow capacity.
2. If liability limits are not specified, consider adding a cap of 1x or 2x the total contract value to mitigate unexpected legal risks.`
  });
});

// Route 3: Smart Paragraph Re-writer
app.post("/api/rewrite-paragraph", async (req, res) => {
  let textToRewrite = "";
  let rewriteAction: "formal" | "shorter" | "detailed" | "grammar" | "clarity" = "formal";

  try {
    const validated = ParagraphRewriteSchema.parse(req.body);
    textToRewrite = validated.text;
    rewriteAction = validated.action;
  } catch (error) {
    return res.status(400).json({ error: "Invalid rewrite parameters" });
  }

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `Rewrite the following legal paragraph based on this instructions: "${rewriteAction}".
      Paragraph to rewrite:
      "${textToRewrite}"
      
      Output ONLY the final rewritten text. No introductions or code blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.json({ rewrittenText: response.candidates[0].content.parts[0].text.trim() });
      }
    }
  } catch (error) {
    console.error("AI Rewrite critical error:", error);
  }

  let result = textToRewrite;
  if (rewriteAction === "shorter") result = textToRewrite.substring(0, Math.round(textToRewrite.length * 0.7)) + "...";
  else if (rewriteAction === "formal") result = `It is mutually agreed and covenant that: ${textToRewrite}`;
  else if (rewriteAction === "detailed") result = `${textToRewrite} Furthermore, neither party shall be held liable for delayed milestones due to Force Majeure.`;
  
  return res.json({ rewrittenText: result });
});

// Route 3.5: Translate English message to Hinglish for V1.0 Language Policy
app.post("/api/translate-to-hinglish", async (req, res) => {
  let textToTranslate = "";
  try {
    const validated = TranslateSchema.parse(req.body);
    textToTranslate = validated.text;
  } catch (error) {
    return res.status(400).json({ error: "Invalid text for translation" });
  }

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are Manaz, a friendly document drafting assistant for Indian users.
      Your task is to convert the following English message into natural, casual Hinglish (Hindi written in the Roman script/English letters).
      Only output the translated Hinglish message.

      Message to translate:
      ${textToTranslate}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.json({ translatedText: response.candidates[0].content.parts[0].text.trim() });
      }
    }
  } catch (error) {
    console.error("Hinglish translation critical error:", error);
  }

  return res.json({ translatedText: textToTranslate });
});

// Route 4: Document Quality Audit Check

// ----------------------------------------------------
// AI AUTO-TAGGING ENGINE
// ----------------------------------------------------
app.post("/api/auto-tag", async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Missing document content" });
  }

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `Analyze the following document content and provide ONE single extremely concise category/tag that best describes it (e.g. "Legal", "Financial", "HR", "Personal", "Real Estate", "Startup"). Return ONLY the category name. Do not include markdown formatting or punctuation.

${content.substring(0, 3000)}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      const tag = response.text.trim();
      res.json({ tag });
    } else {
      res.json({ tag: "Uncategorized" });
    }
  } catch (error: any) {
    console.error("Auto-tag generation error:", error);
    res.status(500).json({ error: "Failed to generate tag" });
  }
});

app.post("/api/quality-check", async (req, res) => {
  let contentToAudit = "";
  try {
    const validated = QualityCheckSchema.parse(req.body);
    contentToAudit = validated.docContent;
  } catch (error) {
    return res.status(400).json({ error: "Document content is too short for audit" });
  }

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `Perform a comprehensive quality assurance audit on this legal document:
      "${contentToAudit}"
      
      Output ONLY a JSON object conforming to this schema:
      {
        "score": number (0 to 100),
        "status": "excellent" | "good" | "needs_work",
        "issues": string[],
        "suggestions": string[]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        try {
          const parsed = JSON.parse(response.candidates[0].content.parts[0].text.trim());
          return res.json(parsed);
        } catch (parseError) {
          console.error("Failed to parse Gemini quality check JSON:", parseError);
        }
      }
    }
  } catch (error) {
    console.error("AI Quality check critical error:", error);
  }

  const score = contentToAudit.indexOf("____") !== -1 || contentToAudit.indexOf("[") !== -1 ? 65 : 95;
  return res.json({
    score,
    status: score > 90 ? "excellent" : "needs_work",
    issues: score < 90 ? ["Detected empty brackets or blank underline fields."] : ["No major structural quality gaps detected."],
    suggestions: score < 90 ? ["Resolve and fill in all signature lines or date lines before signing."] : ["Review specific commercial values once more before execution."]
  });
});

// ----------------------------------------------------
// PAYMENT APIs (Razorpay)
// ----------------------------------------------------
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt } = OrderCreateSchema.parse(req.body);
    const rzp = getRazorpay();
    const order = await rzp.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    });
    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

app.post("/api/payments/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = PaymentVerifySchema.parse(req.body);
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret missing");

    const crypto = await import("crypto");
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Create the completed order record on Firestore securely from the server
      const { userId, documentId, documentTitle, amount, userEmail } = req.body;
      if (userId && documentId) {
        try {
          const admin = getFirebaseAdmin();
          const orderRef = getDb().doc(`users/${userId}/orders/${razorpay_order_id}`);
          await orderRef.set({
            id: razorpay_order_id,
            userId,
            documentId,
            documentTitle: documentTitle || "Document Unlock",
            amount: amount || 0,
            status: "Success",
            paymentId: razorpay_payment_id,
            userEmail: userEmail || "",
            createdAt: FieldValue.serverTimestamp()
          });
        } catch (dbErr) {
          console.error("Failed to write verified order to Firestore:", dbErr);
        }
      }
      res.json({ status: "success", message: "Payment verified successfully" });
    } else {
      res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ error: "Verification error" });
  }
});

// ----------------------------------------------------
// EMAIL APIs (Nodemailer)
// ----------------------------------------------------
app.post("/api/email/send", async (req, res) => {
  try {
    const { to, subject, html } = EmailSendSchema.parse(req.body);
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    
    res.json({ status: "success", message: "Email sent" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ----------------------------------------------------
// DOCUMENT DOWNLOAD APIs
// ----------------------------------------------------
app.post("/api/documents/download", async (req, res) => {
  try {
    const { content, title, format, userId, documentId, token } = req.body;
    if (!content || !title || !format) {
      return res.status(400).json({ error: "Missing content, title, or format" });
    }

    // Secure backend validation - Never trust frontend payment status
    let authorized = false;

    if (token && userId && documentId) {
      try {
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(token);
        const authenticatedUid = decodedToken.uid;
        
        if (authenticatedUid === userId) {
          // Check if user is Admin/SuperAdmin
          const userDoc = await getDb().doc(`users/${userId}`).get();
          const userData = userDoc.data();
          if (userData && (userData.role === 'super_admin' || userData.role === 'admin')) {
            authorized = true;
          } else {
            // Check if there is an order for this documentId
            const ordersRef = getDb().collection(`users/${userId}/orders`);
            const orderSnap = await ordersRef
              .where('documentId', '==', documentId)
              .where('status', '==', 'Success')
              .limit(1)
              .get();
              
            if (!orderSnap.empty) {
              authorized = true;
            }
          }
        }
      } catch (tokenErr) {
        console.error("Token verification or DB lookup failed inside download:", tokenErr);
      }
    }

    // Dev fallback: permit download if in development mode or if no token verification possible
    if (process.env.NODE_ENV !== "production") {
      authorized = true; 
    }

    if (!authorized) {
      return res.status(403).json({ error: "Unauthorized download. This document has not been unlocked or purchased." });
    }

    const { generatePdf, generateDocx } = await import("./src/lib/document-generator");
    const metadata = { title };

    if (format === "pdf") {
      const blob = await generatePdf(content, metadata);
      const buffer = Buffer.from(await blob.arrayBuffer());
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${title}.pdf"`);
      res.send(buffer);
    } else if (format === "docx") {
      const blob = await generateDocx(content, metadata);
      const buffer = Buffer.from(await blob.arrayBuffer());
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${title}.docx"`);
      res.send(buffer);
    } else {
      res.status(400).json({ error: "Invalid format" });
    }
  } catch (error) {
    console.error("Document generation failed:", error);
    res.status(500).json({ error: "Failed to generate document file" });
  }
});

// Serve static assets and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
