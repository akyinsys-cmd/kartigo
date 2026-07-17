# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 1)

## 1. Vision, Product Strategy & Development Rules

### 1.1 Project Identity
- **Product Name:** Kartigo Draft
- **AI Assistant:** AI Assistant
- **Company:** Kartigo

### 1.2 Vision & Mission
- **Vision:** Kartigo Draft is an AI-powered business document workspace. It helps users create professional business, legal, HR, finance, startup, government, and personal documents by answering simple questions. Users never search for templates; they simply explain what they need. AI Assistant asks intelligent questions, and Kartigo Draft prepares an expert-grade document.
- **Mission:** Become the world's most trusted platform for creating professional documents.

### 1.3 Core Principle
- **Dynamic Creation:** Never use downloadable templates. Never depend on fixed document files. Every document is created dynamically based on user requirements.

### 1.4 Product Philosophy
- Simple
- Professional
- Fast
- Reliable
- Modern
- Trustworthy
- Business-focused
- Minimal
- Scalable
- Secure

### 1.5 Design Philosophy
- **NO DARK MODE:** Only Light Mode. Ever.
- **Primary Background:** Vanilla (`#F1FEC8`)
- **Cards:** White
- **Primary Accent:** `#FD1843`
- **Secondary Accent:** `#3C1A47`
- **Styling Rules:** Professional typography, rounded corners, soft shadows, large spacing, and simple English.

### 1.6 User Journey
Visitor → Homepage → Talk to AI Assistant → Select document → Answer questions → Preview → Login → Payment → Document Generated → Edit → Download → Dashboard

### 1.7 Product Modules
Kartigo Draft → Landing Website → Authentication → Document Agent (AI Assistant) → Knowledge Engine → Document Intelligence → Generation Engine → Payments → Dashboard → Admin → Analytics → Support → SEO → Marketing → API → Security

### 1.8 Target Users
Individuals, Students, Employees, HR Teams, Small Businesses, Startups, Freelancers, Consultants, Law Firms, Chartered Accountants, Real Estate, NGOs, Educational Institutions, Government Service Providers, Corporate Teams.

---

## 2. Engineering & Development Principles

### 2.1 Core Engineering Rules
Every feature must be: Modular, Reusable, Scalable, Maintainable, Secure, Fast, SEO-friendly, Mobile-first, Accessible, and Production-ready.

### 2.2 Coding Rules
- Never duplicate code.
- Never create large files.
- **Strict Separation of Concerns:**
  - Separate business logic.
  - Separate UI.
  - Separate database.
  - Separate AI layer.
  - Separate payment layer.
  - Separate analytics.
  - Separate security.

### 2.3 Naming Standards
- Use meaningful, descriptive names.
- **Good:** `createDocument()`, `DocumentGenerationService`
- **Bad:** `generate()`, `Service1`

### 2.4 Architecture Rules
- No hardcoded prices.
- No hardcoded countries.
- No hardcoded document types.
- No hardcoded questions.
- **Everything** comes from the database or admin configuration.

### 2.5 AI Rules
- Frontend never knows which AI model is used.
- Users never see provider names.
- Only **AI Assistant** is visible.
- AI providers can be swapped backend-side without changing frontend code.

### 2.6 Document Rules
- Every document is unique.
- Never reuse previous documents.
- Never expose internal prompts.
- Never expose the AI provider.
- Always validate context/inputs before generation.

### 2.7 Security Rules
- Everything encrypted.
- Everything logged.
- Everything permission-based.
- Everything validated.

### 2.8 Performance Rules
- Fast execution.
- Minimal JavaScript payload.
- Optimized images.
- Lazy loading.
- Caching.
- Code splitting.

### 2.9 SEO Rules
- Every page indexable (unless private).
- Dynamic meta tags, Schema markup, Canonical links.
- Fast loading, readable URLs.

### 2.10 Google AdSense Rules
- Ads **only** on public content pages.
- **NEVER show ads on:** Login, Checkout, Payment, Dashboard, Editor, Purchased Documents, Support Tickets, Account Settings.

---

## 3. Future Expansion & Final Rule

### 3.1 Platform Scalability
The platform architecture must support:
- Unlimited countries & languages.
- Unlimited document types.
- Unlimited AI providers.
- Unlimited payment gateways.
- Unlimited integrations & users.

### 3.2 Final Development Rule (The Immutable Law)
**Every future phase must follow this architecture.**
If a new feature conflicts with this blueprint: **The blueprint wins.**
Do not redesign the architecture. Build on top of it.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 2)
## Technology Stack, Folder Structure & Development Standards

### 1. Technology Stack
- **Frontend (Current Runtime):** React 19, TypeScript, Tailwind CSS, Shadcn UI (Conceptual), Framer Motion, React Hook Form, Zod Validation, Lucide Icons. PWA Ready. *(Note: While Next.js is requested for future phases, the current AI Studio preview runs on Vite + Express Full-Stack).*
- **Backend:** Node.js, Express API Routes, Firebase Admin SDK, REST API (GraphQL Ready for future). Background jobs & Queue Architecture via Firebase Functions (future).
- **Database:** Firebase Firestore, Firebase Storage, Firebase Authentication. Every collection must be properly indexed.
- **AI Layer:** Users interact only with **AI Assistant**. User → AI Assistant → Kartigo AI Service → Provider Manager → Primary Provider (Gemini) → Fallback Provider. Providers are strictly abstracted from the frontend.
- **Payment:** Razorpay (Architecture Ready for PayU, Cashfree, PhonePe, Stripe). Admin configurable.
- **Hosting/Deployment:** Google Cloud Run (Containers), Firebase Hosting (Assets). (Hostinger/Cloudflare ready).

### 2. Folder & Module Structure (Scalable Pattern)
Every folder must have one clear responsibility.
```text
kartigo-draft/
├── src/
│   ├── components/  # Reusable isolated UI elements (Buttons, Cards, Dialogs)
│   ├── features/    # Domain-specific modules (auth, dashboard, documents, admin)
│   ├── services/    # Business logic (AI, Payments, DB operations)
│   ├── lib/         # External integrations/wrappers (Firebase, Gemini)
│   ├── hooks/       # Custom React hooks
│   ├── types/       # TypeScript definitions
│   ├── constants/   # System-wide configuration constants
│   ├── utils/       # Pure helper functions (Dates, Currency, Formatting)
│   ├── styles/      # Global CSS and Tailwind configs
│   ├── api/         # Express backend routes
│   └── validation/  # Zod schemas for all data models
```

