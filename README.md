# 🧬 Hexo Career AI | Ruthless Talent Mapping

> **"Stop guessing where your career stands. Start mapping it with evidence."**

Hexo Career AI is a high-performance talent intelligence engine built to eliminate the ambiguity of manual resume screening. It leverages the reasoning power of the **Gemini 2.0 Flash** model to perform surgical skill gap analysis, resulting in a deterministic match score and an actionable project-based roadmap.

---

## 👨‍⚖️ Judge's Quick Guide

In a market flooded with "AI keyword matchers," Hexo stands apart through its **Evidence-First Philosophy**. 

### The Problem: AI Hallucinations in Recruitment
Most AI screeners simply look for keywords or ask an LLM, "How good is this candidate?" This leads to high scores for "marketing fluff" (skills lists) and ignores real proof.

### The Hexo Solution:
1. **Zero-Trust Scoring**: Our custom algorithm penalizes claims without evidence. A listed skill is worth $1/3$ of a demonstrated one.
2. **Deterministic Logic**: While Gemini extracts the data, the final score is computed by a rigid mathematical formula, ensuring consistency and preventing AI "niceness" or bias.
3. **Actionable Closure**: We don't just identify gaps; we generate three tiered portfolio projects (Beginner to Advanced) designed specifically to fill them.

---

## 🛠 Key Features

- **Multi-Source Evidence Gathering**: Processes Resume PDFs (with OCR fallback) and GitHub profiles to verify technical capability.
- **Tiered Skill Taxonomy**: Categorizes requirements into `Core` (disqualifying), `Supporting`, and `Contextual` skills.
- **Transparent Radar Analysis**: Every score on the dashboard includes the AI's underlying reasoning and benchmarked expectations.
- **Step-by-Step Blueprints**: Provides targeted learning paths and project specs to bridge technical deficits.

---

## 🚀 How to Use

1. **Enter Target Context**: Specify the role you are targeting (e.g., "Senior Machine Learning Engineer", "Frontend Developer", or simply paste a job description).
2. **Provide Evidence**: Upload your resume in PDF format (text layer or image-based) or paste raw text. Optionally provide a GitHub username to include repository data.
3. **Analyze**: Click "Analyze". The system processes your documents and calls the Gemini API to rigorously assess your qualifications.
4. **Review Results**: View your Match Percentage, Strengths, and Critical Gaps on the Dashboard screen. Hover over the nodes on the radar chart to see your score, the target score, and the exact reason you received your rating.
5. **Follow the Blueprint**: Click "View Blueprint" to access the tailored, step-by-step project plans designed to close your technical gaps and elevate your profile.

---

