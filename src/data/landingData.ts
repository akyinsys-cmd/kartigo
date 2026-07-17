import { Category, DocumentTemplate, FAQItem, TestimonialItem, ChatMessage } from '../types';

export const categories: Category[] = [
  {
    id: 'hr',
    title: 'HR Documents',
    description: 'Offer letters, appointment letters, and official HR policies.',
    icon: 'Users',
    status: 'Available'
  },
  {
    id: 'legal',
    title: 'Legal Documents',
    description: 'NDAs, lease agreements, power of attorney, and affidavits.',
    icon: 'Scale',
    status: 'Available'
  },
  {
    id: 'business',
    title: 'Business Documents',
    description: 'Proposals, partnership deeds, MOUs, and joint ventures.',
    icon: 'Briefcase',
    status: 'Available'
  },
  {
    id: 'finance',
    title: 'Finance Documents',
    description: 'Invoices, receipt templates, expense forms, and bills of sale.',
    icon: 'DollarSign',
    status: 'Available'
  },
  {
    id: 'government',
    title: 'Government Documents',
    description: 'Affidavits, self-declaration forms, and application formats.',
    icon: 'FileText',
    status: 'Available'
  },
  {
    id: 'personal',
    title: 'Personal Letters',
    description: 'Resignation letters, formal leave letters, and cover letters.',
    icon: 'Mail',
    status: 'Available'
  },
  {
    id: 'education',
    title: 'Education Documents',
    description: 'Recommendation letters, student NDAs, and study plans.',
    icon: 'GraduationCap',
    status: 'Available'
  },
  {
    id: 'startup',
    title: 'Startup Documents',
    description: 'Co-founder agreements, advisory contracts, and angel NDAs.',
    icon: 'Rocket',
    status: 'Available'
  }
];