### 3. Application Layers & Separation of Concerns
- **Features:** Must be completely isolated. (e.g., `authentication`, `dashboard`, `documents`, `payments`).
- **Components:** Must be completely generic and reusable. Never duplicate UI.
- **Services:** Must contain all business logic. No business logic belongs inside UI components. (e.g., `DocumentGenerationService`, `AuthService`).
- **Utils:** Pure functions only (Currency, Date, Validation, Formatting).
- **Configuration:** Environment variables, payment gateways, API keys. **Never hardcoded.**

### 4. API & Data Standard
- **API Structure:** Distinct routes for `/api/auth`, `/api/documents`, `/api/payments`, `/api/analytics`, etc.
- **Response Standard:** Every API must return: `Success (boolean)`, `Data`, `Message`, `Errors`, `Timestamp`, `Request ID`, `Status Code`.
- **Error Handling:** Every error must include: Readable Message, Technical Log, Unique Error ID, Recovery Suggestion.
- **Validation:** Client Validation → Server Validation → Database Validation. Never trust client input.

### 5. Logging & Telemetry
Separate domains for logs: Application, AI, Payments, Authentication, Admin, Search, Performance, Errors, Security, Audit.

### 6. Database Standards (Firestore)
- **Proposed Collections:** `users`, `profiles`, `documents`, `document_versions`, `orders`, `payments`, `pricing`, `categories`, `countries`, `states`, `languages`, `knowledge`, `questions`, `clauses`, `conversations`, `messages`, `notifications`, `tickets`, `analytics`, `blogs`, `seo`, `reports`, `settings`, `audit_logs`, `system_logs`, `future_integrations`.
- **Firestore Rules:** Principle of least privilege. Owner access only. Admin override via Custom Claims. Encrypted sensitive fields.

### 7. Naming Conventions
- **Collections:** Plural, camelCase (e.g., `documentVersions`) or snake_case (e.g., `document_versions`).
- **Functions:** camelCase (e.g., `createDocument`).
- **Components:** PascalCase (e.g., `DashboardView`).
- **Files:** kebab-case (or matching component names).
- **Constants:** UPPER_SNAKE_CASE.

