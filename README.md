<div align="center">

<img src="https://i.postimg.cc/HnjM1BtM/Untitled-design.png" alt="Hexo — Career AI by StochastIQ" width="100%" />
<br>
<br/>

[![CodeKada](https://img.shields.io/badge/CodeKada%20Hackathon-Entry-F5A623?style=for-the-badge&logo=lightning&logoColor=white)](https://github.com/ps-alex1001/Hexo-Career-AI-by-StochastIQ)
[![Track](https://img.shields.io/badge/Track-Intelligence%20Systems%20%26%20Data-4A90D9?style=for-the-badge)](https://github.com/ps-alex1001/Hexo-Career-AI-by-StochastIQ)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/gemini)
[![Version](https://img.shields.io/badge/Version-v2.1.0-F5A623?style=for-the-badge)](https://github.com/ps-alex1001/Hexo-Career-AI-by-StochastIQ/releases)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<br/>

**Hexo is an AI-powered talent intelligence engine that maps your real, evidenced capabilities against a target role — and tells you exactly which skills are missing and how to build them.**

<br/>

<a href="https://hexo-five-omega.vercel.app/" target="_blank" style="text-decoration:none;">Live Demo</a>&nbsp;&nbsp;·&nbsp;&nbsp;[Report a Bug](https://github.com/ps-alex1001/Hexo-Career-AI-by-StochastIQ/issues)&nbsp;&nbsp;·&nbsp;&nbsp;[Request a Feature](https://github.com/ps-alex1001/Hexo-Career-AI-by-StochastIQ/issues)

</div>

---


## Overview

Most career tools tell you what you have. Hexo tells you what's missing — and more importantly, how to close the gap with evidence that actually holds up under scrutiny.

The name comes from the honeycomb. Bees don't build randomly; every cell is intentional, load-bearing, and connected to the next. The whole structure is proof of work. Hexo applies that logic to your professional profile: each project you build fills a cell, each cell connects to the next, and by the end you don't have a résumé — you have a *hive* that demonstrates, rather than claims, your capabilities.

The core principle that drives every design decision: **claims without proof are penalized.** A skill listed in a résumé skills section is algorithmically worth far less than one demonstrated through a project with measurable outcomes. This isn't a soft heuristic — it's enforced through a hard-coded multiplier system that Gemini cannot override.

Hexo produces four outputs from a résumé and an optional GitHub profile:

- A **Match Percentage** computed by a fully deterministic TypeScript algorithm — not by AI opinion.
- A **Radar Dashboard** showing per-skill scores against role benchmarks, with Gemini's underlying reasoning exposed.
- A ranked **Strengths & Critical Gaps** list, with `‼ CRITICAL` flags for core skills below threshold.
- **Actionable Blueprints** — three tiered project specifications (Beginner → Intermediate → Advanced) with step-by-step roadmaps and curated resources targeting your specific gaps.

---

## Features

<table>
<tr>
<td width="50%">

### Evidence-First Scoring
A skills-section entry is treated as marketing noise until proven otherwise. Only skills backed by projects with measurable outcomes, open-source contributions, or verified assessments receive full weight in the scoring pipeline.

</td>
<td width="50%">

### Multi-Source Analysis
Accepts résumé PDFs via `pdfjs-dist` (with Tesseract.js OCR fallback for image-based documents) and live GitHub profiles. Gemini extracts structured skill evidence from both sources before scoring begins.

</td>
</tr>
<tr>
<td width="50%">

### Tiered Skill Taxonomy
Role requirements are classified into three tiers — `Core` (disqualifying if absent), `Supporting`, and `Contextual` — each carrying a distinct weight in the weighted base score formula.

</td>
<td width="50%">

### Deterministic Scoring
Gemini acts exclusively as a structured data extractor. The final Match Percentage is computed client-side via a hard-coded TypeScript formula. No generative model can hallucinate a score or inflate results.

</td>
</tr>
<tr>
<td width="50%">

### Transparent Radar Dashboard
Every skill node on the radar exposes the model's reasoning and the benchmarked target proficiency for the role's seniority level. Nothing is a black box — the gap between your score and the target is always quantified.

</td>
<td width="50%">

### Gap-Targeted Blueprints
Each blueprint is generated specifically for your identified gaps, not from a generic template. Steps include 3–5 free resources and 2–3 premium resources per tactical phase, rendered as interactive markdown.

</td>
</tr>
</table>

---

## Tech Stack

<div align="center">

<table>
<tr>
<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=react" width="48" /><br/>
<sub><b>React 19</b></sub>
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=typescript" width="48" /><br/>
<sub><b>TypeScript</b></sub>
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=vite" width="48" /><br/>
<sub><b>Vite</b></sub>
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" /><br/>
<sub><b>Tailwind v4</b></sub>
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=express" width="48" /><br/>
<sub><b>Express</b></sub>
</td>

<td align="center" width="120">
<img src="https://skillicons.dev/icons?i=vercel" width="48" /><br/>
<sub><b>Vercel</b></sub>
</td>
</tr>
</table>

<br/>

<table>
<tr>
<td align="center" width="140">
<img src="https://cdn.simpleicons.org/googlegemini/8E75FF" width="48" /><br/>
<sub><b>Gemini Flash</b></sub>
</td>

<td align="center" width="140">
<img src="https://cdn.simpleicons.org/framer/ffffff" width="48" /><br/>
<sub><b>Framer Motion</b></sub>
</td>
</tr>
</table>

</div>

<br/>

<details>
<summary><b>Full dependency versions</b></summary>

<br/>

| Package | Version | Role |
| :--- | :--- | :--- |
| `react` | 19.0.1 | UI framework |
| `typescript` | ~5.8.2 | Language (94.6% of codebase) |
| `vite` | 6.2.3 | Build tool & dev server |
| `tailwindcss` | 4.1.14 | Utility-first CSS |
| `motion` | 12.23.24 | Animations (Framer Motion) |
| `recharts` | 3.8.1 | Radar chart & data visualisation |
| `lucide-react` | 0.546.0 | Icon library |
| `react-markdown` | 10.1.0 | Blueprint markdown rendering |
| `@google/genai` | 1.29.0 | Gemini API SDK |
| `pdfjs-dist` | 5.7.284 | PDF text extraction |
| `tesseract.js` | 7.0.0 | OCR fallback for image-based PDFs |
| `express` | 4.21.2 | Lightweight server |
| `vitest` | — | Unit testing |

</details>

---


## Application Architecture

Hexo is a client-side SPA with a state-based screen router. There are no page navigations — all transitions are managed through React state in `App.tsx`.


| Screen | Component | Responsibility |
| :--- | :--- | :--- |
| Landing | `LandingScreen.tsx` | Hero page and product introduction |
| Workspace | `WorkspaceScreen.tsx` | Role input, résumé upload/paste, GitHub URL |
| Dashboard | `DashboardScreen.tsx` | Match %, radar chart, strengths, gaps, project stubs |
| Blueprint | `BlueprintScreen.tsx` | Full per-project roadmap with steps and resources |
| How It Works | `HowItWorksScreen.tsx` | In-app algorithm explainer |


---

## AI Integration

### Model Fallback Chain

Hexo targets the fastest available model and degrades gracefully under rate pressure:

```
gemini-3-flash-preview
        │  429 / timeout
        ▼
gemini-2.5-flash
        │  429 / timeout
        ▼
gemini-3.1-flash-lite-preview
        │  429 / timeout
        ▼
gemini-3.1-pro-preview
```

Each fallback applies exponential backoff before retrying the next tier.

### Core Functions



The primary analysis entrypoint. Executes a structured 5-phase prompt chain:

1. Define the target role's requirements independent of the candidate (job-first, not candidate-first).
2. Build a tiered skill profile with `core`, `supporting`, and `contextual` classifications and seniority-appropriate target proficiencies.
3. Assess user evidence for each skill across 11 evidence tiers.
4. Generate three project stubs (Beginner / Intermediate / Advanced) targeting identified gaps.
5. Self-audit: verify gap minimum coverage, check for score inflation, confirm senior-level skills are represented.

After Gemini returns, the deterministic scoring algorithm runs entirely client-side in TypeScript. The AI never sets the final score.

**`generateSingleProjectBlueprint(targetRole, gaps, projectIndex, originalProject)`**

Lazy-loaded when the user opens a specific blueprint. Produces a full project roadmap — 5 to 8 tactical steps, each with 3–5 free resources and 2–3 premium resources scoped to the user's actual gaps.

**`generateBlueprintData(targetRole, gaps)`**

Batch variant that generates all three blueprints in a single API call, used as an alternative to lazy loading.

---

## Scoring Algorithm


### Step 1 · Raw Proficiency Extraction

For each skill identified in the résumé and GitHub profile, Gemini returns two values:

- **`rawProficiencyEstimate`** — a 0–100 estimate of actual demonstrated proficiency. The model is explicitly instructed not to inflate this; listing a skill without context cannot yield a high estimate.
- **`evidenceType`** — the quality class of the candidate's proof for that skill.

---

### Step 2 · Skill Score with Confidence Multiplier

The raw estimate is deflated or preserved depending on how the skill was evidenced:

$$S_{\text{skill}} = \min\!\left(100,\ \text{round}\!\left(P_{\text{raw}} \times M_c\right) + B_{\text{cert}}\right)$$

| Evidence Type | $M_c$ | What It Means |
| :--- | :---: | :--- |
| `demonstrated_strong` | 1.00 | Project with a measurable outcome |
| `open_source_contribution` | 0.95 | Merged PRs or active repository maintenance |
| `technical_assessment_completion` | 0.90 | LeetCode, HackerRank, or equivalent passed |
| `degree_doctorate` | 0.90 | PhD in a directly relevant domain |
| `degree_masters` | 0.85 | Master's in a directly relevant domain |
| `hackathon_participation` | 0.85 | Built and demonstrated during a competition |
| `demonstrated_weak` | 0.80 | Project use present, no quantified outcome |
| `degree_bachelors` | 0.70 | Bachelor's in a directly relevant domain |
| `claimed` | 0.55 | Listed under job responsibilities, no project proof |
| `mentioned` | 0.35 | Appears in a skills section only — treated as marketing noise |
| `absent` | 0.00 | No evidence found |

$B_{\text{cert}}$ is an optional certification bonus of 0, 3, 5, 8, or 10 points depending on relevance, capped so $S_{\text{skill}} \leq 100$.

**The multiplier is the algorithm's primary anti-inflation mechanism.** The same skill with the same raw estimate yields radically different scores depending on evidence quality:

| Evidence | $P_{\text{raw}}$ | $M_c$ | $S_{\text{skill}}$ |
| :--- | :---: | :---: | :---: |
| Python — project with measurable outcomes (`demonstrated_strong`) | 72 | 1.00 | **72** |
| Python — listed in skills section only (`mentioned`) | 72 | 0.35 | **25** |

---

### Step 3 · Match Ratio per Skill

Each skill score is normalised against the expected proficiency for the target role's seniority level:

$$R_{\text{match}} = \frac{S_{\text{skill}}}{\max(1,\ T_{\text{proficiency}})}$$

| Seniority | Core Target Range |
| :--- | :--- |
| Junior | 55 – 70 |
| Mid | 70 – 80 |
| Senior | 80 – 90 |
| Principal | 85 – 95 |

---

### Step 4 · Critical Gap Detection

A skill is flagged as a critical gap when it is both load-bearing for the role and significantly underserved:

$$\text{skill.tier} = \texttt{"core"} \quad \text{AND} \quad R_{\text{match}} < 0.65$$

Critical gaps are surfaced at the top of the dashboard with a `‼ CRITICAL` marker and feed into the penalty multiplier below.

---

### Step 5 · Weighted Base Score

Skills are bucketed by tier and averaged within each bucket before being combined into a single weighted score:

| Tier | Weight |
| :--- | :---: |
| `core` | 0.60 |
| `supporting` | 0.30 |
| `contextual` | 0.10 |

$$W_{\text{base}} = \overline{R}_{\text{core}} \times 0.60\ +\ \overline{R}_{\text{supporting}} \times 0.30\ +\ \overline{R}_{\text{contextual}} \times 0.10$$

**Normalization:** Roles that omit a tier (e.g. no contextual skills) have their weights renormalized so the denominator equals only the sum of the present tiers:

$$W_{\text{normalized}} = \frac{W_{\text{base}}}{\displaystyle\sum_{\text{present tiers}} w_i}$$

---

### Step 6 · Critical Gap Penalty

Each critical gap applies a compounding penalty to the base score, capped at −25%:

$$M_{\text{penalty}} = 1 - \min\!\left(0.25,\ \text{NumCriticalGaps} \times 0.08\right)$$

| Critical Gaps | $M_{\text{penalty}}$ | Net Effect |
| :---: | :---: | :--- |
| 0 | 1.00 | No penalty |
| 1 | 0.92 | −8% |
| 2 | 0.84 | −16% |
| 3 | 0.76 | −24% |
| 4+ | 0.75 | Capped at −25% |

---

### Step 7 · Final Match Percentage

$$\boxed{\text{Match \%} = \max\!\left(0,\ \text{round}\!\left(W_{\text{normalized}} \times M_{\text{penalty}} \times 100\right)\right)}$$

---

### Step 8 · Strength and Gap Classification

After all scores are computed, each skill receives a dashboard label:

| $R_{\text{match}}$ | Label | Display |
| :--- | :--- | :--- |
| ≥ 0.85 | Mastered / Excellence | 🔵 Blue highlight |
| ≥ 0.55 | Core Competency | 🟢 Green |
| < 0.55 (supporting / contextual) | Gap | Listed in gaps panel |
| < 0.65 AND core tier | Critical Gap | ‼ Shown first |

Each skill also receives an **eligibility label** displayed on the radar chart:

| Score Range | Label |
| :---: | :--- |
| ≥ 83 | DISTINGUISHED |
| ≥ 71 | COMPETITIVE |
| ≥ 56 | ELIGIBLE |
| ≥ 41 | DEVELOPING |
| < 41 | NOT READY |

---

## Worked Example

**Target role:** Senior ML Engineer &nbsp;·&nbsp; **Seniority targets:** core = 85, supporting = 65

| Skill | Tier | Target | Evidence | $P_{\text{raw}}$ | $M_c$ | $S_{\text{skill}}$ | $R_{\text{match}}$ | Flag |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| PyTorch | core | 85 | `demonstrated_strong` | 80 | 1.00 | 80 | 0.94 | — |
| MLOps | core | 80 | `mentioned` | 65 | 0.35 | 23 | 0.29 | ‼ |
| SQL | supporting | 65 | `demonstrated_weak` | 70 | 0.80 | 56 | 0.86 | — |

**Step 5 — Weighted base score** (no contextual tier present):

$$W_{\text{base}} = \text{avg}(0.94,\ 0.29) \times 0.60\ +\ \text{avg}(0.86) \times 0.30 = 0.615 \times 0.60 + 0.86 \times 0.30 = 0.627$$

$$W_{\text{normalized}} = \frac{0.627}{0.60 + 0.30} = 0.697$$

**Step 6 — Penalty** (1 critical gap):

$$M_{\text{penalty}} = 1 - (1 \times 0.08) = 0.92$$

**Step 7 — Final score:**

$$\text{Match \%} = \text{round}(0.697 \times 0.92 \times 100) = \mathbf{64\%}$$

Without the MLOps critical gap, the raw weighted score would be ~70%. The 6-point penalty reflects a concrete hiring risk: a missing core skill is disqualifying regardless of performance on supporting skills.

---

## Contributing
Contributions are welcome from developers, builders, and curious learners. For major changes, please open an issue first so the implementation and direction can be discussed properly.

<p align="center">
  <a href="https://github.com/ps-alex1001">
    <img src="https://github.com/ps-alex1001.png" width="80" height="80"/>
  </a>
  <a href="https://github.com/muyonii">
    <img src="https://github.com/muyonii.png" width="80" height="80"/>
  </a>
  <a href="https://github.com/lowii0">
    <img src="https://github.com/lowii0.png" width="80" height="80"/>
  </a>
  <a href="https://github.com/yoshiru-cloud">
    <img src="https://github.com/yoshiru-cloud.png" width="80" height="80"/>
  </a>
</p>


---

<div align="center">

Made with 💜 by the StochastIQ &nbsp;·&nbsp; CodeKada Hackathon 2026 &nbsp;·&nbsp; *Build from Anywhere, Build Anything*



*Hexo. Find your missing cell.*

</div>
