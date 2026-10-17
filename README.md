# Paper to Prep 📄 ➡️ 🎓

> **Transform dense academic manuscripts into structured, high-retention study environments with AI-powered summaries, Roman Urdu voice translation, interactive D3 knowledge graphs, and exam preparation.**

---

## 🌟 Overview

**Paper to Prep** is an application built for researchers, clinicians, graduate students, and high-performance learners. It takes complex, multi-column scientific manuscripts (or raw text excerpts and PDFs) and converts them into four synchronized educational resources in a single coordinated workflow:

1. **Exact 50-Word English Summary** — A concise, beginner-friendly synthesis of the problem, innovation, and empirical outcome, validated server-side to guarantee an exact 50-word count.
2. **Natural Roman Urdu Translation & TTS** — Authentic Latin-script Roman Urdu translation designed for subcontinental Urdu speakers, paired with browser-native Web Speech API audio playback.
3. **10 Difficult Words Dictionary** — Exactly ten academic and domain terms extracted directly from the paper with concise Roman Urdu meanings, contextual paper explanations, and original source quotes.
4. **5 Examination Practice Questions** — Grounded practice questions (*conceptual, methodology, findings, implications, critical thinking*) with accurate answers directly supported by the manuscript.

In addition to the 4-in-1 Study Kit, Paper to Prep generates an interactive study workbench featuring a **D3.js Force-Directed Knowledge Graph**, **3D Spaced Repetition (SRS) Flashcards**, an **Interactive Board-Exam Quiz**, and a **Floating Audio Study Bar**.

---

## 🚀 Key Features

### 1. Unified 4-in-1 Study Kit Workflow
- **Single-Click Generation:** Upload a PDF (up to 20MB) or paste research text and click **"Generate Study Kit"** to receive all four resources at once.
- **Strict Word-Count Verification:** Validated via server-side whitespace tokenization with automated bounded refinement to enforce the exact 50-word constraint.
- **Roman Urdu Voice Narration:** Integrated Web Speech API audio controller with Play, Pause, Resume, Replay, Stop, and speed adjustments (`0.75x`, `1.0x`, `1.25x`, `1.5x`), featuring automatic subcontinent phonetic voice detection.
- **Export Studio:** One-click copy for summaries, individual vocabulary items, or exam questions. Direct downloads for `.TXT` study kits, Anki-ready `.TSV` flashcard decks, and Obsidian/Notion `.MD` guides.

### 2. Interactive D3.js Knowledge Graph
- **Force-Directed Semantic Topology:** Built using `d3-force`, mapping relationships between the Core Innovation, Conceptual Mechanisms, Mathematical Formulations, Methodology Phases, Empirical Benchmarks, and Bottlenecks.
- **Interactive Node Inspector:** Click any node to isolate its 1st- and 2nd-degree subgraph, dim unrelated clusters, view verbatim manuscript quotes and formulas, and jump directly to relevant study modules.
- **Canvas Ergonomics:** Pan and zoom controls, view reset, dynamic search filter, cluster tags, and a physics pause/resume toggle.