### 8. Git & Development Standards
- **Branches:** `main` (production), `develop`, `feature/`, `bugfix/`, `hotfix/`, `release/`. Never commit directly to production.
- **Commits:** Semantic versioning (`feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `perf:`, `chore:`).
- **Code Standards:** TypeScript everywhere. No `any`. Strict typing. ESLint. Prettier. No console logs in production.

### 9. Performance & Security Rules
- **Performance:** Lazy Loading, Dynamic Imports, Image Optimization, Caching, Code Splitting.
- **Security:** CSRF protection, XSS sanitation, Rate Limiting, CSP headers, Encrypted Secrets.

### 10. Testing & Documentation
- **Testing:** Unit, Integration, UI, API, Performance, Accessibility, Security, Regression.
- **Documentation:** Every service, API, component, and database collection must be documented.

### 11. Final Rule Reminder
Never hardcode business values. Keep UI separate from business logic. Keep AI strictly behind the AI Assistant service layer. Follow these structural constraints without exceptions.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 3)
## Database Architecture, Firestore Schema, AI Workflow & Permission Model

### 1. Database Principles
- Normalize where appropriate, denormalize only for performance.
- Every document has a unique ID and timestamps (`createdAt`, `updatedAt`).
- Every record has a status. Every update is logged.
- Soft delete by default.
- Admin configurable wherever possible.

### 2. Root Collections
- `users`, `profiles`, `documents`, `documentVersions`, `documentCategories`, `documentTags`, `documentQuestions`, `documentClauses`, `knowledgeRules`, `conversations`, `messages`, `orders`, `payments`, `pricing`, `coupons`, `countries`, `states`, `languages`, `industries`, `notifications`, `supportTickets`, `blogs`, `seoPages`, `analytics`, `reports`, `settings`, `admins`, `roles`, `permissions`, `auditLogs`, `systemLogs`, `apiKeys`, `integrations`.

### 3. Collection Schemas (Key Fields)
- **USERS:** `userId`, `email`, `phone`, `name`, `loginProvider`, `status`, `createdAt`, `updatedAt`, `lastLogin`, `emailVerified`, `profileCompleted`, `roleReference`.
- **PROFILE:** `avatar`, `address`, `country`, `state`, `city`, `postalCode`, `company`, `occupation`, `preferredLanguage`, `timeZone`, `notificationSettings`.
- **DOCUMENTS:** `documentId`, `userId`, `category`, `documentType`, `conversationId`, `currentVersion`, `status`, `purchaseStatus`, `createdAt`, `updatedAt`, `lastDownload`, `lastEdited`.
- **DOCUMENT VERSION:** `versionNumber`, `editor`, `changes`, `createdAt`, `restoreAvailable`, `comparisonAvailable`.
- **DOCUMENT QUESTIONS:** `questionId`, `question`, `answerType`, `required`, `order`, `country`, `state`, `industry`, `visibilityRule`, `conditionRule`, `validationRule`.
- **DOCUMENT CLAUSES:** `clauseName`, `category`, `country`, `state`, `industry`, `priority`, `required`, `version`, `status`.
- **KNOWLEDGE RULES:** `requiredQuestions`, `requiredClauses`, `optionalClauses`, `validationRules`, `formattingRules`, `riskRules`, `countryRules`, `languageRules`, `industryRules`.
- **CONVERSATIONS:** `conversationId`, `user`, `agent`, `documentType`, `status`, `started`, `completed`, `messagesCount`, `currentStep`.
- **MESSAGES:** `conversation`, `role`, `content`, `time`, `metadata`, `readStatus`.
- **ORDERS:** `orderNumber`, `user`, `document`, `amount`, `currency`, `coupon`, `gst`, `status`, `paymentId`, `invoice`, `createdAt`.
- **PAYMENTS:** `paymentGateway`, `gatewayReference`, `order`, `amount`, `status`, `method`, `refundStatus`, `timestamp`.
- **PRICING:** `document`, `country`, `currency`, `price`, `discount`, `offer`, `tax`, `status`.
- **COUPONS:** `code`, `discount`, `percentage`, `fixedAmount`, `usage`, `expiry`, `status`.
- **COUNTRIES:** `country`, `isoCode`, `currency`, `timeZone`, `languages`, `status`.
- **STATES:** `countryReference`, `stateName`, `code`, `status`.
- **LANGUAGES:** `language`, `locale`, `direction`, `status`.
- **INDUSTRIES:** `industryName`, `status`, `description`.
- **NOTIFICATIONS:** `recipient`, `title`, `message`, `type`, `priority`, `read`, `createdAt`.
- **SUPPORT:** `ticket`, `user`, `category`, `priority`, `status`, `assigned`, `conversation`.
- **BLOGS:** `title`, `slug`, `category`, `author`, `seo`, `published`, `status`.
- **SEO:** `page`, `title`, `description`, `keywords`, `canonical`, `schema`, `status`.
- **ANALYTICS:** `daily`, `weekly`, `monthly`, `revenue`, `traffic`, `documents`, `searches`, `downloads`, `conversions`.
- **REPORTS:** `revenue`, `payments`, `documents`, `users`, `support`, `ai`, `seo`.
- **SETTINGS:** `general`, `brand`, `payment`, `ai`, `seo`, `ads`, `email`, `security`, `performance`, `storage`.
- **ADMINS:** `adminProfile`, `role`, `permissions`, `activity`, `status`.
- **ROLES:** Super Admin, Admin, Finance, Support, Marketing, Content, Custom.
- **PERMISSIONS:** View, Create, Update, Delete, Approve, Export, Import.
- **AUDIT LOGS:** `user`, `action`, `entity`, `oldValue`, `newValue`, `time`, `ip`.
- **SYSTEM LOGS:** `application`, `security`, `payment`, `ai`, `api`, `errors`, `performance`.
- **API KEYS:** `owner`, `permissions`, `status`, `usage`, `expiry`, `rotation`.
- **INTEGRATIONS:** `provider`, `configuration`, `status`, `health`.

### 4. Database Relationships
```
User
 │
 ├── Profile
 ├── Conversations
 │    └── Messages
 ├── Documents
 │    ├── Versions
 │    ├── Questions
 │    ├── Clauses
 │    └── Downloads
 ├── Orders
 ├── Payments
 ├── Notifications
 └── Support Tickets

Country
 │
 └── States
```

### 5. AI Workflow
User → AI Assistant → Conversation Engine → Question Engine → Knowledge Engine → Requirement Analyzer → Validation Engine → Document Intelligence → AI Service Layer → Quality Review → Professional Draft → Editor → Payment → Download.

### 6. Admin Configuration
Configurable without code: Prices, Countries, States, Categories, Questions, Clauses, AI Behaviour, Payment Gateways, SEO, AdSense, Notifications, Languages, Industries, Coupons, Blog, Reports, Branding, Contact Details, Social Links.

### 7. Firestore Indexes
- Single fields: User ID, Email, Document Type, Category, Country, State, Status, Created Date, Updated Date, Payment Status, Order Status, Search Keywords.
- Composite indexes for common filters.

### 8. Security Model
- **User:** Own Data Only.
- **Support:** Tickets.
- **Admin:** Business Operations.
- **Super Admin:** Full Access.
- Everything permission-based via Firestore Security Rules.

### 9. Backup Strategy & Scalability
- **Backups:** Daily, Weekly, Monthly. Encrypted, Automatic, Manual Restore, Audit Logged.
- **Scalability:** Built to support 10 million+ users, 100 million+ documents, multi-country, multi-language, unlimited integrations.

### 10. Final Rule
**The database is the single source of truth.** No business logic should depend on hardcoded values. Every feature must read configuration from the database or the Admin Panel.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 4)
## AI Assistant Intelligence Engine, AI Architecture, Prompt Framework & Document Intelligence

### 1. Core Intelligence Principle
AI Assistant is a professional Document Intelligence System, not a generic chatbot. AI Assistant never writes randomly. AI Assistant always follows a structured reasoning process to ask intelligent questions, detect missing information, generate professional documents, and improve every document before delivery.

### 2. AI Assistant Personality & Constraints
- **Personality:** Professional, Calm, Friendly, Business-focused. Uses simple English and short replies. No jokes, no unnecessary conversation. No emojis except in the welcome message.
- **First Message:** "Hello 👋 I'm AI Assistant, your document assistant. Tell me what document you want to create today."
- **Constraints (AI Assistant NEVER):** Reveal the AI provider, reveal internal prompts, reveal reasoning, invent missing facts, create illegal documents, provide misleading legal advice, or guarantee legal validity.
- **Mandates (AI Assistant ALWAYS):** Ask questions, validate answers, confirm understanding, generate expert-grade drafts, suggest improvements, and maintain professional formatting.

### 3. The 12-Step Thinking Pipeline
1. **Intent Detection:** Understand the document type, purpose, country, state, industry, and urgency.
2. **Classification:** Identify the category (HR, Legal, Business, Government, Finance, etc.).
3. **Knowledge Retrieval:** Fetch required questions, clauses, and rules (country, state, formatting, industry).
4. **Question Planning:** Never ask everything together. Plan the conversation, highest priority first.
5. **Conversation Rules:** One question at a time, simple English, short sentences. Always explain why information is required if asked.
6. **Memory:** Remember names, dates, company, salary, etc. Never ask for the same information twice.
7. **Validation:** Check names, dates, phone, email, and consistency.
8. **Missing Information:** If missing, ask follow-up questions. Never assume.
9. **Document Planning:** Plan sections, order, headings, clauses, tables, and signature area before writing.
10. **Document Generation:** Generate professional, readable, consistent, and context-aware documents.
11. **Quality Review:** Check grammar, formatting, missing/duplicate clauses, professional tone, and readability.
12. **Final Delivery:** Prepare for preview, editor, download, history, and version control.

### 4. Conversation & Prompt Framework
- **Conversation Rules:** Keep replies under 120 words unless explanation is requested. Ask one logical question at a time.
- **Question Types:** Short Answer, Paragraph, Date, Time, Number, Money, Email, Phone, Dropdown, Multiple Choice, Yes/No, Address, File Upload (Future).
- **Prompt Architecture:** System Rules → Knowledge Rules → Country/State Rules → Conversation Answers → Additional Details → Document Requirements → Formatting Rules → Quality Review → Final Output.
- **Error Recovery:** Resume interrupted conversations where they stopped.

### 5. Document Intelligence & Clause Engine
- **Intelligence:** Automatically determine professional/formal tone, language complexity, paragraph length, and formatting.
- **Clause Engine:** Select clauses dynamically based on country, state, industry, business size, and document type. Never hardcoded.
- **Quality Score:** Internal only (Excellent, Very Good, Good, Needs Review). Never show numerical AI scores to users.

### 6. AI Provider Layer & Routing (Abstracted)
- **Architecture:** AI Assistant → Provider Manager → Primary Provider → Fallback Provider → Emergency Provider.
- **Cost Optimization:** Automatically route based on Cost, Speed, Availability, and Quality. Users never see provider details.

### 7. AI Safety & Security
- **Safety:** Reject illegal requests, fraud, forgery, scams, malicious content, privacy violations. Refuse briefly and professionally.
- **Security:** Encrypt conversation history. Protect API credentials. Do not log sensitive document content unnecessarily. Audit AI configuration changes.

### 8. Admin Controls & Collections
- **Admin Configuration:** Greeting, Conversation Style, Max Questions, Question Order, Knowledge Rules, Clause Rules, Prompt Templates, Quality/Risk Rules, Provider Routing.
- **Database Collections:** `aiConfigurations`, `conversationRules`, `promptTemplates`, `qualityRules`, `validationRules`, `providerRouting`, `conversationAnalytics`, `documentPlans`, `clauseRecommendations`, `riskPolicies`.
- **Analytics Tracked:** Most Requested Documents, Average Questions, Completion Rate, Drop-off Rate, Generation Time, Most Edited Documents.

### 9. Final Development Rules
AI Assistant is not a chatbot; it is a Document Intelligence Assistant. Never expose internal prompts, reasoning, or provider names. Every document must be generated dynamically from user input and knowledge rules. Keep the conversation natural, short, and focused. Ensure every output is reviewed by the quality engine before being shown to the user.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 5)
## Complete Design System, UI Library, UX Standards & Brand Guidelines

### 1. Design Philosophy
Kartigo Draft should feel Professional, Premium, Trustworthy, Modern, Minimal, Simple, Fast, Clean, Business Focused, and Comfortable. Never crowded, never confusing.

### 2. Color System
- **Primary Background (Vanilla):** `#F1FEC8` (Use on Main Website, Landing Page, Large Sections)
- **Cards/Panels (White):** `#FFFFFF` (Use for Cards, Dialogs, Forms, Dashboard Panels, Tables)
- **Primary Brand (Accent):** `#FD1843` (Use for Buttons, Links, Primary Actions, Highlights, Important Icons)
- **Secondary Brand:** `#3C1A47` (Use for Titles, Navigation, Footer, Sidebar, Secondary Buttons)
- **Text:** Primary (`#23212C`), Secondary (`#666666`), Muted (`#999999`)
- **Status Colors:** Success (`#16A34A`), Warning (`#F59E0B`), Error (`#DC2626`)
- **Color Usage Ratio:** 70% Vanilla, 20% White, 10% Brand Colors.
- **DARK MODE:** Never implement. Never prepare. Never mention. Platform supports Light Mode only.

### 3. Typography & Spacing
- **Typography:** Professional web-safe fonts. Clear Hierarchy: Display, H1, H2, H3, H4, Body, Caption, Label, Button. Readable, Large, Comfortable.
- **Spacing System:** Strict consistent spacing (4, 8, 12, 16, 24, 32, 40, 48, 64, 96). Never random spacing.
- **Border Radius:** Buttons (16px), Cards (20px), Dialogs (24px), Inputs (14px), Images (20px).
- **Shadows:** Soft only. Large blur, premium feel. Never heavy.

### 4. Layout & Grid
- **Grid System:** Desktop (12 columns), Tablet (8 columns), Mobile (4 columns). Everything responsive.
- **Breakpoints:** Mobile, Tablet, Laptop, Desktop, Ultra Wide, Foldable.

### 5. UI Components
- **Buttons:** Primary, Secondary, Outline, Ghost, Danger, Success, Loading, Disabled, Icon Button, Floating Button.
- **Inputs:** Text, Email, Password, Phone, Search, Textarea, Dropdown, Date, Time, Currency, Checkbox, Radio, Switch, Upload, Future Voice.
- **Forms:** Simple. One column on mobile, max two on desktop. Large touch targets, helpful validation.
- **Cards:** Document, Category, Dashboard, Analytics, Blog, Order, Support, Notification. Reusable.
- **Tables:** Responsive, Sticky Header, Search, Sort, Filter, Pagination, Export, Mobile Card View.
- **Modals:** Centered, Responsive, Large, Small, Confirmation, Alert, Fullscreen Mobile.
- **Structure:** Sidebar (Collapsible, Persistent Desktop, Drawer Mobile). Header (Sticky, Small Shadow, Search, Notifications, Profile). Footer (Minimal, Professional).

### 6. Visual Assets & Feedback
- **Icons & Illustrations:** One consistent outlined icon library (Lucide). Simple, business, professional illustrations. No cartoons.
- **Empty States:** Every module includes Illustration, Message, CTA (e.g., No Documents, No Orders).
- **Loading & Toast:** Skeleton, Progress Bar, Spinner, Pulse, Button Loading, Chat Typing. Toasts (Top Right Desktop, Bottom Mobile).
- **Chat Design:** Message Bubble, Typing Indicator, Timestamp, Auto Scroll, Unread Divider, Quick Suggestions, Attachment Ready.

### 7. Animation & Interaction
- **Animations:** Fade, Slide, Scale, Ripple, Hover, Page Transition. Use only subtle motion.
- **Micro Interactions:** Button Press, Card Hover, Search, Save, Download, Upload, Notification, Sidebar, Tab, Switch.
- **Mobile Experience:** Thumb Friendly, Large Buttons, Bottom Navigation, Responsive Drawer, Fast Keyboard Handling, Swipe Support, Pull To Refresh.

### 8. Accessibility & Performance
- **Accessibility:** WCAG 2.2 AA. Keyboard Navigation, Focus States, Screen Readers, ARIA Labels, Reduced Motion, High Contrast Support, Large Touch Targets.
- **Performance:** No layout shift, optimized animations, minimal DOM, fast rendering, responsive images.

### 9. Component Library & Tokens
- **Central Token System:** Colors, Spacing, Radius, Typography, Shadow, Animation, Border, Opacity, Z-index. Never hardcode styles.
- **Reusable Library:** Buttons, Cards, Inputs, Tables, Forms, Dialogs, Avatar, Badge, Tooltip, Accordion, Tabs, Breadcrumb, Pagination, Dropdown, Toast, Charts, Sidebar, Navbar, Footer, Search.

### 10. Branding & PWA Settings
- **Branding:** Logo, Favicon, App Icon, Loading Screen, Theme Color, Email Branding, PDF/Word Branding. Consistent everywhere.
- **PWA:** Splash Screen, Install Prompt, App Icon, Offline Page, Update Banner.
- **Admin Settings:** Admin can update Logo, Favicon, Brand Colors, Contact Info, Social Links, Email Branding, Footer Content, Banners, Announcements (without changing code).

### 11. Final Design Rules & Quality Checklist
- Every page must feel like part of one product.
- Every component must be reusable.
- Follow the Vanilla-first color palette.
- Keep the interface clean, premium, and business-focused. Use simple English.
- Design for mobile first, then tablet and desktop.
- **Checklist:** No inconsistent spacing, no different button/icon styles, no broken layouts, no text overflow, no inaccessible components, **no dark mode**, consistent visual hierarchy.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 6)
## Backend Architecture, Service Layer, API Contracts, Event System & Infrastructure

