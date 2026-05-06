# Hexo Career AI

Hexo Career AI is a high-performance web application designed for precise skill gap analysis and the generation of professional trajectory blueprints. By leveraging the advanced reasoning capabilities of the Gemini 2.0 Flash model, the application provides ruthless, highly accurate assessments of a candidate's resume against a specific target role, and delivers actionable, project-based roadmaps to close any identified gaps.

## Features

- **Accurate Profile Extraction**: Upload a resume (PDF with automatic OCR fallback using Tesseract.js, or raw text) and optionally include GitHub context to evaluate real-world evidence of technical capability.
- **Ruthless Skill Gap Analysis**: Skills are categorized into `core`, `supporting`, and `contextual` tiers. The system assesses actual demonstrated evidence rather than just keyword matching.
- **Interactive Dashboard**: Visualize your current proficiency versus target requirements on an interactive radar chart, replete with benchmark guidelines (Junior through Staff) and AI-generated reasoning for each score.
- **Actionable Blueprints**: Generates exactly three targeted portfolio projects (Beginner, Intermediate, Advanced) explicitly designed to close the hardest identified skill gaps, complete with free and premium learning resources.
- **Dark/Light Mode & Glassmorphism UI**: A beautifully crafted, modern UI utilizing Tailwind CSS and Framer Motion.

## How to Use

1. **Enter Target Context**: Specify the role you are targeting (e.g., "Senior Machine Learning Engineer", "Frontend Developer", or simply paste a job description).
2. **Provide Evidence**: Upload your resume in PDF format (text layer or image-based) or paste raw text. Optionally provide a GitHub username to include repository data.
3. **Analyze**: Click "Analyze". The system processes your documents and calls the Gemini API to rigorously assess your qualifications.
4. **Review Results**: View your Match Percentage, Strengths, and Critical Gaps on the Dashboard screen. Hover over the nodes on the radar chart to see your score, the target score, and the exact reason you received your rating.
5. **Follow the Blueprint**: Click "View Blueprint" to access the tailored, step-by-step project plans designed to close your technical gaps and elevate your profile.

## How to Run

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

## The Score Calculation Process

Hexo Career AI employs a multi-phase, rigorous scoring engine designed from a "hiring manager's perspective"—aimed at preventing false positives and ensuring candidates are truly ready for day one on the job.

### 1. Target Benchmarking
The AI first deconstructs the target role to identify necessary skills (scaling from 5 skills for Interns to up to 10 for Principal roles) and assigns them a **Tier** and a **Target Proficiency**:
- **Tiers**: `core` (disqualifying if missing), `supporting` (separates good from average), or `contextual`.
- **Target Proficiency**: Scales by seniority (e.g., Junior core skills demand 55-70; Principal roles demand 85-95).

### 2. Individual Skill Scoring
For every skill, the AI estimates a **Raw Proficiency** ($P_{raw}$, from 0-100) and an **Evidence Type**, which determines the confidence multiplier ($M_{c}$) applied:

| Evidence Type | Multiplier ($M_{c}$) | Description |
| :--- | :--- | :--- |
| `demonstrated_strong` | **1.00** | Explicit proof of outcome/impact in a professional project. |
| `open_source_contribution`| **0.95** | Merged PRs or active maintenance in public repositories. |
| `technical_assessment` | **0.90** | Verified completion of LeetCode/Hackerrank or coding tests. |
| `demonstrated_weak` | **0.80** | Skill used in a project but without documented results. |
| `claimed` | **0.55** | Appears in job summaries but lacks project backing. |
| `mentioned` | **0.35** | A raw keyword in a skills list (marketing noise). |
| `absent` | **0.00** | No evidence found. |

**The Skill Score Formula:**
$$S_{skill} = \min\left(100, \text{round}(P_{raw} \times M_{c}) + B_{cert}\right)$$
*Where $B_{cert}$ is the Certification Bonus (up to +10, capped based on seniority).*

### 3. Match Ratio & Critical Gaps
For each skill, we calculate a **Match Ratio** ($R_{match}$):
$$R_{match} = \frac{S_{skill}}{\max(1, \text{Target Proficiency})}$$

**Critical Gaps:** A critical gap is flagged if a `core` tier skill has an $R_{match} < 0.65$. Each gap incurs a steep penalty to reflect the risk of a "false positive" hire.

### 4. Overall Match Percentage Calculation
The final match percentage is a weighted average of the $R_{match}$ across all identified skills, normalized by the tiers present:

1.  **Weighted Score ($W_{base}$):**
    $$W_{base} = \sum (\text{Avg}(R_{match\_tier}) \times \text{Weight}_{tier})$$
    *   `core`: **0.60** | `supporting`: **0.30** | `contextual`: **0.10**

2.  **Normalization:**
    If any tier is completely unrepresented in the role deconstruction, the $W_{base}$ is divided by the sum of weights of the *present* tiers. This ensures a role with no "Contextual" skills isn't unfairly mathematically capped at 90%.

3.  **Penalty Multiplier ($M_{penalty}$):**
    $$M_{penalty} = 1 - \min(0.25, \text{NumCriticalGaps} \times 0.08)$$
    *This multiplier ensures that even a candidate with many mid-tier strengths cannot "average out" missing core competencies.*

4.  **Final Result:**
    $$\text{Overall Match \%} = \max(0, \text{round}(W_{normalized} \times M_{penalty} \times 100))$$

### 5. Core Competency Classification (Strengths)
A skill is officially recognized as a **Core Competency** or **Strength** in the dashboard when the candidate demonstrates functional capability relative to the specific role's demands:

-   **Threshold**: $R_{match} \ge 0.55$.
-   **Core Competency**: The candidate meets at least 55% of the target proficiency benchmark.
-   **Excellence / Mastered**: If $R_{match} \ge 0.85$, the skill is highlighted in **Blue** to indicate mastery.
-   **Significance**: Competencies (Green) indicate a solid foundation, while Mastered skills (Blue) are areas where the candidate requires zero ramp-up and can mentor others. Unlike simple keyword matching, these statuses are only granted if the AI finds relevant evidence in the resume or GitHub data.

This mathematical rigor ensures that an 85% match truly reflects a candidate capable of high performance, rather than someone with "keyword density" but no core depth.