export const documents: DocumentTemplate[] = [
  {
    id: 'rent-receipt',
    title: 'Rent Receipt',
    description: 'Official monthly rent payment receipt showing landlord acknowledgment and details.',
    category: 'finance',
    popularity: 90,
    whyUseIt: 'Declare and claim House Rent Allowance (HRA) tax deductions and maintain proof of monthly tenancy payments.',
    requiredInfo: [
      'Landlord Name & PAN Card Number',
      'Tenant Name',
      'Rent Amount Paid & Payment Date',
      'Rented Property Address'
    ],
    draftOutline: [
      '1. Date and Unique Receipt Number',
      '2. Payment Acknowledgment & Tenant Details',
      '3. Month/Period of Rent and Full Property Address',
      '4. Landlord Signature & PAN Reference'
    ],
    relatedDocumentIds: ['rental-agreement', 'security-deposit-receipt']
  },
  {
    id: 'appointment-order',
    title: 'Appointment Order',
    description: 'Formal regulatory employment appointment order confirming executive selection and terms.',
    category: 'hr',
    popularity: 89,
    whyUseIt: 'Officially issue executive and permanent regulatory hire orders conforming to standard company guidelines.',
    requiredInfo: [
      'Company Name',
      'Candidate Name & Designation',
      'Date of Effect & Reporting Guidelines',
      'Scale of Pay & Job Responsibilities'
    ],
    draftOutline: [
      '1. Official Order Statement & Authority Designation',
      '2. Terms of Posting and Department Allocation',
      '3. Standard Pay Scales and Working Hours',
      '4. Authorised Signature and Board Reference'
    ]
  },
  {
    id: 'appointment-letter',
    title: 'Appointment Letter',
    description: 'Formal job appointment contract outlining employee duties and policies.',
    category: 'hr',
    popularity: 95,
    whyUseIt: 'Legally bind new hires, outline explicit job requirements, salary breakup, probation terms, and formal working conditions as required by employment standards.',
    requiredInfo: [
      'Company Name & Registered Address',
      'Candidate Full Name & Permanent Address',
      'Designation & Role Title',
      'Detailed CTC Salary Breakup & Benefits',
      'Reporting Manager, Probation Period & Join Date'
    ],
    draftOutline: [
      '1. Appointment & Subject of Employment',
      '2. Terms of Compensation & Salary Structure',
      '3. Probationary Review Period & Evaluation Metric',
      '4. Strict Confidentiality & IP Transfer Clauses',
      '5. Dispute Resolution & Notice of Termination'
    ],
    relatedDocumentIds: ['offer-letter', 'nda', 'joining-checklist']
  },
  {
    id: 'offer-letter',
    title: 'Offer Letter',
    description: 'Official letter proposing employment with conditional terms of hire.',
    category: 'hr',
    popularity: 92,
    whyUseIt: 'Send an appealing, clean job offer summarizing initial title, salary package, and general expectations before issuing the detailed appointment contract.',
    requiredInfo: [
      'Candidate Name',
      'Proposed Job Title & Work Department',
      'Gross Annual Compensation',
      'Target Joining Date',
      'Validity Period of the Offer'
    ],
    draftOutline: [
      '1. Formal Job Offer Statement',
      '2. Key Terms (Salary, Position, Joining Date)',
      '3. Standard Conditions of Hire (Reference Checks, Education Proof)',
      '4. Basic Benefits & Paid Time Off Summary',
      '5. Acceptance Sign-off Mechanism'
    ],
    relatedDocumentIds: ['appointment-letter', 'nda']
  },
  {
    id: 'experience-letter',
    title: 'Experience Letter',
    description: 'Formal HR certificate validating former employee job title and tenure.',
    category: 'hr',
    popularity: 85,
    whyUseIt: 'Provide official HR confirmation of an employee’s tenure, final job title, conduct, and contribution, critical for their subsequent employment background checks.',
    requiredInfo: [
      'Employee Name & Employee ID',
      'Last Held Designation',
      'Exact Employment Start and End Dates',
      'Direct Supervisor or HR Manager Name',
      'Brief Performance and Conduct Evaluation'
    ],
    draftOutline: [
      '1. Company Letterhead Verification',
      '2. Certification of Employment & Dates of Service',
      '3. Roles and Core Responsibilities Held',
      '4. Official Conduct & Performance Endorsement',
      '5. Signature of HR Manager or Authorised Director'
    ]
  },
  {
    id: 'leave-letter',
    title: 'Leave Letter',
    description: 'Professional request for medical, casual, or urgent personal leave.',
    category: 'personal',
    popularity: 88,
    whyUseIt: 'Ensure your absence from work is formally documented and approved by HR/Management, preventing unauthorized absence flags on your employment history.',
    requiredInfo: [
      'Your Name & Department',
      'Reporting Manager / Supervisor Name',
      'Leave Type (Sick, Casual, Earned, Emergency)',
      'Specific Start and End Dates of Absence',
      'Emergency Contact and Work Handover Details'
    ],
    draftOutline: [
      '1. Subject Line Specifying Leave Period',
      '2. Direct Request & Justification for Leave',
      '3. Actionable Transition Plan for Pending Work',
      '4. Emergency Contact Info & Check-in Frequency',
      '5. Formal Request for Approved Re-entry'
    ]
  },
  {
    id: 'resignation-letter',
    title: 'Resignation Letter',
    description: 'Professional notification of intent to resign from employment.',
    category: 'personal',
    popularity: 90,
    whyUseIt: 'Submit a clean, respectful, legally compliant notice of resignation to HR and managers to schedule smooth transitions, secure final settlement clearances, and preserve positive professional relationships.',
    requiredInfo: [
      'Your Name & Current Role',
      'Reporting Manager Name',
      'Target Last Working Day (LWD)',
      'Specific Period of Notice (e.g., 30 days)',
      'Brief feedback/gratitude statement'
    ],
    draftOutline: [
      '1. Formal Declaration of Resignation',
      '2. Notice Period Terms & Expected Last Working Day',
      '3. Actionable Handover & Transition Strategy',
      '4. Expression of Sincere Thanks for Professional Growth',
      '5. Direct Request for Full and Final Settlement Steps'
    ]
  },
  {
    id: 'rental-agreement',
    title: 'Rental Agreement',
    description: 'Residential or commercial tenancy contract outlining rents and terms.',
    category: 'legal',
    popularity: 97,
    whyUseIt: 'Create a binding, fully protective lease agreement outlining accurate monthly rent, security deposit terms, maintenance liabilities, and eviction guidelines for tenants.',
    requiredInfo: [
      'Landlord Full Name & Address',
      'Tenant Full Name & Address',
      'Complete Property Address',
      'Monthly Rent and Security Deposit Amounts',
      'Lease Duration & Permitted Premises Usage'
    ],
    draftOutline: [
      '1. Identification of Landlord & Tenant Parties',
      '2. Precise Description of Leased Premises',
      '3. Tenancy Term, Renewal Clauses & Rent Adjustments',
      '4. Security Deposit Allocation and Return Rules',
      '5. Repair Obligations & Quiet Enjoyment Covenant',
      '6. Grounds for Termination & Late-payment Penalty Fee'
    ]
  },
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement (NDA)',
    description: 'Strict mutual or one-way confidentiality agreement to protect trade secrets.',
    category: 'legal',
    popularity: 99,
    whyUseIt: 'Legally restrict contractors, developers, partners, or hires from disclosing proprietary technology, confidential trade data, pricing details, or customer intelligence.',
    requiredInfo: [
      'Disclosing Party Legal Entity Name',
      'Receiving Party Name / Entity',
      'Definition & Exclusions of Confidential Information',
      'Term of Confidentiality Protection (e.g., 3 Years, Perpetuity)',
      'Jurisdiction & Governing Law for Disputes'
    ],
    draftOutline: [
      '1. Definition & Scope of Protected Confidential Data',
      '2. Core Non-Disclosure & Non-Circumvention Covenants',
      '3. Explicit Exclusions (Public Data, Independent Discovery)',
      '4. Standard Termination & Survival of Covenants',
      '5. Remedies, Injunctions & Indemnification for Breaches',
      '6. Governing Law & Dispute Resolution Venue'
    ]
  },
  {
    id: 'service-agreement',
    title: 'Service Agreement',
    description: 'Contract specifying service delivery scopes, rates, and deadlines.',
    category: 'business',
    popularity: 91,
    whyUseIt: 'Set explicit deliverables, compensation milestones, intellectual property transfers, and liability shields when contracting out services or serving clients.',
    requiredInfo: [
      'Client Legal Entity Name',
      'Service Provider Name / Company',
      'Exhaustive Description of Deliverables',
      'Payment Milestones, Due Dates & Net Terms',
      'IP Transfer and Indemnification Terms'
    ],
    draftOutline: [
      '1. Appointment of Independent Service Provider',
      '2. Detailed Statement of Work (SOW) & Milestones',
      '3. Compensation Rates, Invoicing, & Late Penalties',
      '4. Ownership and Licensing of Resulting Intellectual Property',
      '5. Warranties, Covenants, & Limitation of Liability',
      '6. Termination Options & Governing Jurisdiction'
    ]
  },
  {
    id: 'freelancer-agreement',
    title: 'Freelancer Agreement',
    description: 'Flexible contract for project-based freelance designers or writers.',
    category: 'business',
    popularity: 89,
    whyUseIt: 'Ensure independent contractor status, protect intellectual property transfer upon final payment, and avoid disputes over revision rounds and project scopes.',
    requiredInfo: [
      'Freelancer Full Name',
      'Client Company Name',
      'Project Scope & Estimated Delivery Dates',
      'Fixed Fee or Hourly Rate',
      'Intellectual Property Transfer Terms'
    ],
    draftOutline: [
      '1. Nature of Independent Contractor Engagement',
      '2. Specific Scope of Works & Client Feedback Cycle',
      '3. Professional Fee Structure & Deposit Terms',
      '4. Absolute Intellectual Property Rights Assignment',
      '5. Confidentiality obligations',
      '6. Notice of Termination & Work-In-Progress Payment'
    ]
  },
  {
    id: 'vendor-agreement',
    title: 'Vendor Agreement',
    description: 'Commercial contract for purchase, distribution, or raw supply supply.',
    category: 'business',
    popularity: 84,
    whyUseIt: 'Formalize business supply arrangements, locking in wholesale prices, bulk shipping timelines, return/refund policies, and inventory quality checks.',
    requiredInfo: [
      'Buyer / Purchaser Legal Entity',
      'Vendor / Supplier Legal Entity',
      'Product specifications, quantity & prices',
      'Delivery schedules, carriers & terms of trade',
      'Standard inspection & defect returns policy'
    ],
    draftOutline: [
      '1. Scope of Commercial Supply & Pricing Schedules',
      '2. Ordering Procedures, Shipments & Packaging Requirements',
      '3. Quality Inspections, Rejections & Replacements',
      '4. Payment Terms, Invoice Disputes & Tax Obligations',
      '5. Force Majeure & Continuity of Bulk Supply Covenants',
      '6. Term, Non-Exclusivity & Dispute Arbitration'
    ]
  },
  {
    id: 'bill-of-sale',
    title: 'Bill of Sale',
    description: 'Commercial receipt transfering legal title of vehicle, equipment, or assets.',
    category: 'finance',
    popularity: 87,
    whyUseIt: 'Legally certify the transfer of asset ownership, record final sale price, specify absolute "as-is" condition, and prevent future disputes over asset liabilities.',
    requiredInfo: [
      'Seller Full Name & Address',
      'Buyer Full Name & Address',
      'Asset Description (VIN, Serial No, Make/Model)',
      'Agreed Purchase Price & Date of Sale',
      'Payment Method (Cash, Check, Bank Transfer)'
    ],
    draftOutline: [
      '1. Identification of Seller & Buyer Parties',
      '2. Full Legal Description of the Asset Being Transferred',
      '3. Explicit Purchase Price & Payment Verification',
      '4. Covenants, Warranties & "As-Is" Status Covenants',
      '5. Seller Representation of Clear Title & No Encumbrance',
      '6. Signatures of Buyer, Seller & Official Witness'
    ]
  },
  {
    id: 'address-affidavit',
    title: 'Affidavit of Address',
    description: 'Formal self-declaration of permanent or current residential address.',
    category: 'government',
    popularity: 91,
    whyUseIt: 'Submit an officially recognized, self-certified declaration of your residential address to satisfy passport, banking, regional local compliance, or other governmental requisites.',
    requiredInfo: [
      'Declarant Full Name & Date of Birth',
      'Exact Residential Address being Certified',
      'Supporting Verification Documents (Aadhaar, Utility bill)',
      'Declarant Parent/Spouse Guardian Name',
      'Purpose of Address Declaration'
    ],
    draftOutline: [
      '1. Solemn Affirmation & Identity Covenants',
      '2. Detailed Statement of Exact Physical Address',
      '3. Verification of Residential Tenure at Current Place',
      '4. Formal Annexure of Identity Proof References',
      '5. Verification statement under penalty of perjury',
      '6. Signature of Declarant & Notary Attestation Space'
    ]
  },
  {
    id: 'letter-of-recommendation',
    title: 'Letter of Recommendation',
    description: 'Professional recommendation letter for academic or career advancement.',
    category: 'education',
    popularity: 83,
    whyUseIt: 'Draft an elegant, professional evaluation of a student or employee to support their applications for universities, research fellowships, or key career advancements.',
    requiredInfo: [
      'Recommender Name & Title/Institution',
      'Applicant Full Name',
      'Relationship & Duration of Academic Connection',
      'Applicant Key Merits, Skills, & Achievements',
      'Target University or Enterprise Title'
    ],
    draftOutline: [
      '1. Salutation & Official Subject Line',
      '2. Recommender Credentials & Nature of Relationship',
      '3. Analytical Assessment of Core Merits & Aptitudes',
      '4. Narrative of Outstanding Projects or Achievements',
      '5. Unconditional Final Recommendation Statement',
      '6. Signature & Recommender Contact Coordinates'
    ]
  },
  {
    id: 'co-founder-agreement',
    title: 'Co-Founder Agreement',
    description: 'Startup contract covering equity splits, vesting schedules, and IP transfer.',
    category: 'startup',
    popularity: 93,
    whyUseIt: 'Avoid co-founder disputes, establish clear vesting schedules to protect company shares, assign intellectual property, and define decision-making mechanisms.',
    requiredInfo: [
      'Full Names of all Co-Founders',
      'Company Name & Initial Business Idea',
      'Equity Ownership Percentages',
      'Vesting Period (e.g. 4-year vest with 1-year cliff)',
      'Individual Role titles and Board structures'
    ],
    draftOutline: [
      '1. Vision, Venture Purpose, & Definition of Initial Idea',
      '2. Initial Capital Contribution & Equity Allocation',
      '3. Reverse Vesting, Cliff Provisions & Acceleration Events',
      '4. Decision-making, Board Voting & Deadlock Resolution',
      '5. Full Assignment of Pre-incorporation Intellectual Property',
      '6. Voluntary/Involuntary Exit of Co-founder & Buyback Terms'
    ]
  },
  {
    id: 'mou',
    title: 'Memorandum of Understanding (MOU)',
    description: 'Non-binding bilateral or multilateral framework agreement establishing intent to collaborate.',
    category: 'business',
    popularity: 94,
    whyUseIt: 'Outline early-stage strategic partnerships, outline resource shares, project guidelines, and joint proposals before signing final definitive legal contracts.',
    requiredInfo: [
      'First Partner Company/Individual Name',
      'Second Partner Company/Individual Name',
      'Scope of Mutual Collaboration & Resource Contributions',
      'Effective Date & Duration of Agreement',
      'Specific Milestones or Conditions for Definitive Agreements'
    ],
    draftOutline: [
      '1. Statement of Purpose & Shared Goals',
      '2. Scope of Collaboration and Project Deliverables',
      '3. Financial Arrangements and Cost Sharing Allocations',
      '4. Confidentiality & Non-Disclosure of Proprietary Material',
      '5. Non-binding nature clause & Termination terms',
      '6. Signatures of Authorized Board Officers'
    ]
  },
  {
    id: 'power-of-attorney',
    title: 'General Power of Attorney (PoA)',
    description: 'Robust authorization deed conferring legal authority to manage assets or represent interests.',
    category: 'legal',
    popularity: 89,
    whyUseIt: 'Appoint a trusted attorney-in-fact to execute property registries, sign banking transactions, and represent you before regulatory bodies when you are unavailable.',
    requiredInfo: [
      'Principal (Grantor) Full Name, Address & Age',
      'Attorney (Agent) Full Name, Address & Relation',
      'Granular definition of powers (Property, Banking, Legal disputes)',
      'Duration & Scope (Revocable or Irrevocable)',
      'Governing Law & Stamp Duty state'
    ],
    draftOutline: [
      '1. Appointment Statement & Identification of Principal & Agent',
      '2. Core Recitals & Justification for Power Transfer',
      '3. Explicit Grant of Powers (Real Estate, Court representation, Taxes)',
      '4. Joint and Several Liability and Revocation Parameters',
      '5. Indemnification of Third Parties acting in Good Faith',
      '6. Principal Acknowledgment & Notarial Seal Allocation'
    ]
  },
  {
    id: 'consulting-agreement',
    title: 'Independent Consulting Agreement',
    description: 'Expert-grade consulting contract defining advisory retainers, scopes, and intellectual property.',
    category: 'business',
    popularity: 92,
    whyUseIt: 'Secure professional consultants, lock down delivery expectations, govern monthly retainer payments, and assign absolute IP rights to your firm.',
    requiredInfo: [
      'Client Company Name',
      'Consultant Full Legal Name & Pan/Tax ID',
      'Monthly Retainer Rate or Project Fees',
      'Specific Advisory Services Scope & Deliverables',
      'Notice period for termination'
    ],
    draftOutline: [
      '1. Independent Contractor Designation & Engagement Scope',
      '2. Statement of Advisory Services & Delivery Schedule',
      '3. Retainer Billing, Invoicing, & Reimbursable Expenses',
      '4. Ownership of Intellectual Property & Inventions Assignment',
      '5. Non-solicitation of Employees & Non-Compete Clauses',
      '6. Termination with/without cause & Survival of Covenants'
    ]
  },
  {
    id: 'partnership-deed',
    title: 'Partnership Deed',
    description: 'Binding deed outlining business operations, capital inputs, and profit splits for partnerships.',
    category: 'legal',
    popularity: 88,
    whyUseIt: 'Form a legally registered partnership firm, determine initial investment capitals, define partner drawings, and layout a roadmap for dissolution.',
    requiredInfo: [
      'Partners Full Names & Permanent Addresses',
      'Partnership Firm Name & Registered Place of Business',
      'Capital Contributions by each Partner',
      'Profit and Loss Sharing Ratios',
      'Rules on Banking, Partner Drawings, and Capital Interest'
    ],
    draftOutline: [
      '1. Creation of Partnership, Name, and Business Domain',
      '2. Capital Investment Schedules & Drawing Interest Caps',
      '3. Allocation of Net Profits & Losses among Partners',
      '4. Management Duties, Partnership Voting & Decision Matrices',
      '5. Admission of New Partners & Voluntary Retirement Terms',
      '6. Dissolution Procedures, Settlement of Accounts & Arbitration'
    ]
  },
  {
    id: 'internship-offer',
    title: 'Internship Offer Letter',
    description: 'Official letter proposing a learning internship with stipend and IP terms.',
    category: 'hr',
    popularity: 87,
    whyUseIt: 'Engage university interns with clear parameters regarding their internship duration, monthly learning stipend, and strict assignment of intellectual property.',
    requiredInfo: [
      'Candidate Name',
      'Internship Title & Department Name',
      'Stipend Amount (Monthly or Unpaid)',
      'Start Date & Duration (e.g. 3 Months, 6 Months)',
      'Mentoring Supervisor Name'
    ],
    draftOutline: [
      '1. Formal Offer of Internship & Core Department Assignment',
      '2. Duration, Weekly Working Hours, and Schedule',
      '3. Stipend, Incentives, and Tax Deductions at Source',
      '4. Company Resource Access & strict return of assets',
      '5. Intellectual Property & Code/Design Assignment Clauses',
      '6. Performance Sign-off & Completion Certificate conditions'
    ]
  },
  {
    id: 'relieving-letter',
    title: 'Relieving & Experience Certificate',
    description: 'Official dual certificate validating successful exit, clearances, and professional conduct.',
    category: 'hr',
    popularity: 86,
    whyUseIt: 'Formalize former employee exits, certify their successful return of company properties, and provide conduct references for background checks.',
    requiredInfo: [
      'Employee Name & Employee Code',
      'Last Designation Held',
      'Employment Start Date & Relieving Date',
      'Statement of Full & Final Settlement Clearance',
      'Manager or HR Lead Authorized Signatory'
    ],
    draftOutline: [
      '1. Official Company Letterhead Header',
      '2. Declaration of Relieving and Accept of Resignation',
      '3. Final Working Day & Full Settlement Clearance Statement',
      '4. Professional Conduct and Contribution Endorsement',
      '5. Standard Future Career Success Wish',
      '6. Signature of Head of HR and Corporate Seal'
    ]
  },
  {
    id: 'website-terms',
    title: 'SaaS Terms of Service & Privacy Policy',
    description: 'Regulatory terms governing web application usage, subscription liabilities, and data protection.',
    category: 'startup',
    popularity: 91,
    whyUseIt: 'Shield your web app or SaaS from liabilities, detail subscription billing/refund terms, and meet GDPR/CCPA compliance regarding user personal data.',
    requiredInfo: [
      'Company Name & website URL',
      'Registered Juridical Jurisdiction',
      'Pricing model (Free trial, Monthly subscriptions, One-off purchases)',
      'Data collection types (Emails, Cookies, IP Address, Payment cards)',
      'Contact Email for legal/complaint inquiries'
    ],
    draftOutline: [
      '1. Acceptance of Terms & User Registration Requirements',
      '2. Permitted Use, Account Security, and Prohibited Conduct',
      '3. Subscription billing, Cancellation, and Refund Covenants',
      '4. Intellectual Property Rights & Licensing of User Content',
      '5. Disclaimer of Warranties & Limitation of Corporate Liability',
      '6. Privacy Policy: Data Processing, Security Measures & Cookie tracking'
    ]
  },
  {
    id: 'advisor-agreement',
    title: 'Startup Advisory Board Agreement',
    description: 'Contract securing industry advisors with FAST-model equity grants and vesting schedules.',
    category: 'startup',
    popularity: 90,
    whyUseIt: 'Onboard senior corporate or technical advisors with standard advisory shares, monthly hours commitments, and strict IP protection.',
    requiredInfo: [
      'Company Official Registered Entity Name',
      'Advisor Full Legal Name',
      'Advisor Equity Grant Percentage (e.g. 0.25%, 0.50%)',
      'Vesting schedule (e.g. 2-Year monthly vesting, no cliff)',
      'Advisor monthly service commitment (e.g. 5 hours/month)'
    ],
    draftOutline: [
      '1. Appointment to Advisory Board & Definition of Advisory Scope',
      '2. Advisor Monthly Commitments, Board Meetings, and Time Logs',
      '3. Advisory Equity Compensation, FAST model terms, & Vesting schedules',
      '4. Confidentiality of Proprietary Strategic Roadmap details',
      '5. Full Assignment of advisor contributions to Company IP',
      '6. Term, At-will termination by either party, & Equity clawbacks'
    ]
  }
];