### 1. Backend Principles
- Never put business logic inside UI.
- Never expose the database directly.
- Never expose AI providers.
- Never trust frontend validation.
- Everything passes through backend services.

### 2. High-Level Architecture
Client (Web / PWA) → API Gateway → Authentication Layer → Business Services → AI Service Layer → Database Layer → Storage Layer → External Providers → Monitoring.

### 3. Core Services
Independent services with a single responsibility: Authentication, User, Profile, Document, Conversation, Question, Knowledge, Clause, AI, Payment, Pricing, Notification, Support, Search, Analytics, SEO, Admin, Settings, Report, Storage, Security, Audit.

### 4. Service Communication
Never allow services to directly manipulate each other's data. Use service interfaces (e.g., Document Service calls Knowledge Service, gets response, continues).

### 5. API Gateway & Middleware
- **Gateway Pipeline:** Authentication → Authorization → Validation → Rate Limiting → Logging → Error Handler → Service Routing.
- **Middleware:** Security Headers, Request ID, Language/Country Detection, Maintenance Mode, Audit Logging.

### 6. REST API Standard
Every endpoint must return a consistent JSON format:
```json
{
  "success": true,
  "message": "",
  "data": {},
  "errors": [],
  "requestId": "",
  "timestamp": ""
}
```
Support versioning (`/api/v1`, `/api/v2`). Use standard HTTP methods.

