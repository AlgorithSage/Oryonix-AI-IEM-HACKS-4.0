<p align="center">
  <img src="public/logo.svg" alt="Oryonix AI Logo" width="80" />
</p>

<p align="center">
  <img src="public/heading.svg" alt="Oryonix AI" width="320" />
</p>

<p align="center">
  <strong>Your Autonomous Browser Copilot — Open Source & Privacy-First</strong>
</p>

<p align="center">
  <a href="https://github.com/Subhankar-Patra1/Oryonix-ai/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-orange.svg" alt="MIT License" /></a>
  <a href="https://github.com/Subhankar-Patra1/Oryonix-ai/stargazers"><img src="https://img.shields.io/github/stars/Subhankar-Patra1/Oryonix-ai?style=social" alt="GitHub Stars" /></a>
  <a href="https://github.com/Subhankar-Patra1/Oryonix-ai/issues"><img src="https://img.shields.io/github/issues/Subhankar-Patra1/Oryonix-ai" alt="GitHub Issues" /></a>
  <img src="https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript" />
</p>

<p align="center">
  <a href="https://oryonix-ai.vercel.app">🌐 Website</a> •
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#%EF%B8%8F-architecture">🏗️ Architecture</a> •
  <a href="#-contributing">🤝 Contributing</a>
</p>

---

## 🧠 What is Oryonix AI?

**Oryonix AI** is an open-source, autonomous browser agent that lives inside your Chrome side panel. Tell it what you want in plain English — it navigates websites, fills forms, extracts data, manages multiple tabs, and completes complex web workflows **entirely on its own**.

Unlike cloud-based automation tools, Oryonix AI runs **100% client-side**. Your browsing data never leaves your machine. You bring your own LLM (Ollama, OpenAI, Anthropic, Google Gemini, Groq, Mistral, or any OpenAI-compatible API), and the agent works directly in your browser.

### 🎯 Example Tasks

```
"Find the cheapest roundtrip flights to Tokyo for October and compile results into a Google Sheet"
"Go to GitHub, star all repos from this user, and summarize their top projects"
"Fill out this job application form using my resume details"
"Compare pricing across 3 e-commerce sites and create a summary table"
"Navigate to docs, find the Quick-Start section, and summarize it in markdown"
```

---

## ✨ Features

### 🔀 Multi-Tab Control
Navigate, open, close, and switch between multiple browser tabs simultaneously. The agent groups managed tabs under a color-coded Chrome tab group labeled `OryonixAI(task)` for easy identification.

### 💬 Natural Language Interface
No coding, no CSS selectors, no XPath. Just describe your task in plain English. The agent parses your intent, understands page context, and self-corrects if the layout changes.

### 🔌 Any LLM, Your Choice (BYOK)
Bring your own model — run **Ollama locally** for complete privacy, or connect to cloud providers:

| Provider | Status | Notes |
|----------|--------|-------|
| **Ollama** (local) | ✅ Fully Supported | Zero-cost, 100% private, no internet needed |
| **OpenAI** | ✅ Fully Supported | GPT-4o, GPT-4o-mini, etc. |
| **Anthropic** | ✅ Fully Supported | Claude 4, Claude Sonnet, etc. |
| **Google Gemini** | ✅ Fully Supported | Native Gemini API integration |
| **Groq** | ✅ Fully Supported | Ultra-fast inference |
| **Mistral** | ✅ Fully Supported | Mistral Large, Medium, etc. |
| **Any OpenAI-compatible** | ✅ Supported | Custom base URL + API key |

### 📋 Custom Projects & System Instructions
Create project-specific configurations with tailored system prompts. Set "Marketing Mode" or "Code Review Mode" once, and every AI interaction follows your project's direction — no repetitive instructions needed.

### 👁️ Visual DOM Perception
The agent perceives web page structures through an advanced DOM parsing system. It reads interactive elements with indexed identifiers, understands page hierarchy through indentation, and detects newly appeared elements since the last step.