export const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does Kartigo Draft work?',
    answer: 'It is simple! Select any document you need, answer a few straightforward, non-legal questions asked by our intuitive system, and our document builder instantly drafts an expert-grade template. You can preview, customize the final draft, and download it instantly.'
  },
  {
    id: 'faq-2',
    question: 'What types of documents are available?',
    answer: 'We provide over 100+ documents across critical HR (offer letters, appointment cards), Legal (NDAs, rental agreements), Business (service agreements, freelancer terms), Government filings, and Personal writing templates, all drafted and vetted by senior industry professionals.'
  },
  {
    id: 'faq-3',
    question: 'Can I edit my document after creation?',
    answer: 'Absolutely! Our built-in, easy-to-use rich editor allows you to fine-tune any section, edit headings, add custom clauses, and format text to fit your exact specifications before exporting.'
  },
  {
    id: 'faq-4',
    question: 'What formats can I download my documents in?',
    answer: 'You can download your document in standard print-ready PDF format or download it as a fully editable Microsoft Word (.docx) file so you can make further edits or import it into Google Docs.'
  },
  {
    id: 'faq-5',
    question: 'Is my data secure?',
    answer: 'Security is our absolute priority. We use bank-grade AES-256 cloud encryption to store your drafts and protect all personal credentials. Your drafts are strictly private to your secure account and are never shared or sold.'
  }
];