### 7. Event System & Queue Architecture
- **Events:** Internal pub/sub for decoupling logic. (e.g., `User Registered` → Send Email, Create Analytics, Notify Admin).
- **Queue System:** Email, Notification, Document, Analytics, Backup, Export, Search Index, Webhook, Cleanup, Retry.
- **Dead Letter Queue:** Failed jobs are retried safely, then moved to a DLQ with failure reason and timestamp.

### 8. Cache & Storage Layers
- **Cache Layer:** Settings, Countries, States, Languages, Categories, Pricing, Knowledge Rules. *Never cache sensitive user data.*
- **Storage Layer:** Separate folders for Documents, Images, Invoices, Profiles. Use UUID + Timestamp for secure file naming.

### 9. Rate Limiting & Permission Engine
- **Rate Limit:** Distinct limits for Guests, Users, Admins, API Keys. Configurable.
- **Permission Engine:** Strict checks on every request. Users access own data. Support accesses tickets. Admins access configured modules. Super Admins access everything.

### 10. AI Service Layer
Strictly internal. `Document Service` → `AI Assistant Service` → `Provider Manager` → `Configured Provider` → `Quality Engine` → Return Document. Frontend never accesses AI directly.

### 11. Error Handling & Logging
- **Error Standard:** Error Code, Readable Message, Technical Log, Recovery Hint, Timestamp, Request ID.
- **Logging Domains:** Application, Auth, AI, Payments, Search, Security, Performance, Admin, DB, API.

### 12. Background Jobs & Monitoring
- **Daily Jobs:** Cleanup, Reports, Analytics, Backups, Search Index.
- **Health Checks:** Monitored endpoints for App, DB, Storage, Queue, Email, Payments, AI, Search.
- **Performance Targets:** API Response <300ms (excluding AI). Use caching and lazy processing.

### 13. Final Backend Rules
Backend must be completely independent from the frontend. Every feature communicates through services. Use event-driven architecture for background work. Never expose internal implementation details. Make every configuration editable from the Admin Panel.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 7)
## Authentication, Authorization, Enterprise Security, Privacy & Compliance

### 1. Security Principles
- Never trust the client.
- Never expose secrets.
- Never expose internal APIs.
- Everything must be encrypted, logged, and permission-based.
- Every action must be auditable.

### 2. Authentication & Identity
- **Methods:** Google Login, Email & Password, Phone OTP. Support for Email Verification, Account Recovery, Session Restore. (Future: Passkeys, SSO, Microsoft, Apple).
- **Registration:** Collect minimal info (First Name, Last Name, Email, Password, Country, State, Accept Terms, Optional Phone).
- **Password Policy:** Minimum length, Uppercase, Lowercase, Number, Special Character. Prevent common reuse.
- **Session & Device Management:** Secure Sessions, Remember Me, Logout All Devices, Session Timeout. Users can view and manage Active Devices (Browser, OS, Location, Last Active).

### 3. Role-Based Access Control (RBAC) & Permissions
- **Roles:** Guest, Registered User, Support, Content Manager, Marketing, Finance, Admin, Super Admin, Custom Roles.
- **Permissions:** Granular and independent (View, Create, Update, Delete, Approve, Publish, Export, Import, Manage [Settings, Users, Payments, AI, SEO, Ads, Reports, Security]). No hardcoded permissions.
- **Authorization Flow:** Authentication → Role Check → Permission Check → Resource Ownership → Action Allowed.
- **Zero Trust:** Every request is validated, even internal requests. Never bypass authorization.

### 4. Data Privacy, Consent & Compliance
- **User Rights:** Download data, delete account, export documents, manage privacy/communication preferences.
- **Account Deletion:** Identity Confirmation → Grace Period → Delete Personal Data → Keep financial/legal records → Complete.
- **Consent Management:** Store Privacy Policy, Terms, Cookie, Marketing Consent versions with Timestamp and IP Hash.
- **Compliance Architecture:** Prepare for privacy compliance, cookie management, audit trails, and policy version tracking. No legal claims, but full configurable records.

### 5. Encryption & API Security
- **Encryption:** Encrypt User Data, Documents, Messages, API Keys, Tokens, Secrets, Backups.
- **API Security:** HTTPS Only, JWT, Secure Cookies, CSRF Protection, Rate Limiting (different limits for Guests, Users, Admins, APIs), Input Validation, Output Sanitization.
- **Security Headers:** CSP, HSTS, Frame Protection, Referrer Policy, Permissions Policy, X-Content-Type Protection, XSS Protection.

### 6. File Security & Fraud Detection
- **File Security:** Allowed Types, Maximum Size, Unique File Names, Secure Storage, Temp Upload Cleanup.
- **Fraud Detection:** Detect rapid requests, repeated failed payments, credential attacks, bot activity, multiple accounts. Alert administrators.

### 7. Audit System & Security Monitoring
- **Audit Logs:** Immutable storage. Logs Login, Password Changes, Document Generation/Download, Payments, Refunds, Admin Actions, Permission/Config Changes.
- **Audit Record Schema:** User, Role, Action, Target, Time, Request ID, Device, Status, Old Value, New Value.
- **Security Alerts:** Notify Admin for failed logins, payment fraud, system attacks, suspicious APIs, mass downloads.
- **Security Dashboard:** Admin views Failed Logins, Blocked Requests, Suspicious Activity, Storage Status, Active Users, Security Score.

