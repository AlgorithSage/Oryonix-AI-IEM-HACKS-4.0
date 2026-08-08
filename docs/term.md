# Terms of Use

**Last Updated:** May 2026

## Important Scope & Project Definition
"We", "us", or "our" refers to the maintainers of the open-source **Oryonix AI** project. "The Software" refers to Oryonix AI (the core JavaScript library and browser extension). 

This document covers the software itself and the testing API we provide — *not* any third-party product or service built with it.

---

### 1. Scope, Definitions & Open Source Foundation
Oryonix AI is an open-source, autonomous browser copilot that perceives web structures, executes multi-tab workflows, and interacts with web pages using natural language. The project is open source under the MIT License and can be audited publicly on GitHub.

---

### 2. Core Operational Principles & BYOK Support

The Software operates strictly as a client-side tool. All browser perception, DOM analysis, and agentic workflows are executed locally in your browser. You can configure your preferred LLM provider — local (Ollama) or cloud (OpenAI, Anthropic, Gemini, Groq, Mistral, or any OpenAI-compatible endpoint) — directly from the side panel.

* When configuring cloud LLM providers, your API credentials are stored securely in your browser's local storage (`chrome.storage.local`).
* You are solely responsible for all bandwidth, token usage, and billing costs generated through your configured keys.

---

### 3. Testing API and Demo Disclaimer & Terms of Use
To facilitate rapid technical evaluation and testing, we provide a free testing LLM API. By utilizing this API (configured by default in our demo and CDN bundles), you agree to the following terms:
* **Permitted R&D Use Only:** This API is provided strictly for technical evaluation and research purposes. You must not deploy it in any production environment, integrate it into commercial services, or use it for automated web scraping at scale.
* **Sensitive Data Prohibition:** You are strictly prohibited from submitting Personal Identifiable Information (PII), confidential business data, financial records, medical records, or running the agent on web pages containing such sensitive info.
* **Localization Notice:** The testing API processes data via servers located in Mainland China. If you reside in a region with strict data localization laws (such as the EU/EEA), please do not use this testing API.
* **Age Requirement:** The Software and API are not intended for use by individuals under the age of 13 (or the minimum age of digital consent in your jurisdiction).
* **Availability:** This free API is provided on an "AS IS" and "AS AVAILABLE" basis. It may be rate-limited, degraded, or discontinued at any time without notice.

---

### 4. Operational Guardrails & Mandatory Human Supervision
The Software leverages probabilistic Large Language Models (LLMs) to interpret page layouts and generate dynamic actions (clicking, typing, scrolling, tab management).
* **No Guarantee of Flawless Execution:** The Software may misinterpret landmarks, fail to identify dynamic changes, or generate unintended browser actions.
* **Mandatory Human Supervision:** The Software is strictly an assistive tool. You are required to actively supervise the agent during active execution, particularly during workflows involving financial transactions, sensitive personal data, or system configuration changes.
* **No Financial Liability:** The maintainers are not liable for accidental purchases, incorrect bookings, data loss, or unauthorized financial transactions resulting from automated actions.
* **Emergency Halt:** You maintain immediate override control. You can terminate agent execution at any moment by closing the active browser tab or clicking the stop button in the interface.

---

### 5. Ethical Use & Platform Compliance
When utilizing the Software, you agree to abide by the following ethical guidelines:
* **Platform ToS Compliance:** You are solely responsible for ensuring that all automated browser actions and web interactions comply with the target websites' Terms of Service and scraping policies.
* **Prohibited Activities:** You agree **NOT** to use the Software to overwhelm web servers or conduct Denial of Service (DDoS) attacks, bypass paywalls or CAPTCHAs unethically, harvest user credentials, or distribute spam.

---

### 6. Disclaimer of Warranties & Limitation of Liability
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

### Chrome Web Store Developer Verification Notice
This standalone Terms of Use policy is the designated official legal policy for **Oryonix AI**. It is host-verified and published publicly for Chromium-based ecosystem developer audits, security evaluations, and Chrome Web Store listing approvals.
