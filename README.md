# ContextIQ 🧠✨

> **Multi-Tenant SaaS Platform for Custom Grounded AI Chatbots (RAG)**

ContextIQ empowers businesses to build, customize, and deploy retrieval-augmented generation (RAG) chatbots trained on their own documents (PDFs and web URLs) in minutes — without writing code.

---

## 🚀 Key Features

- **Grounded AI Assistant**: Powered by **Google Gemini** and **Pinecone**, strictly grounded in company knowledge with inline citations to eliminate hallucinations.
- **Automated Ingestion**: Drop PDFs or provide website URLs; ContextIQ extracts, chunks, embeds, and syncs vectors automatically.
- **Multi-Tenant Workspaces**: Strict logical data isolation with per-tenant Pinecone namespaces and MongoDB collections.
- **Role-Based Access**: Granular user roles (`owner`, `admin`, `editor`, `viewer`).
- **Real-Time Telemetry & Quality Analytics**: Append-only token tracking, latency benchmarks, and accuracy metrics derived from thumbs up/down user feedback.
- **Customizable Appearance**: Live editor for assistant name, greeting message, and brand accent color with real-time widget preview.
- **1-Line Embed Widget**: Standalone `<script>` tag using Shadow DOM for seamless integration on any external website.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Poppins & Inter Typography
- **Backend API**: Node.js, Express, TypeScript, Mongoose (MongoDB), Multer, Cheerio, PDF-Parse
- **LLM & Embeddings**: Google Generative AI (Gemini 1.5 Flash + Text Embeddings)
- **Vector Database**: Pinecone (Serverless index with namespace isolation)
- **Database**: MongoDB

---

## 📦 Project Structure

```
ContextIQ/
├── server/                    # Node.js + Express API & RAG Pipeline
│   ├── src/
│   │   ├── config/            # DB connection & env loader
│   │   ├── models/            # Mongoose models (Tenant, User, Source, Chunk, Chat, Message, UsageEvent, BillingEvent, Invite)
│   │   ├── services/          # Gemini, Pinecone, Ingestion, RAG, Chunking
│   │   ├── middleware/        # JWT auth, tenant scoping, role guards
│   │   └── routes/            # auth, sources, chat, chatbot, analytics, team, billing
│   └── .env.example           # Environment template
│
├── client/                    # React 18 + Vite Admin Dashboard
│   ├── src/
│   │   ├── components/ui/     # Reusable design system components
│   │   ├── contexts/          # AuthContext & session management
│   │   ├── layouts/           # AppShell with role-based navigation
│   │   └── pages/             # Login, Signup, Onboarding, Overview, Sources, Chatbot, Test Sandbox, Embed, Analytics, Team, Billing, Settings
│   └── public/widget.js       # Pre-built embeddable widget bundle
│
└── widget/                    # Standalone Embeddable Chat Widget Source
    └── src/widget.ts          # Shadow DOM chat bubble with session memory
```

---

## 🏁 Quickstart

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection string
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com))
- Pinecone API Key ([Pinecone Console](https://www.pinecone.io))

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Fill in your GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX, and MONGODB_URI in .env
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Frontend Dashboard Setup
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 📄 License
MIT © 2026 ContextIQ
