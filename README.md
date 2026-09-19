# Natra Builder

<img width="1869" height="957" alt="Natra Builder Dashboard" src="https://github.com/user-attachments/assets/55703939-3d36-4550-9c2e-7386a0efddd3" />

<p align="center">
  <strong>Transform raw ideas into structured, engineering-ready Product Requirements Documents (PRDs).</strong><br>
  A modern, local-first AI architecture engine running entirely in your browser.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Storage-IndexedDB_Local-10B981" alt="Local-First Storage" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue" alt="License" />
</p>

---

## ⚡ Highlights

| Feature | Description |
| :--- | :--- |
| **🛡️ 100% Local-First** | Zero cloud database requirement. Projects, PRDs, and settings live securely in browser IndexedDB via Dexie. |
| **🔒 Direct API Privacy** | Your Google Gemini API keys never touch intermediate servers—calls stream directly from browser to Google AI. |
| **📋 8-Step PRD Wizard** | Guided workflow covering Product Context, Personas, User Journeys, Edge Cases, and Acceptance Criteria. |
| **📝 Split Markdown Editor** | Real-time dual-pane editor with GitHub-flavored markdown rendering and debounced autosave. |
| **⚡ Command Palette** | Instant navigation and search launcher powered by keyboard shortcuts (`⌘K` / `Ctrl+K`). |
| **📦 Multi-Format Export** | One-click export to GitHub Markdown (`.md`), printable PDF, or portable `.natra.json` project backups. |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, pnpm, or bun

### Setup & Run

```bash
# Clone the repository
git clone https://github.com/<your-username>/natra-builder.git
cd natra-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the workspace.

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Storage**: [Dexie.js](https://dexie.org/) (Client-Side IndexedDB)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- **AI Integration**: [@google/genai](https://github.com/google/generative-ai-js) (Gemini 2.5 Flash / Pro)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open Command Palette & Search |
| <kbd>Esc</kbd> | Dismiss modals, popovers, or active tour |
| <kbd>→</kbd> / <kbd>←</kbd> | Step through interactive workspace tour |

---

## 🚢 Production Build & Deployment

Deployable as a zero-config static single-page application (SPA) on Vercel, Netlify, Cloudflare Pages, or GitHub Pages:

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

The compiled assets are generated cleanly in `/dist`.

---

## 📄 License

Distributed under the **Apache-2.0 License**. See [LICENSE](LICENSE) for more information.