## 💻 How to Run

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hexo-career-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   ```

## 📐 The Scoring Algorithm

> [!IMPORTANT]
> **Deterministic Disclaimer**: This scoring logic is explicitly decoupled from the generative AI's opinion. The AI acts only as a "data extractor." The final Match Percentage is computed via a hard-coded algebraic formula. This prevents the system from "hallucinating" high scores or being swayed by marketing-heavy resumes that lack substantive proof.

### Step 1: Raw Proficiency Estimate (The Extraction)
The Gemini model looks at your resume/GitHub and assigns each skill two values:
- `rawProficiencyEstimate`: an honest 0–100 estimate of your actual demonstrated skill level.
- `evidenceType`: how you demonstrated it (the quality of the proof).

The AI is explicitly forbidden from inflating these; skills sections alone can never be higher than "mentioned".

### Step 2: Skill Score — Applying the Confidence Multiplier
$$S_{\text{skill}} = \min(100, \text{round}(P_{\text{raw}} \times M_c) + B_{\text{cert}})$$
The evidence type is converted to a confidence multiplier $M_c$:

| Evidence Type | $M_c$ | What it means |
| :--- | :--- | :--- |
| `demonstrated_strong` | 1.00 | Project with measurable outcome |
| `open_source_contribution` | 0.95 | Merged PRs / active maintenance |
| `technical_assessment_completion` | 0.90 | LeetCode / coding test passed |
| `degree_doctorate` | 0.90 | PhD in the relevant domain |
| `degree_masters` | 0.85 | Master's in the relevant domain |
| `hackathon_participation` | 0.85 | Built during a competition |
| `demonstrated_weak` | 0.80 | Project use, no measurable result |
| `degree_bachelors` | 0.70 | Bachelor's in the relevant domain |
| `claimed` | 0.55 | In job responsibilities, no project proof |
| `mentioned` | 0.35 | Only in a skills list — marketing noise |
| `absent` | 0.00 | No evidence at all |

$B_{\text{cert}}$ is an optional certification bonus (0, 3, 5, 8, or 10 points) for relevant certifications, capped at 100.

**Example:** You have Python listed in a project with described outcomes (`demonstrated_strong`, $M_c = 1.0$) and the AI estimates raw proficiency at 72:
$$S_{\text{skill}} = \min(100, \text{round}(72 \times 1.0) + 0) = 72$$
Same skill, but only listed in your skills section (`mentioned`, $M_c = 0.35$):
$$S_{\text{skill}} = \min(100, \text{round}(72 \times 0.35) + 0) = 25$$
This is the algorithm's key anti-inflation mechanism — proof quality dramatically affects the score.

### Step 3: Match Ratio per Skill
$$R_{\text{match}} = \frac{S_{\text{skill}}}{\max(1, \text{Target Proficiency})}$$
Each skill also has a target proficiency set by the role's seniority level:
- **Junior core:** 55–70 | **Mid core:** 70–80 | **Senior core:** 80–90 | **Principal core:** 85–95

So a score of 72 against a Senior role requiring 85:
$$R_{\text{match}} = 72 / 85 = 0.847 \quad (\sim 85\% \text{ of target met})$$

### Step 4: Identifying Critical Gaps
A critical gap is flagged when:
$$\text{skill.tier} = \text{"core"} \quad \text{AND} \quad R_{\text{match}} < 0.65$$
Each critical gap increments a counter used in the penalty below. Critical gaps are also bubbled to the top of the displayed gap list with a !!CRITICAL!! marker.

### Step 5: Weighted Base Score
Skills are bucketed into three tiers with fixed weights:

| Tier | Weight |
| :--- | :--- |
| `core` | 0.60 |
| `supporting` | 0.30 |
| `contextual` | 0.10 |

For each tier present, the average $R_{\text{match}}$ across all skills in that tier is computed, then multiplied by its weight and summed:
$$W_{\text{base}} = \text{avg}(R_{\text{match, core}}) \times 0.60 + \text{avg}(R_{\text{match, supporting}}) \times 0.30 + \text{avg}(R_{\text{match, contextual}}) \times 0.10$$
**Normalization:** If a tier is completely absent (e.g. a role has no contextual skills), the weights of only the present tiers are summed and used as the denominator:
$$W_{\text{normalized}} = \frac{W_{\text{base}}}{\sum \text{present tier weights}}$$

### Step 6: Critical Gap Penalty Multiplier
$$M_{\text{penalty}} = 1 - \min(0.25, \text{NumCriticalGaps} \times 0.08)$$
| # Critical Gaps | $M_{\text{penalty}}$ |
| :--- | :--- |
| 0 | 1.00 (no penalty) |
| 1 | 0.92 (−8%) |
| 2 | 0.84 (−16%) |
| 3 | 0.76 (−24%) |
| 4+ | 0.75 (capped at −25%) |

### Step 7: Final Match Percentage
$$\text{Overall Match \%} = \max(0, \text{round}(W_{\text{normalized}} \times M_{\text{penalty}} \times 100))$$

### Step 8: Strength/Gap Classification
After all scores are computed, each skill is classified using its $R_{\text{match}}$:

| $R_{\text{match}}$ | Label | Dashboard display |
| :--- | :--- | :--- |
| ≥ 0.85 | Mastered / Excellence | Blue highlight |
| ≥ 0.55 | Core Competency | Green |
| < 0.55 (supporting/contextual) | Gap | Shown in gaps list |
| < 0.65 AND core tier | Critical Gap | Shown first with !!CRITICAL!! |

---

## Full Worked Example
Suppose a Senior ML Engineer role has 3 skills:

| Skill | Tier | Target | Your evidence | $P_{\text{raw}}$ | $M_c$ | $S_{\text{skill}}$ | $R_{\text{match}}$ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| PyTorch | core | 85 | `demonstrated_strong` | 80 | 1.00 | 80 | 0.94 |
| MLOps | core | 80 | `mentioned` | 65 | 0.35 | 23 | 0.29 → **CRITICAL GAP** |
| SQL | supporting | 65 | `demonstrated_weak` | 70 | 0.80 | 56 | 0.86 |

$$W_{\text{base}} = \text{avg}(0.94, 0.29) \times 0.60 + \text{avg}(0.86) \times 0.30$$
$$= 0.615 \times 0.60 + 0.86 \times 0.30 = 0.369 + 0.258 = 0.627$$

$$W_{\text{normalized}} = 0.627 / (0.60 + 0.30) = 0.697 \quad \text{(no contextual tier)}$$

$$M_{\text{penalty}} = 1 - (1 \times 0.08) = 0.92 \quad \text{(1 critical gap)}$$

$$\text{Final} = \text{round}(0.697 \times 0.92 \times 100) = \text{round}(64.1) = 64\%$$
Without the MLOps gap penalty, the raw weighted score would have been ~70% — the penalty correctly signals that a missing core skill is a disqualifying issue.

