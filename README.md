# KAVACH Risk Command Center

## 💡 Ultimate Idea Summary
**KAVACH Risk Command Center** unifies scam detection and loan repayment distress into a single platform. Financial institutions usually treat fraud and defaults as separate problems, but KAVACH recognizes that **a scam victim today is a loan defaulter tomorrow.** By generating "Twin Scores" (Fraud + Repayment), KAVACH allows analysts to identify vulnerable borrowers and intervene early. Its core philosophy is simple: **Protect first, collect second.**

## 🗂️ Features & Navigation

*   **🎯 Overview:** The cinematic command center. It features the 3D DNA Risk Helix, giving a top-down narrative of real-time threat signals, system health, and immediate intervention risks.
*   **🔔 Alerts:** Your tiered early-warning system. It flags high-risk signals with plain-language explanations (not black-box numbers), ending in a protective next action.
*   **👥 Customers:** Context-rich profiles of individual borrowers. It tracks their vulnerability using the twin scores to identify potential scam victims before they go into default.
*   **⛧ Mule Network:** A visual web of interconnected, suspicious accounts. It tracks where scammed funds are flowing, helping analysts shut down money laundering networks.
*   **💰 Loans:** The financial impact zone. It highlights the "victim-to-default bridge," showing which specific loans are at immediate risk of default due to external fraud.
*   **🎯 Evaluation:** The analyst's testing ground. It features interactive sliders that allow operators to dynamically adjust risk thresholds and see how it impacts the scoring model.
*   **💼 Cases:** The investigation workflow. Where analysts manage active threats and move seamlessly from spotting a pattern to taking decisive action.
*   **🪬 Fairness:** The ethical check. It tracks bias signals to ensure the AI scoring remains equitable and humane across all demographics, keeping the system trustworthy.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, TailwindCSS
- **Visualizations:** Three.js (WebGL 3D DNA Helix), Framer Motion, Recharts
- **UI Components:** Radix UI

## 🚀 Quick Start (Windows)
For convenience on Windows, you can use the provided batch scripts:
- **`setup.bat`**: Double-click this to automatically install `pnpm` and all project dependencies.
- **`run.bat`**: Double-click this to start the development server (`pnpm dev:static` or `pnpm dev`).

Alternatively, via CLI:
- `pnpm install`
- `pnpm dev:static` (Frontend only mode)
- `pnpm build:static` (Build frontend)