### 3. Deep Study Workbench
- **Executive Summary & 68ch Reading Focus:** Cognitive reading container restricted to 68 characters per line for eye comfort.
- **Concept Deep Dives:** Collapsible accordions with 3px `#6259E8` quote callouts, reading times, and actionable takeaways.
- **Spaced Repetition System (SRS):** 3D perspective flip cards with interval ratings (`Again <10m`, `Hard 1d`, `Good 3d`, `Easy 7d`) and keyboard navigation (<kbd>Space</kbd> to flip, <kbd>1</kbd>–<kbd>4</kbd> to rate).
- **Practice Quiz:** Multiple-choice assessment with distractor analysis, rationale explanations, and anchor citations.
- **Formulas & Vocabulary Matrix:** Alternating-row table with `code-sm` notation tags wrapped in `#F0EEFF` micro-pills and one-click formula copying.
- **Manuscript Source Inspector:** Side-by-side unedited primary text excerpts for cross-verifying generated notes with original research.
- **Floating Audio Study Bar:** Anchored playback dock with backdrop blur, waveform scrubber, time codes, and chapter navigation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:**
  - [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
  - [Vite 8](https://vite.dev/) (Bundler & dev middleware)
  - [Tailwind CSS v4](https://tailwindcss.com/) (Atomic utility styling)
  - [D3.js (v7)](https://d3js.org/) (Interactive force-directed graph visualization)
  - [Lucide React](https://lucide.dev/) (Academic & technical iconography)
- **Backend:**
  - [Express 4](https://expressjs.com/) (Node.js API server & Vite development server integration)
  - [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai)
  - **AI Model:** `gemini-3.8-flash` (with automated fallback to `gemini-flash-latest` and `gemini-3.1-flash-lite` for high-availability)
- **Security & Performance:**
  - 100% server-side Gemini API execution (zero client-side key leakage).
  - Native in-memory PDF processing via base64 `inlineData` (magic byte `%PDF` validation; zero permanent storage of user documents).
  - In-memory sliding window rate limiter (20 requests/min per IP) to mitigate abuse.

---

## 📂 Project Structure

```text
├── index.html                  # HTML entry point with Geist & JetBrains Mono fonts
├── metadata.json               # AI Studio project metadata & server capabilities
├── package.json                # Dependencies and build scripts
├── server.ts                   # Express server with /api/generate-study-kit endpoint
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite + Tailwind v4 config
├── src/
│   ├── main.tsx                # Client entry point
│   ├── App.tsx                 # Main application workspace & state coordination
│   ├── index.css               # Tailwind imports, 3D flip card utilities, and typography
│   ├── components/
│   │   ├── Header.tsx              # Top bar with paper selector, stats, and export actions
│   │   ├── Logo.tsx                # Custom origami & knowledge constellation emblem
│   │   ├── PaperInputCard.tsx      # Dual input hero: text paste & PDF drag-and-drop
│   │   ├── StudyKitView.tsx        # 4-in-1 Study Kit output with Roman Urdu TTS player
│   │   ├── KnowledgeGraphView.tsx  # D3 force-directed semantic graph visualization
│   │   ├── ConceptAccordionsView.tsx # Deep-dive concept breakdowns with quote callouts
│   │   ├── ExecutiveSummaryView.tsx  # 68ch focus reading view & empirical findings
│   │   ├── FlashcardsView.tsx      # 3D flip cards with Spaced Repetition (SRS)
│   │   ├── QuizView.tsx            # Board-exam style multiple-choice practice quiz
│   │   ├── VocabularyMatrixView.tsx# Formula and technical terms matrix table
│   │   ├── SourceInspectorView.tsx # Primary manuscript reader
│   │   ├── AudioStudyBar.tsx       # Floating audio player with transcript sync
│   │   ├── LeftSourceRail.tsx      # Metadata sidebar, table of contents, pipeline
│   │   ├── RightRetentionRail.tsx  # Retention meter, Pomodoro timer, formula quick-sheet
│   │   ├── SynthesizeModal.tsx     # Synthesis modal with modern research presets
│   │   └── ExportModal.tsx         # Anki TSV, Markdown, and TXT export dialog
│   ├── data/
│   │   ├── benchmarkPapers.ts      # Curated papers (Transformers, AlphaFold, CRISPR, ResNet)
│   │   └── defaultStudyKits.ts     # Pre-analyzed 4-in-1 study kits for benchmarks
│   ├── types/
│   │   ├── index.ts                # Core domain types (PaperData, Concepts, Flashcards, etc.)
│   │   └── studyKit.ts             # 4-in-1 Study Kit schema interfaces
│   └── utils/
│       ├── graphBuilder.ts         # Knowledge graph generator & node linker
│       └── wordCount.ts            # Whitespace-based word counter and validator
```

---

## 📱 Mobile Responsiveness & Strict Zero-Overflow Architecture

Paper to Prep is engineered with a strict **Zero-Horizontal-Overflow** guarantee across all modern smartphones, tablets, and desktops (from narrow 320px devices like the iPhone SE up to 4K ultrawide monitors):

1. **Fluid Responsive Grid & Breakpoints:**
   - **Desktop (12-Column Grid):** Left Source Rail (3 cols), Center Workbench (6 cols), and Right Retention Rail (3 cols).
   - **Tablet (8-Column Grid):** Collapsible drawer navigation and stacked retention widgets.
   - **Mobile (1-Column Stream):** Compact drawer menu, sticky touch controls, and zero horizontal scrolling (`overflow-x: hidden !important` enforced across `html`, `body`, and `#root`).
2. **Adaptive Data Table to Card Transformation:**
   - On desktop, the *Vocabulary & Formulas Matrix* is presented as a clean 4-column data table.
   - On mobile screens (`< 768px`), it automatically transforms into readable, high-touch cards with full word-break protection, preventing awkward horizontal scrolling.
3. **Responsive D3 Knowledge Graph:**
   - Dynamic canvas height (`380px` on mobile, `480px` on tablet, `580px` on desktop) so graph manipulation does not hijack mobile vertical page scrolling.
   - Safe touch padding, compact legend strips with horizontal drag, and intuitive pan/zoom reset controls.
4. **Touch-First Audio Dock:**
   - Floating `AudioStudyBar` is constrained to `calc(100vw - 16px)` with responsive text truncation, single-tap speed cycling, and full transcript drawer support.

---

## 🐙 Pushing to GitHub

To push this project to your own GitHub account:

### 1. Create a New Repository on GitHub
1. Go to [GitHub.com/new](https://github.com/new).
2. Name your repository (e.g., `paper-to-prep`).
3. Choose **Public** or **Private**.
4. Leave **"Initialize this repository with a README"** unchecked (since the project is already initialized).
5. Click **Create repository**.

### 2. Connect Your Local Codebase and Push
In your terminal, execute the following commands inside the project root:

```bash
# 1. Stage all project files
git add .

# 2. Create your commit
git commit -m "feat: complete Paper to Prep full-stack app with mobile zero-overflow and D3 graph"

# 3. Rename current branch to main (if not already main)
git branch -M main

# 4. Add your GitHub repository as remote origin (replace with your repo URL)
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/paper-to-prep.git

# 5. Push to GitHub
git push -u origin main
```

*(If you are using SSH instead of HTTPS, use `git remote add origin git@github.com:<YOUR-GITHUB-USERNAME>/paper-to-prep.git`)*

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/paper-to-prep.git
   cd paper-to-prep
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key in `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔌 Backend API Endpoints

### 1. `POST /api/generate-study-kit`
Generates all 4 core study kit resources from pasted text or an uploaded PDF.
- **Request Body (JSON):**
  - `{ text: string }` or `{ pdfBase64: string, fileName: string }`
- **Response (JSON):**
  - `studyKit`: Exact 50-word summary, Roman Urdu summary, 10 vocabulary items, 5 exam questions.
  - `fullPaper`: Complete structured `PaperData` object with concepts, flashcards, and D3 graph links.

### 2. `POST /api/synthesize`
Transforms raw research into the complete multi-module study environment (concepts, quiz, flashcards, executive brief).

### 3. `GET /api/health`
Health check status returning `{ status: "ok", model: "gemini-3.8-flash", timestamp: "..." }`.

---

## 🔒 Security & Privacy

- **Server-Side API Key Isolation:** `GEMINI_API_KEY` is accessed strictly in Node.js runtime and never sent to browser bundles or network logs.
- **In-Memory File Processing:** Uploaded PDFs are parsed in-memory and passed to the model via secure base64 inline buffers. Files are not saved to persistent server storage.
- **Strict Input Constraints:** Validates PDF magic bytes, rejects files larger than 20MB, and sanitizes character limits on raw text submissions.

---

## 📜 License

Apache License 2.0. See LICENSE for details.