### 8. Firestore Security & Database
- **Firestore Rules:** Least privilege. Owner-only access. Admin by permission. Validate writes. Protect internal collections.
- **New Collections:** `securityPolicies`, `securityEvents`, `userSessions`, `trustedDevices`, `consents`, `privacyRequests`, `blockedIPs`, `fraudDetection`, `securityAlerts`, `permissionChanges`, `auditEvents`.

### 9. Final Security Rules
Security is mandatory across every module. Every action must be authenticated, authorized, and audited. Keep security configurable through the Admin Panel where appropriate. Maintain compatibility with all previous architecture decisions.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 8)
## Enterprise Admin Architecture, Business Rules Engine & Dynamic Configuration System

### 1. Core Principle & Admin Hierarchy
- **Core Principle:** Every configurable value must come from the Admin Panel. Never edit source code for business operations.
- **Hierarchy:** Super Admin → Admin → Finance Manager → Marketing Manager → Content Manager → Support Manager → Support Executive → Custom Roles.
- **Role Management:** Admins can Create, Edit, Delete, Duplicate, Enable, Disable, Assign, and Preview permissions.

### 2. Permission Engine
- **Granular Permissions:** Every permission is independent.
  - *Users:* Create, View, Edit, Delete, Suspend, Export
  - *Documents:* View, Publish, Archive, Delete, Generate, Approve, Reject
  - *Payments:* View, Refund, Export, Approve, Reject
  - *AI:* View, Edit, Enable, Disable, Change Rules, Provider Routing, Prompt Rules
  - *Other modules:* Analytics, SEO, Ads

### 3. Super Admin Dashboard & System Health
- **Dashboard:** Displays Today's Revenue/Users/Orders/Documents, AI Requests, Server/API/Queue Status, Storage, Security Alerts, Support Tickets, Live Visitors.
- **System Health:** Real-time monitoring for Application, Database, Storage, Queues, Email, Payments, AI Layer, Search, and API.

### 4. Configuration Engine & Brand Settings
- **100% Dynamic:** General, Brand, Payments, Pricing, Countries, States, Languages, Document Categories, Questions, Clauses, Knowledge Rules, SEO, AdSense, Analytics, Email, Notifications, Security, Support, API, Storage, Performance, Maintenance.
- **Brand Settings:** Update Logo, Favicon, Brand/Product/Assistant Name, Primary/Secondary Colors, Contact Info, Social Links, Footer, Copyright—without touching code.

### 5. Builders (Document, Question, Clause)
- **Document Management:** Create Categories, Subcategories, Document Types, Descriptions, SEO, Estimated Time, Difficulty, Pricing, Featured Status.
- **Question Builder:** Visual Builder (Question → Answer Type → Validation → Required → Condition → Country → State → Industry → Save). No coding required.
- **Clause Builder:** Manage Clause Name, Description, Required/Optional status, Priority, Country, Industry, Language, Version.

### 6. Knowledge Engine & AI Manager
- **Knowledge Engine:** Manage Knowledge, Formatting, Validation, Country, State, Industry, Quality, and Risk Rules.
- **AI Manager:** Control Assistant Greeting, Conversation Style, Max Questions, Follow-up Behaviour, Validation/Quality Rules, Provider Routing, Retry/Fallback logic. *Never expose providers to users.*

### 7. Business Rule Engine & Automation
- **Visual Rule Builder:** E.g., `IF Document = Appointment Letter AND Country = India THEN Ask Probation Question AND Include Salary Clause`. No code.
- **Automation Rules:** Trigger → Condition → Action. (e.g., `Payment Success → Generate Invoice → Send Email → Unlock Document`).

### 8. Pricing, Promotion & Payment Control
- **Pricing Engine:** Manage Price, Discount, Country/Category Pricing, Festival/Offer/Launch/Bulk Pricing.
- **Promotion Engine:** Coupons, Referrals, Discounts, Campaigns, Limited Time Offers, Expiry, Usage Limits.
- **Payment Control:** Enable/Disable Gateways, Gateway Priority, Transaction Reports, Refund Rules, Tax Settings.

### 9. SEO, Ads, Content & Notifications
- **SEO Manager:** Homepage, Blogs, Categories, Documents (Meta, Schema, Open Graph, Canonical, Sitemap, Robots, Redirects).
- **Ads Manager:** Google AdSense configuration (Publisher ID, Auto/Manual Ads, Banner Locations, Frequency, Country/Device Rules). *Never show ads in restricted areas.*
- **Content Management:** Blogs, FAQs, Help Center, Policies (Privacy, Terms, Refund, Cookie), About, Contact, Careers.
- **Notification Manager:** Email, Push, Announcements, In-App, Scheduled, Target Audience, Templates.

### 10. Support, Analytics, & System Settings
- **Support Manager:** Tickets, Assignments, Priorities, Knowledge Base, Escalations.
- **Analytics Dashboard:** Revenue, Orders, Users, Traffic, Documents, AI Usage, Search, Payments, Support, Exports, Custom Reports.
- **System Settings:** Timezone, Currency, Language, Storage, Security, Email, API, Logging, Cache, Performance.
- **Maintenance Mode:** Enable/Disable, Custom Message, Countdown, Admin Bypass, Allowed IPs.

### 11. Audit Center & Backup Manager
- **Audit Center:** Track Admin Logins, Configuration Changes, Permission/Pricing/AI/SEO Changes, Refunds, Security Events. Everything searchable.
- **Backup Manager:** Manual/Automatic Backups, Restore, History, Retention, Verification.

### 12. White-Label & Multi-Tenant Preparation
- **White-Label Ready:** Architecture supports future changes to Logo, Brand Name, Colors, Domain, Emails, Invoices, PDF Branding—without changing code.
- **Multi-Tenant Ready:** Future architecture prepared for separate organizations, admins, branding, documents (not enabled now).

### 13. Database Collections & Final Rules
- **New Collections:** `adminSettings`, `businessRules`, `automationRules`, `branding`, `systemConfiguration`, `maintenance`, `pricingRules`, `questionBuilder`, `clauseBuilder`, `knowledgeConfiguration`, `promotionRules`, `adsConfiguration`, `seoConfiguration`, `contentConfiguration`, `auditHistory`, `whiteLabel`.
- **Final Rules:** The Admin Panel must be the control center for the entire platform. Avoid hardcoding business rules or configuration. Every change should be logged and reversible where practical. Keep all modules modular and permission-based. Maintain compatibility with all previous architecture decisions.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 9)
## Default Location Engine & Business Settings