### 📊 Rich Output Formatting
Results are delivered with beautiful formatting — Markdown tables, interactive charts (bar, line, area, pie), headings, and structured data. The side panel renders charts directly using Recharts.

### 🛡️ Privacy-First Architecture
- **No cloud dependency** — Everything runs in your browser
- **No data collection** — Zero telemetry, no analytics
- **Local storage only** — API keys stored in `chrome.storage.local`
- **Open source** — Fully auditable codebase under MIT License

---

## 🏗️ Architecture

Oryonix AI is built as a **Chrome Extension** using the [WXT framework](https://wxt.dev) (a modern, type-safe alternative to raw Manifest V3 development) with React for the side panel UI.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Browser                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Side Panel  │  │  Background  │  │ Content Script│  │
│  │  (React UI)  │  │  Service     │  │ (Per Tab)     │  │
│  │              │  │  Worker      │  │               │  │
│  │  useAgent()  │◄─┤              ├─►│ DOM Parsing   │  │
│  │  Chat UI     │  │  Tab Control │  │ Click/Type    │  │
│  │  History     │  │  Routing     │  │ Scroll/Read   │  │
│  │  Settings    │  │  Port Events │  │ JS Execution  |  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │
│         │                 │                             │
│         └─────────┬───────┘                             │
│                   ▼                                     │
│          ┌────────────────┐                             │
│          │  Agent Core    │                             │
│          │  (page-agent)  │                             │
│          │                │                             │
│          │  MultiPageAgent│                             │
│          │  TabsController│                             │
│          │  System Prompt │                             │
│          └───────┬────────┘                             │
│                  │                                      │
│                  ▼                                      │
│          ┌────────────────┐                             │
│          │    LLM API     │                             │
│          │  (Your Choice) │                             │
│          └────────────────┘                             │
└─────────────────────────────────────────────────────────┘
```

### Core Components

| Component | Path | Description |
|-----------|------|-------------|
| **Background Service Worker** | `entrypoints/background.ts` | Chrome service worker handling tab control messages and page control routing |
| **Content Script** | `entrypoints/content.ts` | Injected into every page — initializes the `RemotePageController` for DOM interaction |
| **Side Panel UI** | `entrypoints/sidepanel/` | React-based chat interface with settings, history, and real-time agent status |
| **MultiPageAgent** | `agent/MultiPageAgent.ts` | Core agent orchestrator — extends `PageAgentCore` with multi-tab capabilities |
| **TabsController** | `agent/TabsController.ts` | Manages tab lifecycle — open, close, switch, group creation, load-wait |
| **RemotePageController** | `agent/RemotePageController.ts` | Bridge between agent and content script for DOM operations |
| **System Prompt** | `agent/system_prompt.md` | Comprehensive agent behavior instructions (260 lines of carefully crafted rules) |
| **Tab Tools** | `agent/tabTools.ts` | Custom tool definitions: `open_new_tab`, `switch_to_tab`, `close_tab`, `js_scroll` |
| **useAgent Hook** | `agent/useAgent.ts` | React hook managing agent lifecycle, config, and state in the side panel |

### How the Agent Loop Works

1. **User sends a task** → Side Panel dispatches to `MultiPageAgent.execute(task)`
2. **Agent reads browser state** → Content script parses the DOM into indexed interactive elements
3. **LLM reasons** → The system prompt + browser state + history are sent to the LLM
4. **LLM returns an action** → e.g., `click(index: 42)`, `input_text(index: 15, text: "...")`, `open_new_tab(url: "...")`
5. **Agent executes the action** → Content script performs the browser interaction
6. **Loop repeats** → Steps 2-5 repeat until the task is done or `max_steps` is reached
7. **Agent calls `done`** → Returns a formatted summary to the user

### Key Design Decisions

- **Heartbeat Mechanism**: The agent sets a heartbeat via `chrome.storage.local` every second to detect if the side panel was closed during execution, preventing orphaned background tasks.
- **Tab Event Ports**: The background service worker broadcasts tab lifecycle events (created, updated, removed) to the side panel via persistent `chrome.runtime.Port` connections, enabling real-time multi-tab awareness.
- **Tab Grouping**: All agent-managed tabs are automatically organized into a color-coded Chrome tab group labeled `OryonixAI(task)`, keeping the user's other tabs untouched.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** (included with Node.js)
- A **Chromium-based browser** (Chrome, Edge, Brave, Arc, Opera, Vivaldi)
- *(Optional)* [Ollama](https://ollama.ai) installed for local LLM support

### Option 1: Run from Source (Recommended for Developers)

```bash
# 1. Clone the repository
git clone https://github.com/Subhankar-Patra1/Oryonix-ai.git
cd Oryonix-ai

# 2. Install dependencies
npm install

# 3. Start development mode (builds and watches for changes)
npm run dev
```

This compiles the extension to `.output/chrome-mv3/`. Now load it in your browser:

1. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`)
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `.output/chrome-mv3/` folder inside the project
5. Click the **Oryonix AI** icon in your toolbar → the side panel opens

