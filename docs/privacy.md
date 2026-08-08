# Privacy Policy

**Last Updated:** May 2026

**Oryonix AI** ("the Software," including the core JavaScript library and browser extension) operates under a **local-first** security model. In strict adherence to the principles of **Data Minimization**, **User Sovereignty**, and **Regulatory Compliance** (such as GDPR and the EU AI Act), we do not track or aggregate your personal data.

---

### 1. Core Privacy Philosophy & Zero Telemetry
We believe your browsing data and search queries are yours alone. The Software is engineered with the following absolute privacy guarantees:
* **Zero Telemetry:** We do not track, aggregate, or sell your personal information, browsing history, or AI search queries. We have no centralized database or cloud logging system.
* **100% Data Sovereignty:** Your credentials, task configurations, execution history, and AI configurations are stored securely inside your browser's private local sandbox.
* **Direct Connections:** When cloud-based AI providers are configured, Oryonix AI connects directly to their respective endpoints (e.g., OpenAI, Gemini, Anthropic). Your keys and prompts never pass through any intermediate server managed by us.

---

### 2. Chrome Extension Permissions & Data Access Audit
To provide autonomous multi-tab browser automation, the extension requests only the minimum permissions necessary. Here is exactly what data is accessed and why:
* **`storage`:** Persists your settings, session history, configured LLM endpoints, and API credentials securely inside `chrome.storage.local`.
* **`tabs` & `tabGroups`:** Allows the agent to open new tabs, switch active tabs, group related tabs under a labeled Chrome tab group, and navigate URLs to fulfill tasks.
* **`sidePanel`:** Displays the extension panel interface where you type commands, read active execution logs, and manage history.

Voice input uses the browser's built-in Web Speech API — a standard web platform feature that requires no additional extension permission. Microphone access is granted at runtime through Chrome's standard permission prompt, and no audio data is transmitted to Oryonix AI servers.

---

### 3. Local Storage Schema & Data Control
Oryonix AI stores all task records and AI configs directly in your browser's private sandbox:
* **`local:oryonix_history`:** Stores your search queries, completed tasks, and execution logs.
* **`local:oryonix_live_session`:** Manages transient, real-time runtime state and active agent coordinates.
* **`llmConfig` & `advancedConfig`:** Stores your configured API key credentials, Ollama endpoints, and preference tokens.
* **`language`:** Persists your interface and speech recognition settings.

**Your Right to Deletion (GDPR Article 17):** Because all data is stored locally on your machine, you have absolute control over your digital footprint. You can instantly wipe all local data, configuration details, and execution logs at any time by clicking "Clear History" inside the sidepanel settings or uninstalling the extension.

---

### 4. AI Prompt Routing & Security Architecture
Oryonix AI routes data depending entirely on your configured AI provider. All three modes are fully available:

* **Local LLM / Ollama (Fully Offline Mode):** When configured to use a local Ollama instance (e.g., `http://localhost:11434`), Oryonix AI operates entirely offline inside your local network. 100% of your prompts, dynamic page snapshots, and action logic are processed locally on your machine. Nothing leaves your device.
* **Bring Your Own Key (BYOK) Cloud Routing:** When cloud APIs (OpenAI, Gemini, Anthropic, Groq, Mistral, or any OpenAI-compatible endpoint) are configured, Oryonix AI issues direct HTTPS queries to the respective official API endpoints. Your credentials are saved only in `chrome.storage.local` — we do not log, intercept, or proxy your prompts.
* **Public Testing API (Default Demo Mode):** The default configuration uses a public testing API to allow evaluation without requiring an API key. **Do not enter confidential data** when using the default testing API, as queries are processed on temporary instances located in Mainland China.

---

### 5. GDPR & Compliance Guardrails
We fully enforce legal and ethical AI guardrails, ensuring data protection by design:
* **Data Minimization:** Oryonix AI reads *only* the web structures necessary to achieve the task. It does not scan background tabs or collect general browsing behavior.
* **Mandatory Consent:** The agent remains idle until you explicitly trigger a task or direct it to read a page.
* **Emergency Halt:** You maintain physical control. You can sever connections and stop execution immediately by closing the side panel or active tab.

---

### Chrome Web Store Developer Verification Notice
This Privacy Policy page is the designated official legal policy for **Oryonix AI**. It is host-verified and published publicly for Chromium-based ecosystem developer audits, security evaluations, and Chrome Web Store listing approvals.