### 1. Default Location Engine (Core Setting)
Because many documents depend on jurisdiction, Location is a core platform setting.

#### User Onboarding & Guest Experience
When a new user or guest opens Kartigo Draft, they are prompted to:
**Select Your Location**
- Country (Required)
- State (Required)
- District (Optional)
- City (Optional)
- **Buttons:** `Continue` | `Detect My Location` (only with explicit user permission).

#### Save as Default & Dashboard Integration
- Users can check a box to `☑️ Use this as my default location`.
- This is stored in the User Profile. Every future document uses this location automatically.
- **Dashboard UI:** Displays "Default Location: [Country] → [State] → [District] → [City]" with an `[Edit]` button.

### 2. Location Hierarchy & Future Expansion
The architecture supports deep geographical hierarchy (especially useful for government documents, property agreements, and local compliance):
`Country → State → District → Taluk / County (Optional) → City → PIN Code (Optional)`

### 3. AI Behaviour (AI Assistant Integration)
AI Assistant automatically detects and suggests the saved location to reduce questions.
**Example Interaction:**
- **User:** "I need a rental agreement."
- **AI Assistant:** "I found your default location: India → Karnataka → Bengaluru. Would you like to use this location?"
- **Options:** `✅ Yes` | `✏️ Change Location`

### 4. Default Business Settings (Profile & Admin)
To significantly reduce the number of questions for repeat customers, users can save their standard business details in their profile. 

**Stored Business Details:**
- Company Name
- Business Address
- GST Number
- PAN
- CIN (if applicable)
- Authorized Signatory
- Default Location
- Company Logo

**AI Behaviour for Business Details:**
Whenever a business document is created, AI Assistant automatically asks: *"Should I use your saved business details?"*

### 5. Admin Panel Configuration (Super Admin)
The Super Admin can configure these features dynamically:
- **Location Settings:** Enable/Disable location selection, Set Required fields (Country/State/District/City), Supported countries/states, Default country (e.g., India), Auto-detect location (On/Off), Use browser location (On/Off).
- **Business Settings:** Manage fields available for users to store as Default Business Settings.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 10)
## Default Currency System & Internationalization Strategy

### 1. Default Currency System (Launch Phase)
- **Currency:** Indian Rupee
- **Code:** INR
- **Symbol:** ₹
- **Format:** `₹149` (never "INR 149" unless specifically required by a payment gateway or formal legal compliance).

This currency format must be strictly and universally applied across the entire platform during the initial launch, including:
- Home page and Pricing page
- Document drafting and checkout flows
- User Dashboard and Order History
- Admin Panel, Invoices, Reports, and Analytics

### 2. Future Architecture (Multi-Currency Support)
The platform backend architecture should be designed to support multiple currencies for future international expansion. However, all non-INR currencies remain strictly disabled at launch.

**Supported Currencies (Future-Ready Status):**
- 🇮🇳 India (INR, ₹) - ✅ Enabled
- 🇦🇪 UAE (AED) - ❌ Disabled
- 🇺🇸 USA (USD) - ❌ Disabled
- 🇬🇧 UK (GBP) - ❌ Disabled
- 🇨🇦 Canada (CAD) - ❌ Disabled
- 🇦🇺 Australia (AUD) - ❌ Disabled

**No Foreign Currency Displays:**
Do not display "USD", "GBP", "AED", or foreign currency symbols anywhere in the live user-facing product until those countries are officially launched.

### 3. Admin Panel Control
The Super Admin dashboard will include a **Currency Manager** to allow for dynamic control without code changes in the future:
- **Default Currency Setting:** Fixed to `₹ INR` at launch.
- **Toggle Features:** Enable/Disable other regional currencies.
- **Future Capabilities:** Exchange rate management and dynamic currency format settings.

### 4. Pricing Display Standards
All pricing tiers and promotional materials must strictly use the standard localized format:
- `₹0`
- `₹29`
- `₹79`
- `₹149`
- `₹299`
- `₹499`
- `₹999`

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 11)
## Kartigo Draft V1.0 – Final Product Rules

### Product Scope
- **Launch in India only.**
- Future international support remains in the architecture but is completely hidden until enabled.

### User Experience
- The platform should be so simple that anyone can use it.
- **Flow:**
  1. Open website
  2. Talk to AI Assistant
  3. Answer questions
  4. Preview
  5. Pay
  6. Download
- Nothing else.

### India Only
- No country selector.
- No currency selector.
- No international options.
- Default currency: `₹ INR`.
- Default location: State → District (optional) → City (optional).

### Pricing
- Every document is paid.
- No free generation.
- No free download.
- No "Free Trial" document.

### User Panel
Only include:
- Dashboard
- Create Document
- Browse Documents
- My Documents
- Drafts
- Orders
- Downloads
- Notifications
- Profile
- Help & Support
- Settings
- Logout
- *Nothing technical.*

### User Settings
Only:
- Name
- Mobile Number
- Email
- State
- District
- City
- Business Details
- Password
- Notifications
- Delete Account

### Admin Panel
Everything technical belongs here:
- AI configuration, Provider management, Prompt rules, API settings, Firebase, Payment gateway settings, SEO, AdSense, Analytics, Performance, Security, Logs, Queue, Cache, Database, Backups, Automation, Business rules, Pricing, Knowledge engine, Reports.
- *Never expose these to users.*

### AI Assistant
- Users only know AI Assistant.
- **Never show:** AI provider names, Model names, API names, Technical architecture, Prompt engineering, LLM terminology.

### Language
- Simple English.
- Professional.
- Business-focused.
- No technical words unless the user is an admin.

### UI
- Light mode only.
- Vanilla (`#F1FEC8`) background.
- White cards.
- Primary color: `#FD1843`.
- Secondary color: `#3C1A47`.
- Rounded corners.
- Soft shadows.
- Mobile-first.
- No clutter.

### Business Details
Users can save once:
- Company Name
- Business Address
- GSTIN (optional)
- PAN (optional)
- Authorized Signatory
- Logo (optional)

AI Assistant asks:
> "Would you like to use your saved business details?"
*(This reduces repeated questions.)*

### Master Rule
> If a feature does not directly help a customer create, buy, edit, or download a document, it should not appear in the customer interface. All technical, administrative, AI, analytics, infrastructure, security, SEO, advertising, automation, and system configuration must remain exclusively within the Admin Panel.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 12)
## Kartigo Draft V1.0 Final Flow

### Homepage Structure
Only 6 sections:
1. Hero
2. Search ("What document do you need?")
3. Popular Documents
4. Categories
5. How It Works
6. FAQ + Footer