### Option 2: Build for Production

```bash
# Build optimized extension
npm run build

# Or create a distributable .zip
npm run zip
```

The production build goes to `.output/chrome-mv3/`.

### Option 3: Direct Download (For Non-Developers)

If you're not a developer, you can download the pre-built extension directly:

1. Visit our [Early Access Welcome Page](https://oryonix-ai.vercel.app/early-access/welcome.html)
2. Download the `.zip` extension bundle
3. Extract it to a permanent folder (e.g., `Documents/Oryonix AI`)
4. Open `chrome://extensions` → Enable **Developer Mode** → Click **Load unpacked** → Select the extracted folder

### Firefox Support

```bash
# Development
npm run dev:firefox

# Production build
npm run build:firefox

# Create .zip for Firefox
npm run zip:firefox
```

---

## ⚙️ Configuration

### Setting Up an LLM

After installing the extension, open the side panel and configure your LLM provider in **Settings**:

#### Local (Ollama) — Free & Private

```bash
# Install Ollama (https://ollama.ai)
# Pull a model
ollama pull llama3.1:8b

# Ollama runs on localhost:11434 by default
```

In extension settings:
| Field | Value |
|-------|-------|
| Base URL | `http://localhost:11434` |
| Model | `llama3.1:8b` |
| API Key | *(leave empty)* |

#### Cloud Providers

| Provider | Base URL | Model Example |
|----------|----------|---------------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| Anthropic | `https://api.anthropic.com/v1` | `claude-sonnet-4-20250514` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta` | `gemini-2.5-flash` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Mistral | `https://api.mistral.ai/v1` | `mistral-large-latest` |

### Advanced Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Max Steps | Maximum number of agent loop iterations | 50 |
| System Instruction | Custom system prompt prepended to the agent's instructions | *(empty)* |
| Include All Tabs | Experimental: agent can see and interact with all open tabs | `false` |

### Environment Variables (Optional)

For development, you can set default LLM config via `.env`:

```env
VITE_LLM_MODEL_NAME=your-model-name
VITE_LLM_BASE_URL=https://your-api-endpoint.com
VITE_LLM_API_KEY=your-api-key
```

---

## 🔧 Project Structure

```
Oryonix-ai/
├── agent/                          # Core AI agent logic
│   ├── MultiPageAgent.ts           # Main agent orchestrator
│   ├── TabsController.ts           # Tab lifecycle management
│   ├── TabsController.background.ts# Background-side tab operations
│   ├── RemotePageController.ts     # Agent-side page controller
│   ├── RemotePageController.content.ts # Content script page controller
│   ├── RemotePageController.background.ts # Background routing
│   ├── tabTools.ts                 # Custom tool definitions for the agent
│   ├── useAgent.ts                 # React hook for side panel integration
│   ├── constants.ts                # LLM configuration & endpoints
│   ├── system_prompt.md            # Agent behavior instructions
│   ├── sanitizingFetch.ts          # Fetch wrapper for local models (Ollama)
│   └── geminiFetch.ts              # Fetch wrapper for Google Gemini API
│
├── entrypoints/                    # Chrome extension entry points
│   ├── background.ts              # Service worker (message routing)
│   ├── content.ts                 # Content script (DOM interaction)
│   ├── content-overlay.css        # Visual overlay styles for agent actions
│   └── sidepanel/                 # Side panel React UI
│       ├── App.tsx                # Main side panel application
│       ├── App.css                # Side panel styles
│       ├── main.tsx               # React entry point
│       ├── index.html             # Side panel HTML shell
│       └── components/            # UI components
│           ├── HistoryPanel.tsx    # Agent execution history viewer
│           ├── ChartBlock.tsx     # Interactive chart renderer (Recharts)
│           └── AgentStatusGlow.tsx # Status indicator animation
│
├── landing/                        # Marketing website (Vite + React)
│   ├── src/App.tsx                # Landing page
│   └── public/                    # Static assets (terms, privacy, early access)
│
├── public/                         # Extension static assets
│   ├── logo.svg                   # Oryonix AI logo
│   └── icon/                      # Extension icons (16, 32, 48, 128px)
│
├── docs/                           # Legal documents
│   ├── privacy.md                 # Privacy policy
│   └── term.md                    # Terms of use
│
├── wxt.config.ts                   # WXT framework configuration
├── package.json                    # Dependencies & scripts
└── tsconfig.json                   # TypeScript configuration
```

---

## 🆚 How Oryonix AI is Different

| Feature | Oryonix AI | Selenium/Playwright | Cloud AI Agents | Other Browser Extensions |
|---------|-----------|-------------------|----------------|------------------------|
| **Runs in browser** | ✅ Native extension | ❌ External process | ❌ Server-side | ✅ |
| **Natural language** | ✅ Full NLP | ❌ Code-only | ✅ | Partial |
| **Multi-tab support** | ✅ Native | Manual | Limited | Rare |
| **Privacy (no cloud)** | ✅ BYOK + local models | ✅ | ❌ Data sent to cloud | Varies |
| **Any LLM provider** | ✅ Ollama, OpenAI, Gemini, etc. | N/A | ❌ Vendor locked | ❌ Usually fixed |
| **Tab grouping** | ✅ Auto-grouped | N/A | N/A | ❌ |
| **Visual DOM parsing** | ✅ Indexed elements | ✅ Selectors | ✅ | Partial |
| **Zero config** | ✅ Works with free testing API | ❌ Setup needed | ❌ Account needed | Varies |
| **Open source** | ✅ MIT License | ✅ | Rarely | Varies |
| **Custom system prompts** | ✅ Per-project instructions | N/A | Limited | ❌ |
| **Charts in results** | ✅ Bar, line, area, pie | ❌ | ❌ | ❌ |
| **Cost** | Free (local) or BYOK | Free | $$ Subscription | Free / Paid |

### Why Not Just Use Selenium/Playwright?

Selenium and Playwright are **developer automation frameworks** — you write code (Python/JS) to script every step. Oryonix AI is an **autonomous agent** — you describe the goal in English, and it figures out the steps itself. It self-corrects on failures, handles dynamic page changes, and adapts to different layouts without code changes.

### Why Not Cloud AI Agents?

Cloud-based agents (like some commercial browser automation SaaS products) send your browsing data to remote servers. Oryonix AI runs **entirely in your browser** with your own LLM keys. Your data never leaves your machine when using local models like Ollama.

---

## 🧪 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (Chrome) |
| `npm run dev:firefox` | Start development server for Firefox |
| `npm run build` | Production build for Chrome |
| `npm run build:firefox` | Production build for Firefox |
| `npm run zip` | Create distributable .zip for Chrome |
| `npm run zip:firefox` | Create distributable .zip for Firefox |
| `npm run compile` | TypeScript type-checking (no emit) |

---

## 🛡️ Permissions Explained

The extension requests these Chrome permissions:

| Permission | Why It's Needed |
|-----------|----------------|
| `tabs` | Open, close, switch, query, and group browser tabs |
| `storage` | Save LLM config, agent state, history, and preferences locally |
| `sidePanel` | Display the agent UI in Chrome's side panel |
| `tabGroups` | Organize agent-managed tabs into color-coded labeled groups |
| `<all_urls>` | Content script must run on any website the user navigates to |

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/Oryonix-ai.git`
3. **Create a branch**: `git checkout -b feature/your-feature`
4. **Install dependencies**: `npm install`
5. **Start dev mode**: `npm run dev`
6. **Make your changes** and test in the browser
7. **Type-check**: `npm run compile`
8. **Commit**: `git commit -m "feat: your feature description"`
9. **Push**: `git push origin feature/your-feature`
10. **Open a Pull Request** against `main`

### Contribution Areas

- 🐛 **Bug fixes** — Check [open issues](https://github.com/Subhankar-Patra1/Oryonix-ai/issues)
- ✨ **New features** — LLM provider integrations, new agent tools, UI improvements
- 📝 **Documentation** — Improve guides, add examples, translate
- 🧪 **Testing** — Help test across different websites and LLM providers
- 🎨 **UI/UX** — Side panel design improvements, accessibility

---

## ❓ FAQ

<details>
<summary><strong>Is Oryonix AI really free?</strong></summary>

Yes. The extension is 100% free and open source under the MIT License. If you use local models (Ollama), there's zero cost. Cloud LLM APIs (OpenAI, etc.) are pay-as-you-go based on your own API keys.
</details>

<details>
<summary><strong>Does Oryonix AI collect my data?</strong></summary>

No. The extension has zero telemetry, no analytics, and no data collection. All processing happens locally in your browser. API keys are stored in `chrome.storage.local` (never transmitted to us).
</details>

<details>
<summary><strong>Which models work best?</strong></summary>

For best results, use capable models with strong tool-use abilities:
- **Cloud**: GPT-4o, Claude Sonnet 4, Gemini 2.5 Flash
- **Local (Ollama)**: `llama3.1:8b-instruct`, `qwen2.5:7b-instruct`, `mistral:7b-instruct`

Smaller models (< 3B parameters) may struggle with complex multi-step tasks.
</details>

<details>
<summary><strong>Can it handle CAPTCHAs?</strong></summary>

No. The agent is designed to stop and ask for human intervention when it encounters a CAPTCHA. This is an intentional ethical guardrail.
</details>

<details>
<summary><strong>Does it work on Firefox?</strong></summary>

Experimental Firefox support is available via `npm run dev:firefox`. The side panel API differs between browsers, so some features may not work identically.
</details>

<details>
<summary><strong>Can I use it for web scraping?</strong></summary>

While the agent can extract data from websites, please respect each website's Terms of Service and robots.txt. Do not use the agent for mass scraping, DDoS, or any activity that violates platform policies.
</details>

---

## 📜 Legal

- **License**: [MIT License](LICENSE) — free for personal and commercial use
- **Terms of Use**: [terms.html](https://oryonix.vercel.app/terms.html)
- **Privacy Policy**: [privacy.html](https://oryonix.vercel.app/privacy.html)

---

## ⭐ Star History

If you find Oryonix AI useful, please consider giving it a star! It helps others discover the project.

<p align="center">
  <a href="https://github.com/Subhankar-Patra1/Oryonix-ai/stargazers">
    <img src="https://img.shields.io/github/stars/Subhankar-Patra1/Oryonix-ai?style=for-the-badge&logo=github&color=f97316" alt="Star on GitHub" />
  </a>
</p>

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Subhankar-Patra1">Subhankar Patra</a> and the open-source community.
  <br />
  <sub>Oryonix AI — Tell it what to do. Watch it work.</sub>
</p>
