# Kartigo Draft - Production Documentation

**Version:** 1.0.0
**Product:** Kartigo Draft
**Theme:** Vanilla (#F1FEC8) / Cosmic Text (#23212C) / Brand Primary (#FD1843)
**Architecture:** Modern Web Application (React + Vite + Express + Firebase + Gemini AI)

---

## 1. Executive Summary
Kartigo Draft is an expert-grade, AI-powered Business & Legal Document generation SaaS platform. This documentation outlines the architecture, deployment strategy, security model, and operational guidelines for a commercial, production-ready release.

---

## 2. Technical Architecture

### 2.1 Stack Components
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Animations), Lucide React (Icons), Recharts (Data Viz)
- **Backend/API:** Node.js, Express (Containerized in Cloud Run)
- **Database & Auth:** Firebase Auth, Google Cloud Firestore (NoSQL Document Store)
- **AI/LLM:** Google Gemini API (Interactions API / `google/genai`)
- **PWA:** Service Worker configured for offline resilience and asset caching.

### 2.2 Core Modules
1. **AI Assistant (`DocumentAgent.tsx`):** Conversational AI workflow for gathering document context.
2. **Dashboard (`DashboardView.tsx`):** Centralized hub for user management, documents, notifications, and settings.
3. **Admin Panel (`SuperAdminView.tsx` & modules):** Comprehensive management interface covering Analytics, Users, QA, Security, SEO, Support, and Settings.
4. **Editor (`WriterEditor.tsx`):** Rich text document viewing and editing interface.
5. **Marketing Pages:** SEO-optimized Landing, Blog, Document Directory, and Help Center.

---

## 3. Database Schema (Firestore)

### `users` / `profiles`
Stores user profile information, subscription tier, and settings.
- `id` (UID)
- `email`, `firstName`, `lastName`
- `role` (user, admin)
- `subscription` (free, pro, enterprise)
- `settings`: { language, notifications }

### `documents`
Stores generated AI documents.
- `id` (String)
- `uid` (String - Auth ID)
- `title` (String)
- `content` (String - HTML/Markdown)
- `documentType` (String)
- `status` (String - draft, completed, archived)
- `createdAt` (Timestamp), `updatedAt` (Timestamp)

### `notifications`
Stores system and alert notifications.
- `id` (String)
- `uid` (String)
- `title`, `content` (String)
- `type` (info, success, warning, error)
- `read` (Boolean)

### `audit_logs` (Admin Only)
- `id` (String)
- `action` (String)
- `actorId` (String)
- `timestamp` (Timestamp)

---

## 4. Production Deployment Guide

### 4.1 Environment Configuration (`.env`)
Ensure the following variables are securely injected into your production environment:
```env
# Server Config
NODE_ENV=production
PORT=3000

# Firebase Admin/Client Config
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

# AI configuration
GEMINI_API_KEY=xxx
```

### 4.2 Build & Deploy
1. **Install Dependencies:** `npm install`
2. **Build Application:** `npm run build`
   - Compiles Vite React assets to `dist/`
   - Bundles Express backend via esbuild to `dist/server.cjs`
3. **Start Application:** `npm start`
4. **Deployment Platform:**
   - **Google Cloud Run:** Deploy containerized build mapping port 3000.
   - **Firebase Hosting:** Optional CDN routing for static assets in `dist/`.

### 4.3 Zero-Downtime & Rollback
- Cloud Run inherently supports traffic splitting and gradual rollouts.
- **Rollback:** In Google Cloud Console, navigate to Cloud Run -> Kartigo Draft -> Revisions, and redirect 100% of traffic to the previous known-good revision.

---

## 5. Security & Privacy Audit

### 5.1 Authentication & Authorization
- **Firebase Auth:** Handles secure JWT token issuance and lifecycle.
- **Route Protection:** `AuthContext` enforces strict routing based on user state (Guest vs. Authenticated vs. Admin).

### 5.2 API Security
- Express backend proxies all Gemini API requests to prevent leaking the `GEMINI_API_KEY` to the client.
- Rate limiting should be applied at the ingress layer (e.g., Google Cloud Armor).

### 5.3 Data Privacy
- Firestore Security Rules (`firestore.rules`) must restrict read/write access to `documents` and `profiles` strictly to the `request.auth.uid`.
- Admin-level actions validate custom claims or dedicated admin collections.

### 5.4 AdSense Compliance
- Ad units (`DashboardWidget` simulating ads) are strictly placed in informational or non-intrusive areas.
- **NO ADS** on Document Editor, Checkout, or sensitive authentication pages to comply with strict AdSense layout guidelines.

---

## 6. Monitoring, Backups, and Disaster Recovery

### 6.1 Monitoring & Alerts
- **Application Logs:** Ingested via Google Cloud Logging.
- **Performance:** Monitor Google PageSpeed (target 95+ Desktop, 90+ Mobile).

### 6.2 Backups
- **Firestore Export:** Schedule daily automated exports of the Firestore database to a dedicated Google Cloud Storage bucket.
- **Retention:** Maintain 30 days of rolling backups.

### 6.3 Incident Response (Admin Alert System)
- Configure alerts for: HTTP 500 Spike, Gemini API Quota Exhaustion, Auth Failure Anomalies.

---

## 7. Launch Checklist

- [ ] **Domain & SSL:** Custom domain mapped, SSL certificates provisioned (Let's Encrypt / Google Managed).
- [ ] **SEO:** `robots.txt` and `sitemap.xml` configured. Meta tags and Open Graph data verified on landing pages.
- [ ] **PWA:** `manifest.json` updated with Vanilla theme colors. Service Worker registered successfully.
- [ ] **Firebase Rules:** Production `firestore.rules` deployed and tested.
- [ ] **API Keys:** Development keys rotated; Production keys active.
- [ ] **Performance:** Assets minified, Gzip/Brotli compression enabled via reverse proxy.
- [ ] **Analytics:** Google Analytics tracking IDs inserted.
- [ ] **Compliance:** Privacy Policy, Terms of Service, and Cookie Consent active.

---

## 8. Version History & Release Notes

### **v1.0.0 - Initial Commercial Release**
- **Feature:** Expert-Grade Conversational AI Assistant (Gemini AI).
- **Feature:** User Authentication & Profile Management.
- **Feature:** Advanced Dashboard with Real-time metrics and Document Management.
- **Feature:** Comprehensive Super Admin Panel (14+ Modules).
- **Feature:** PWA capabilities with offline fallback.
- **UI/UX:** Vanilla/Cosmic premium aesthetic with smooth Framer Motion interactions.
- **Optimization:** Complete mobile-first responsive pass and accessibility (WCAG) improvements.

---

## 9. Future Roadmap (v1.1 - v2.0)
- [ ] **Subscription Plans:** Stripe integration for Pro and Enterprise tiers.
- [ ] **Team Workspaces:** Multi-user collaboration on documents.
- [ ] **White-label Platform:** Custom branding for enterprise law firms.
- [ ] **API Marketplace:** REST APIs for B2B integrations.
- [ ] **Expert Review:** Marketplace connecting users with certified Lawyers/CAs for manual review.
- [ ] **E-Signature:** Native integration with DocuSign/HelloSign.
- [ ] **Mobile Apps:** React Native builds for iOS and Android App Stores.

---
*End of Documentation*
