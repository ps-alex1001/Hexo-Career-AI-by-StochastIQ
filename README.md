# 🐝 Hexo — Find Your Missing Cell

*The gap in your profile isn't a weakness — it's a missing cell. Hexo shows those gaps and how to fill it.*

**CodeKada Hackathon Entry** · Theme: *Build from Anywhere, Build Anything* · Track: *Intelligence Systems & Data*

---

## What is Hexo?

The honeycomb is the most efficient structure in nature. Bees don't build randomly — every cell is intentional, perfectly shaped, and connects to the next. The whole thing is proof of work.

**Hexo applies that logic to your career.**

It doesn't mean you lack skills — you just lack structure to hone those skills. Each project you build is a cell. Each cell connects. By the end you don't have a resume, you have a hive: something you built, something visible, something that proves you did the work.

Hexo is a talent intelligence engine powered by **Gemini 3.0 Flash** that maps your real, evidenced capabilities against a target role — and shows you exactly which cells are missing and how to fill them.

---

## ✨ Features

- **Evidence-First Scoring** — Claims without proof are penalized. A skill listed in your skills section is worth a fraction of one demonstrated in a real project with measurable outcomes.
- **Multi-Source Analysis** — Imports Resume PDFs (text layer + OCR fallback) and live GitHub profiles to verify technical capability, not just keywords.
- **Tiered Skill Taxonomy** — Requirements are classified as `Core` (disqualifying if missing), `Supporting`, or `Contextual`, each weighted accordingly.
- **Deterministic Algorithm** — Gemini only extracts data. The final Match Percentage is computed by a rigid mathematical formula based on carefully though algebra in order to maintain no bias.
- **Transparent Radar Dashboard** — Every score includes the AI's underlying reasoning and benchmarked target expectations.
- **Actionable Blueprints** — Three tiered portfolio project specs (Beginner → Intermediate → Advanced) generated specifically to close your identified gaps.

---

## 🌐 Links

| | URL |
|---|---|
| **Live Demo** | _coming soon_ |
| **Fallback** | _coming soon_ |

---

## 🚀 How to Use

1. **Enter Target Context** — Specify the role you are targeting (e.g. `"Senior ML Engineer"`) or paste a job listing URL.
2. **Provide Evidence** — Upload your resume (PDF) or paste raw text. Optionally add a GitHub profile link.
3. **Analyze** — Click **Analyze**. Hexo processes your documents and calls Gemini to assess your qualifications.
4. **Review Results** — View your Match %, Strengths, and Critical Gaps on the Dashboard. Hover radar nodes to see your score vs. the target.
5. **Follow the Blueprint** — Click **View Blueprint** for personalized, step-by-step project plans to close your gaps.

---

## 📐 The Scoring Algorithm

> [!IMPORTANT]
> **Deterministic Disclaimer**: This scoring logic is explicitly decoupled from the generative AI's opinion. The AI acts only as a "data extractor." The final Match Percentage is computed via a hard-coded algebraic formula. This prevents the system from "hallucinating" high scores or being swayed by marketing-heavy resumes that lack substantive proof.

### Step 1: Raw Proficiency Estimate (The Extraction)
The Gemini model looks at your resume/GitHub profile and projects then it assigns each skill two values:
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

---

*Hexo. Find your missing cell.*