export const testimonials: TestimonialItem[] = [
  {
    id: 't-1',
    name: 'Sarah Jenkins',
    role: 'CEO & Co-founder',
    company: 'Veloce Logistics',
    content: 'Kartigo Draft saved our startup thousands in legal fees. Drafting our contractor agreements and mutual NDAs took less than 10 minutes, and our corporate counsel verified they were absolutely flawless!',
    rating: 5
  },
  {
    id: 't-2',
    name: 'Michael Torres',
    role: 'VP of Human Resources',
    company: 'Ascent Tech Partners',
    content: 'Our HR department uses the Appointment and Offer Letters daily. Answering simple prompts is much faster than copy-pasting old templates. It has standardized our candidate onboarding process beautifully.',
    rating: 5
  },
  {
    id: 't-3',
    name: 'Ananya Sharma',
    role: 'Managing Partner',
    company: 'Capitalize Real Estate',
    content: 'The Rental Agreements and Partnership Deeds are incredible. Highly professional layout, clear terminology, and extremely easy for our tenants to comprehend and sign off on.',
    rating: 5
  }
];

export const MOCK_CONVERSATIONS: Record<string, ChatMessage[]> = {
  'NDA': [
    { id: '1', sender: 'user', text: 'I need a Non-Disclosure Agreement (NDA) for my new project.' },
    { id: '2', sender: 'assistant', text: "Excellent choice! I'll guide you step-by-step. First, what is the official name of the **Disclosing Party** (sharing the information)?" },
    { id: '3', sender: 'user', text: 'Stellar Labs Inc.' },
    { id: '4', sender: 'assistant', text: 'Got it: Stellar Labs Inc. Now, who is the **Receiving Party** (receiving the information)?' },
    { id: '5', sender: 'user', text: 'Apex Development LLC' },
    { id: '6', sender: 'assistant', text: 'Understood. Finally, what is the duration of the confidentiality obligations? (Common choices: 2 Years, 3 Years, 5 Years)' },
    { id: '7', sender: 'user', text: '3 Years' },
    { id: '8', sender: 'assistant', text: 'Generating your custom Non-Disclosure Agreement draft with **Stellar Labs Inc.** and **Apex Development LLC** for a **3 Year** period... ✅ Done! Click "Learn More" below or "Start Creating" above to open your drafted legal template!' }
  ],
  'Rent Agreement': [
    { id: '1', sender: 'user', text: 'Can you help me write a Rent Agreement?' },
    { id: '2', sender: 'assistant', text: "Of course! Let's draft a professional Rental/Lease Agreement. To start, what is the landlord's full legal name?" },
    { id: '3', sender: 'user', text: 'David K. Peterson' },
    { id: '4', sender: 'assistant', text: "Great. And what is the tenant's full legal name?" },
    { id: '5', sender: 'user', text: 'Sophia Ramirez' },
    { id: '6', sender: 'assistant', text: 'Understood. What is the monthly rent amount and the security deposit required?' },
    { id: '7', sender: 'user', text: '₹18,500 rent, ₹40,000 security deposit' },
    { id: '8', sender: 'assistant', text: 'Wonderful! Creating a comprehensive Rental Agreement containing rent structures, safety deposits, and maintenance clauses for Landlord **David K. Peterson** and Tenant **Sophia Ramirez**. Draft prepared successfully!' }
  ],
  'Appointment Letter': [
    { id: '1', sender: 'user', text: 'I need an Appointment Letter for a new software engineer.' },
    { id: '2', sender: 'assistant', text: "Perfect. Let's build a formal employment Appointment Letter. What is your company's official registered name?" },
    { id: '3', sender: 'user', text: 'InnoTech Solutions Ltd.' },
    { id: '4', sender: 'assistant', text: "InnoTech Solutions Ltd. - understood. What is the candidate's full name?" },
    { id: '5', sender: 'user', text: 'Alex Mercer' },
    { id: '6', sender: 'assistant', text: 'Got it. Finally, what is the candidate’s designation and their proposed joining date?' },
    { id: '7', sender: 'user', text: 'Senior Software Engineer, starting August 1st, 2026' },
    { id: '8', sender: 'assistant', text: 'Excellent! Generating an expert-grade Appointment Letter for **Alex Mercer** as **Senior Software Engineer** at **InnoTech Solutions Ltd.**, complete with HR standard clauses. Custom draft is ready!' }
  ]
};