### Step 1: Intent
User types their need (e.g., "I need a Rent Agreement", "I need an NDA").

### Step 2: AI Assistant Questionnaire
- AI Assistant asks questions one by one (e.g. State? City? Names?).
- Last question: "Is there anything else you want to include?" (Large text box).

### Step 3: Preview & Watermark
- Professional document viewer.
- Watermark: `KARTIGO DRAFT – PREVIEW`
- Buttons: **Continue Editing**, **Unlock Document**.
- No download, no print, no share capabilities at this stage.

### Step 4: Payment
- Example: "Rent Agreement - Price ₹299 - ★★★★★ Expert Grade - [Pay Now]"

### Step 5: Post-Payment
- Buttons become active: Download PDF, Download Word, Share, Print, Save.

### Dashboard (Simplified)
- Dashboard, My Documents (Drafts, Purchased, Downloads, Orders), Profile, Support.
- Nothing technical.

### AI Assistant Communication Rules
- AI Assistant **never** says: AI Generated, ChatGPT, Gemini, LLM, Prompt.
- Instead: "Expert-grade document prepared by AI Assistant based on the information you provided."

### Draft Rules
- If payment is not completed, save draft automatically.
- User can return anytime and continue from where they stopped.
- Preview remains available, watermark stays, download remains locked.

### Admin Boundary
- Everything technical stays in Admin. Pricing, Questions, Clauses, AI behavior, Payments, SEO, Analytics, AdSense, Reports, Security, Knowledge engine, Business rules.

### Homepage Improvement: Quick Chips
- Below the main search box, add "Quick Chips" (e.g. 🏢 Appointment Letter, 🏠 Rent Agreement, 🤝 Service Agreement).
- Clicking a chip starts the AI Assistant conversation immediately.

---

# PHASE 0 – MASTER SOFTWARE ARCHITECTURE (PART 13)
## Kartigo Draft V1.0 (Locked Scope)

### Core Scope
- **Homepage:** Hero section, Search box, Quick document chips, Popular documents, Categories, How it works, Pricing information, FAQ, Footer.
- **AI Assistant:** One conversation only, one question at a time, intelligent follow-up questions, "Additional Details" section, generate expert-grade preview.
- **Preview:** Professional document viewer, watermark, auto-save as Draft, edit anytime.
- **Payment:** Razorpay, unlock document, export (PDF, Word DOCX), share, print.
- **Dashboard:** My Documents, Drafts, Purchased Documents, Downloads, Orders, Profile, Support.
- **Admin:** 100% control over business operations. No technical settings visible to users.

### Future Roadmap
- **Version 1.1:** Hindi, Kannada, Marathi, Document bundles, Discount coupons, Referral program, Blog, More document categories.
- **Version 2.0:** Subscription plans, Team workspace, E-signatures, OCR document import, Mobile app, API access, International rollout.

### Homepage Enhancement: Resume Drafts
- Display "Continue Your Draft" on the homepage if the user has an unfinished draft.
- Lets users resume work with a single click, improving conversion and completion rates.

## Final Product Rules

### 1. Single Source of Truth
* Every document, question, clause, price, category, banner, SEO field, and cross-sell item must come from the database or admin panel.
* Nothing business-related should be hardcoded.

---

### 2. Unified Document Engine
Quick Form and AI Assistant must use the **same document engine**.

```
Category
   ↓
Subcategory
   ↓
Document Definition
   ↓
Question Engine
   ↓
Validation Engine
   ↓
Summary
   ↓
Preview
```
This ensures both methods always generate identical outputs.

---

### 3. Smart Resume
If a logged-in user leaves midway:
* Save progress automatically.
* Resume from the last unanswered question.
* Never restart from the beginning.

---

### 4. Business Profile Autofill
For returning users:
* Company Name
* Address
* GSTIN
* PAN
* Authorized Signatory
* Contact Details
Offer autofill with user confirmation.

---

### 5. Duplicate Prevention
If a user purchased the same document recently:
> "You already created this document on 12 Jul 2026. Would you like to reuse it, edit it, or create a new one?"

---

### 6. Progress Indicator
Always show progress.
Example:
```
Step 1
Choose Document

✔ Step 2
Provide Details

✔ Step 3
Review

Current
Preview

Locked
Payment

Locked
Download
```
Users should always know where they are.

---

### 7. Autosave
For logged-in users:
* Save every few seconds or after meaningful changes.
* Restore automatically after refresh or network interruption.

---

### 8. Smart Validation
Before preview:
* Missing required fields
* Invalid dates
* Invalid email
* Invalid phone
* Invalid PIN code
* Invalid GST/PAN formats (where applicable)
Show clear messages and highlight the exact field.

---

### 9. Intelligent Cross-Selling
Do not recommend random documents.
Recommendations must be based on the purchased document and shown:
* After purchase confirmation
* In the user dashboard
* In purchase history
* In follow-up emails

---

### 10. Trust Signals
Display throughout the site:
* Secure Payment
* SSL Secured
* Privacy Protected
* Instant Download After Payment
* Professional Drafts
* Trusted by Businesses (only if factually true)

Avoid unverified claims.

---

### 11. Admin Safety
High-risk actions such as deleting documents, changing pricing, or publishing document updates should require confirmation and be recorded in the audit log.

---

### 12. Error Recovery
If payment succeeds but document generation fails:
* Queue regeneration automatically.
* Notify the user.
* Allow retry from the dashboard.
* Never ask for payment again.

---

### 13. Search Intelligence
Support:
* Typo tolerance
* Synonyms
* Partial matches
* Recently searched items
* Popular searches

---

### 14. AI Assistant Rules
The AI Assistant should:
* Never ask unnecessary questions.
* Ask one logical question at a time.
* Adapt to the user's language (English or Hinglish).
* Stay within Kartigo Draft's scope.
* Explain document concepts briefly when needed.
* Never provide legal advice or guarantee legal validity.

---

### 15. Production Quality Standards
No page should be considered complete unless it passes all of these:
* Functional testing
* Responsive testing
* Accessibility checks
* Performance optimization
* Security review
* SEO validation (for public pages)
* Cross-browser testing
* Mobile usability testing

## Final Architecture

```text
Homepage
    ↓
Search / Category
    ↓
Subcategory
    ↓
Choose:
• Quick Form
• AI Assistant
    ↓
Dynamic Question Engine
    ↓
Validation
    ↓
Review Summary
    ↓
Watermarked Preview
    ↓
Login
    ↓
Payment
    ↓
Invoice
    ↓
Download / Print / Share
    ↓
Dashboard
    ↓
Relevant Cross-Sell
```
