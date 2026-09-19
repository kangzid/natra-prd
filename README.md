# Natra Builder

> **Turn ideas into structured product documentation.**
> An open-source, local-first AI documentation builder that helps developers, founders, and product teams turn product ideas into structured PRDs using their own AI API keys and models.

---

## Features

- **Local-First Architecture**: Zero cloud database requirement. All projects, documents, templates, and API keys are stored securely in your browser's IndexedDB via Dexie.
- **Privacy Guaranteed**: Your API keys and product concepts never pass through an intermediary server. Requests connect directly to Google's Generative Language API from your browser.
- **PRD Builder (Vertical Slice 1)**: An 8-step guided wizard based on the `01-PRD-TEMPLATE.md` standard:
  1. Product Overview (Name, summary, goals, problem statement)
  2. Target User (Personas, pain points, user desires)
  3. Features (Core MVP must-haves, priorities, out-of-scope)
  4. Product Flow (User journey, crucial actions, authentication, key screens)
  5. Technical Context (Frontend, backend, storage, API constraints)
  6. Requirements (Functional, non-functional, performance, a11y, security)
  7. Edge Cases (Validation, empty states, failure scenarios, error recovery)
  8. Release & Success (MVP milestone, Phase 2, success metrics)
- **AI Model Freedom**: Enter any model manually (e.g., `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) or connect OpenAI-compatible endpoints (Ollama, Groq, DeepSeek).
- **Split-View Markdown Editor & Preview**:
  - Live preview formatted with GitHub-flavored markdown (tables, code blocks, checklists).
  - Debounced autosave to IndexedDB with real-time status indicator (`Saved`, `Saving...`, `Unsaved changes`).
  - Mobile responsive single-tab switcher (`Editor` / `Preview`).
- **Export & Portability**:
  - Download PRD as `.md` file.
  - Export project as `.natra.json` backup file.
  - Import previously exported projects.
  - Full workspace backup import/export in Settings.
- **Extensible Builder Interface**: Designed so future documentation builders (Feature Decomposition, Domain Model, Feature Flow, UI/UX Spec) can be plugged in without refactoring.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Storage**: IndexedDB (Dexie)
- **Styling**: Tailwind CSS
- **Markdown**: `react-markdown` + `remark-gfm`
- **Icons**: `lucide-react`
- **Deployment**: Vercel ready (static client-side SPA)

---

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Open `http://localhost:3000` in your browser.

### Build for Production / Vercel

```bash
pnpm build
```
The output will be in `dist/`, ready for static deployment to Vercel, Cloudflare Pages, GitHub Pages, or Netlify.

---

## License

Apache-2.0
