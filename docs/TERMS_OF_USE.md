# Oryonix AI — Terms of Use & Operational Guardrails

**Effective Date:** May 17, 2026  
**License:** MIT Open Source License  

Welcome to **Oryonix AI** ("we", "our", or "the Software"). Oryonix AI is an open-source, autonomous browser copilot that perceives web structure, executes multi-tab workflows, and interacts with web pages using natural language instructions.

By installing, configuring, or utilizing the Oryonix AI browser extension and associated software components, you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, do not install or use the Software.

---

## 1. Architectural Overview & Core Principles

Oryonix AI is engineered with a strict **local-first, privacy-centric architecture**:

* **Local Inference (Ollama):** When configured to use a local LLM via Ollama, 100% of DOM perception, visual analysis, and agentic reasoning occurs locally on your hardware. Zero data is transmitted to external servers.
* **Bring Your Own Key (BYOK):** When utilizing cloud AI providers (e.g., OpenAI, Anthropic, Gemini, Groq, Mistral), your API keys are stored securely within your browser's local storage (`chrome.storage.local`) and are transmitted directly from your device to the authenticated API endpoint. Oryonix AI operates no middleman proxy servers and logs no user prompts or browsing history.

---

## 2. Operational Guardrails & User Supervision (@Guard & @Elite_debugger Assessment)

### 2.1 Probabilistic Execution & AI Limitations

Oryonix AI leverages large language models (LLMs) to interpret dynamic Document Object Model (DOM) layouts and generate browser actions (clicking, typing, scrolling, tab management). Due to the probabilistic nature of LLMs and frequent updates to third-party website DOM structures:

1. **No Guarantee of Flawless Execution:** The Software may misinterpret page landmarks, hallucinate steps, or encounter parsing anomalies.
2. **Mandatory Human Supervision:** You acknowledge that Oryonix AI is an assistive tool. You are strictly required to supervise the agent during active execution, particularly during workflows involving financial transactions, sensitive personal data submission, or account configuration changes.
3. **Emergency Halt:** You maintain immediate override control. You can terminate agent execution at any time using the stop controls within the extension side panel or by closing the active browser tab.

### 2.2 Financial & High-Stakes Workflows

Oryonix AI shall not be held liable for unintended purchases, incorrect flight bookings, unauthorized financial transfers, or accidental data deletions resulting from unsupervised autonomous workflows. Always review final confirmation screens before permitting the Software to execute irreversible transactions.

---

## 3. Privacy & Cybersecurity Standards (@cybersec_expert Assessment)

### 3.1 Data Sovereignty & Storage

* **API Credentials:** You are solely responsible for securing your third-party API keys. Oryonix AI will never request your keys outside the official extension configuration settings.
* **Session Isolation:** The Software operates strictly within your active browser sandbox under standard Chromium extension security permissions (`tabs`, `storage`, `sidePanel`, `tabGroups`). It does not bypass browser security headers or cross-origin resource sharing (CORS) protections unethically.

### 3.2 Third-Party API Costs

When using third-party LLM APIs, you are solely responsible for all token generation and bandwidth costs billed by your chosen AI provider (e.g., Groq, OpenAI). You are advised to configure usage caps and billing alerts within your provider dashboards to prevent unexpected charges resulting from complex multi-step reasoning loops.

---

## 4. Ethical Use & Platform Compliance (@Ethics_compliance Assessment)

When deploying Oryonix AI across the web, you agree to abide by the following ethical guidelines and third-party terms:

1. **Respect for Website Terms of Service (ToS):** You are solely responsible for ensuring that your automated interaction with third-party web platforms (e.g., YouTube, Google, e-commerce sites) complies with their respective terms of service and automated scraping policies.
2. **Prohibited Activities:** You agree **NOT** to use Oryonix AI to:
   * Perform Denial of Service (DDoS) attacks or intentionally overwhelm web servers with excessive automated requests.
   * Illicitly bypass CAPTCHAs, bot detection algorithms, or security paywalls where prohibited by law.
   * Harvest personally identifiable information (PII), credentials, or proprietary data without legal authorization.
   * Automate deceptive practices, spam distribution, or fraudulent interactions across social media or commercial platforms.

---

## 5. Disclaimer of Warranties

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 6. Amendments & Revisions

We reserve the right to modify these Terms of Use as the Software's capabilities evolve. Continued use of Oryonix AI following any revisions constitutes your acceptance of the updated Terms.

---
**Oryonix AI Open Source Community**  
*Empowering users with private, agentic web automation.*
