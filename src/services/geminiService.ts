import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResponse {
  targetRole: string;
  matchPercentage: number;
  skills: {
    radarData: {
      axis: string;
      user: number;
      target: number;
      reasoning: string;
      tier: string;
      eligibilityLabel: string;
    }[];
    strengths: { name: string; matchRatio: number }[];
    gaps: string[];
  };
  projects?: {
    title: string;
    description: string;
    expectedOutcome: string;
    difficultyLabel: "Beginner" | "Intermediate" | "Advanced";
    difficultyLevel: number; // 1-5
    techStack: string[];
    blueprint: {
      id: string;
      title: string;
      content: string;
      resources: {
        free: {
          name: string;
          url: string;
          type:
            | "official docs"
            | "tutorial"
            | "video"
            | "open-source tool"
            | "community guide";
          whyItHelps: string;
          estimatedTime: string;
        }[];
        premium: {
          name: string;
          url: string;
          type: "course" | "tool" | "library" | "service";
          cost: string;
          whyItHelps: string;
          worthItIf: string;
        }[];
      };
    }[];
  }[];
}

const CONFIDENCE_MULTIPLIERS: Record<string, number> = {
  demonstrated_strong: 1.0,
  open_source_contribution: 0.95,
  technical_assessment_completion: 0.9,
  degree_doctorate: 0.9,
  degree_masters: 0.85,
  hackathon_participation: 0.85,
  demonstrated_weak: 0.8,
  degree_bachelors: 0.7,
  claimed: 0.55,
  mentioned: 0.35,
  absent: 0.0,
};

const TIER_WEIGHTS: Record<string, number> = {
  core: 0.6,
  supporting: 0.3,
  contextual: 0.1,
};

const CRITICAL_GAP_PENALTY = 0.08;
const MAX_PENALTY = 0.25;

export function computeSkillScore(
  rawProficiency: number,
  evidenceType: string,
  certBonus: number = 0,
): number {
  const multiplier = CONFIDENCE_MULTIPLIERS[evidenceType] ?? 0;
  return Math.min(100, Math.round(rawProficiency * multiplier) + certBonus);
}

export function computeMatchPercentage(
  scoredSkills: {
    tier: string;
    userScore: number;
    targetProficiency: number;
  }[],
): number {
  const byTier: Record<string, number[]> = {
    core: [],
    supporting: [],
    contextual: [],
  };

  let criticalGaps = 0;

  for (const skill of scoredSkills) {
    const matchRatio = skill.userScore / Math.max(1, skill.targetProficiency);
    byTier[skill.tier]?.push(matchRatio);

    // Critical gap: core skill where user covers less than 65% of target
    if (skill.tier === "core" && matchRatio < 0.65) {
      criticalGaps++;
    }
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  let totalWeight = 0;
  let weightedScore = 0;

  if (byTier.core.length > 0) {
    weightedScore += avg(byTier.core) * TIER_WEIGHTS.core;
    totalWeight += TIER_WEIGHTS.core;
  }
  if (byTier.supporting.length > 0) {
    weightedScore += avg(byTier.supporting) * TIER_WEIGHTS.supporting;
    totalWeight += TIER_WEIGHTS.supporting;
  }
  if (byTier.contextual.length > 0) {
    weightedScore += avg(byTier.contextual) * TIER_WEIGHTS.contextual;
    totalWeight += TIER_WEIGHTS.contextual;
  }

  // Normalize if some tiers were completely absent
  if (totalWeight > 0) {
    weightedScore = weightedScore / totalWeight;
  }

  // Apply penalty as a multiplier to avoid dropping low base scores to 0
  const penaltyMultiplier =
    1 - Math.min(MAX_PENALTY, criticalGaps * CRITICAL_GAP_PENALTY);

  return Math.max(0, Math.round(weightedScore * penaltyMultiplier * 100));
}

export function getEligibilityLabel(score: number): string {
  if (score >= 83) return "DISTINGUISHED";
  if (score >= 71) return "COMPETITIVE";
  if (score >= 56) return "ELIGIBLE";
  if (score >= 41) return "DEVELOPING";
  return "NOT READY";
}

function buildRadarData(
  roleSkills: { name: string; tier: string; targetProficiency: number }[],
  userEvidence: {
    skillName: string;
    evidenceType: string;
    rawProficiencyEstimate: number;
    reasoning: string;
    certificationBonus?: number;
  }[],
): {
  axis: string;
  user: number;
  target: number;
  reasoning: string;
  tier: string;
  eligibilityLabel: string;
}[] {
  return roleSkills.map((skill) => {
    const evidence = userEvidence.find((e) => e.skillName === skill.name);
    const userScore = evidence
      ? computeSkillScore(
          evidence.rawProficiencyEstimate,
          evidence.evidenceType,
          evidence.certificationBonus || 0,
        )
      : 0;
    return {
      axis: skill.name,
      user: userScore,
      target: skill.targetProficiency,
      reasoning: evidence ? evidence.reasoning : "No evidence provided.",
      tier: skill.tier,
      eligibilityLabel: getEligibilityLabel(userScore),
    };
  });
}

function deriveStrengthsAndGaps(
  roleSkills: { name: string; tier: string; targetProficiency: number }[],
  userEvidence: {
    skillName: string;
    evidenceType: string;
    rawProficiencyEstimate: number;
    reasoning: string;
    certificationBonus?: number;
  }[],
): { strengths: { name: string; matchRatio: number }[]; gaps: string[] } {
  const strengths: { name: string; matchRatio: number }[] = [];
  const gaps: string[] = [];

  // Sort roleSkills to prioritize core skills for gap/strength identification
  const sortedSkills = [...roleSkills].sort((a, b) => {
    const weights: Record<string, number> = {
      core: 0,
      supporting: 1,
      contextual: 2,
    };
    return weights[a.tier] - weights[b.tier];
  });

  for (const skill of sortedSkills) {
    const evidence = userEvidence.find((e) => e.skillName === skill.name);
    const userScore = evidence
      ? computeSkillScore(
          evidence.rawProficiencyEstimate,
          evidence.evidenceType,
          evidence.certificationBonus || 0,
        )
      : 0;
    const matchRatio = userScore / Math.max(1, skill.targetProficiency);

    // Core Competency threshold: ratio >= 0.55
    if (matchRatio >= 0.55) {
      strengths.push({ name: skill.name, matchRatio });
    }

    // Critical Gap threshold (tier specific) or General GAP
    // We only add to gaps if NOT a strength (matchRatio < 0.55)
    // OR if it's a core skill with matchRatio < 0.65 (even if it's 0.6, it's still a gap relative to target)
    // Wait, the user said "Modify the qualification of core competency: shows skills with ratio ≥ 55%".
    // This implies that skills between 55% and 85% are now "competencies".
    // And skills >= 85% are "mastered".

    if (skill.tier === "core" && matchRatio < 0.65) {
      gaps.unshift(`${skill.name} !!CRITICAL!!`);
    } else if (matchRatio < 0.55) {
      gaps.push(skill.name);
    }
  }

  return { strengths, gaps };
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    targetRole: {
      type: Type.STRING,
      description:
        "A concise, highly specific target role based explicitly on the user's input.",
    },
    rawSkillExtraction: {
      type: Type.OBJECT,
      properties: {
        roleDefinition: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  tier: {
                    type: Type.STRING,
                    enum: ["core", "supporting", "contextual"],
                  },
                  targetProficiency: { type: Type.INTEGER },
                },
                required: ["name", "tier", "targetProficiency"],
              },
            },
          },
          required: ["skills"],
        },
        userEvidence: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              evidenceType: {
                type: Type.STRING,
                enum: [
                  "demonstrated_strong",
                  "open_source_contribution",
                  "technical_assessment_completion",
                  "degree_doctorate",
                  "degree_masters",
                  "hackathon_participation",
                  "demonstrated_weak",
                  "degree_bachelors",
                  "claimed",
                  "mentioned",
                  "absent",
                ],
              },
              rawProficiencyEstimate: { type: Type.INTEGER },
              reasoning: {
                type: Type.STRING,
                description:
                  "A brief 1-2 sentence explanation of why this particular score and evidence tier was chosen, explicitly addressing certifications and projects if any.",
              },
              certificationBonus: {
                type: Type.INTEGER,
                description:
                  "Total certification modifier earned (0, 3, 5, 8, or 10). Output this bonus here, do not add it directly to rawProficiencyEstimate.",
              },
            },
            required: [
              "skillName",
              "evidenceType",
              "rawProficiencyEstimate",
              "reasoning",
              "certificationBonus",
            ],
          },
        },
      },
      required: ["roleDefinition", "userEvidence"],
    },
  },
  required: ["targetRole", "rawSkillExtraction"],
};

export const BLUEPRINT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          expectedOutcome: {
            type: Type.STRING,
            description:
              "A detailed description of the expected outcome after completing this project. Emphasize the skills acquired and how it bridges the gap to the target role. Format with markdown.",
          },
          difficultyLabel: {
            type: Type.STRING,
            enum: ["Beginner", "Intermediate", "Advanced"],
          },
          difficultyLevel: { type: Type.INTEGER, description: "1 to 5" },
          techStack: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          blueprint: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                resources: {
                  type: Type.OBJECT,
                  properties: {
                    free: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          url: { type: Type.STRING },
                          type: {
                            type: Type.STRING,
                            enum: [
                              "official docs",
                              "tutorial",
                              "video",
                              "open-source tool",
                              "community guide",
                            ],
                          },
                          whyItHelps: { type: Type.STRING },
                          estimatedTime: { type: Type.STRING },
                        },
                        required: [
                          "name",
                          "url",
                          "type",
                          "whyItHelps",
                          "estimatedTime",
                        ],
                      },
                    },
                    premium: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          url: { type: Type.STRING },
                          type: {
                            type: Type.STRING,
                            enum: ["course", "tool", "library", "service"],
                          },
                          cost: { type: Type.STRING },
                          whyItHelps: { type: Type.STRING },
                          worthItIf: { type: Type.STRING },
                        },
                        required: [
                          "name",
                          "url",
                          "type",
                          "cost",
                          "whyItHelps",
                          "worthItIf",
                        ],
                      },
                    },
                  },
                  required: ["free", "premium"],
                },
              },
              required: ["id", "title", "content", "resources"],
            },
          },
        },
        required: [
          "title",
          "description",
          "expectedOutcome",
          "difficultyLabel",
          "difficultyLevel",
          "techStack",
          "blueprint",
        ],
      },
    },
  },
  required: ["projects"],
};

export async function generateBlueprintData(
  targetRole: string,
  gaps: string[],
): Promise<any[]> {
  const fallbackModels = [
    "gemini-3.1-pro-preview",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
  ];

  let lastError: any;
  for (let attempt = 0; attempt < fallbackModels.length; attempt++) {
    const currentModel = fallbackModels[attempt];
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: `TARGET ROLE: ${targetRole}\nGAPS IDENTIFIED:\n${gaps.join("\\n")}`,
        config: {
          systemInstruction: `
You are a senior technical mentor creating a personalized learning and project execution blueprint for a candidate.
Your goal is to provide projects that help the candidate close their identified skill gaps and reach the target role.

Generate exactly 3 projects:
- Beginner (difficultyLevel 1-2)
- Intermediate (difficultyLevel 3)
- Advanced (difficultyLevel 4-5)

Requirements:
- Each project must target at least one identified gap skill.
- State explicitly in the description which gap it closes.
- Projects must be buildable, specific, and scoped.
- Together the 3 projects must collectively address all major gaps.
- Each project must be decomposed into 5-8 granular, tactical steps. A "minimal" 3-step approach is insufficient; provide an "optimal" roadmap that covers the full architectural and implementation lifecycle.

Per blueprint step provide:
- 3-5 free resources specific to that step
- 2-3 premium resources specific to that step
- Resources must be real and currently accessible
- If uncertain a resource exists, describe the resource type instead of naming it

Blueprint step formatting rules:
- Concise, readable, actionable
- Use Markdown: bullet points and numbered lists
- NO code blocks, code snippets, or programming examples
- High-level implementation steps and architecture decisions only
- No walls of text

Always return valid JSON matching the provided schema.
`,
          responseMimeType: "application/json",
          responseSchema: BLUEPRINT_SCHEMA,
        },
      });

      const text = response.text || "";
      const sanitizedText = text
        .replace(/```json\n?/, "")
        .replace(/```\n?/, "")
        .trim();

      const raw = JSON.parse(sanitizedText);
      return raw.projects || [];
    } catch (error: any) {
      lastError = error;
      const isRateLimit =
        error?.status === 429 || error?.message?.includes("429");
      if (attempt < fallbackModels.length - 1) {
        if (isRateLimit) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        continue;
      }

      if (attempt === fallbackModels.length - 1) {
        if (isRateLimit) {
          throw new Error(
            "The AI service is currently at maximum capacity. Please wait a minute and try again.",
          );
        }
        throw new Error(
          error?.message || "Failed to generate blueprint. Please try again.",
        );
      }
    }
  }
  throw lastError;
}
export async function analyzeResumeAndJob(
  resume: string,
  targetType: string,
  targetContent: string,
  githubData?: string,
): Promise<AnalysisResponse> {
  const inputSources = {
    resume: resume || "Not provided",
    githubData: githubData || "Not provided",
  };

  const fallbackModels = [
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.1-pro-preview"
  ];

  let lastError: any;
  for (let attempt = 0; attempt < fallbackModels.length; attempt++) {
    const currentModel = fallbackModels[attempt];
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: `TARGET CONTEXT: ${targetType}
ROLE DETAILS: ${targetContent}

RESUME TEXT:
${inputSources.resume}

GITHUB REPOSITORIES:
${inputSources.githubData}`,
        config: {
          systemInstruction: `
You are a ruthlessly accurate technical hiring assessor embedded in a career 
development tool. Accuracy is the only form of helpfulness that matters here. 
A falsely high score that sends a candidate unprepared into an interview 
actively harms them.

PHASE 1 — TARGET ROLE
1. Analyze the ROLE DETAILS provided (and TARGET CONTEXT if it's a URL) to determine the seniority level, technical domain, and day-one expectations.
2. SOURCE HIERARCHY:
   - If TARGET CONTEXT is a URL: This job posting is your PRIMARY source of truth. Extract the specific requirements and preferred skills mentioned there.
   - If ONLY ROLE DETAILS (Text) are provided: Use the user's description as the primary guide, supplemented by objective industry benchmarks for that title.
3. CRITICAL: Ignore the candidate's RESUME TEXT and GITHUB REPOSITORIES during this phase. The role profile must be what the JOB requires, not a reflection of what the candidate HAS.
4. Do not lower benchmarks or adjust requirements based on the candidate's existing experience.

PHASE 2 — SKILL PROFILE
1. Identify the required skills for the role profile established in Phase 1.
2. EXPLICIT TIERING DEFINITIONS:
   - core: Non-negotiable, fundamental requirements for day-one performance. A candidate cannot perform the role without these.
   - supporting: Skills that differentiate high performers or enable core tasks (e.g., related tools, secondary frameworks).
   - contextual: Domain knowledge or specific tooling that adds value but is not central to the primary role functions.
3. SELECTION PRIORITY:
   - Priority 1: Skills explicitly listed as "required" or "preferred" in the TARGET CONTEXT (URL) or ROLE DETAILS (Text).
   - Priority 2: Core technical and soft skills that are industry-standard for the identified role type and seniority.
4. The radar graph MUST represent the most essential competencies for the role, prioritizing what is demanded by the target role over a candidate's strengths if they don't overlap.
5. NEGATIVE CONSTRAINT: Do NOT include skills present in the resume just because they are there.
6. The amount of skills MUST match the seniority level:
- Intern: exactly 5 skills
- Entry-level: exactly 6 skills
- Junior: 6 or 7 skills
- Senior: 8 or 9 skills
- Principal/Staff/Lead: 9 or 10 skills
- Default (Mid-level or unstated): exactly 6 skills

For each skill, assign:
- tier: core | supporting | contextual
- targetProficiency: use these ranges
  Junior: core 55-70, supporting 40-60
  Mid: core 70-80, supporting 55-70
  Senior: core 80-90, supporting 65-80
  Principal: core 85-95, supporting 75-85
Never set all skills to the same number. Roles have uneven requirements.

PHASE 3 — EVIDENCE ASSESSMENT
Default assumption for every skill identified in Phase 2: ABSENT.
Now, compare the Skills Profile against the RESUME TEXT and GITHUB REPOSITORIES.
Upgrade from ABSENT only when you find explicit written proof.

Evidence tiers:
- demonstrated_strong: skill named in a project AND describes outcome, 
  decision, or measurable result
- open_source_contribution: merged PRs, active maintenance, or significant contributions to public open-source repos
- technical_assessment_completion: passed coding tests, LeetCode, or recognized technical evaluations
- degree_doctorate: Ph.D. or equivalent related to the skill
- degree_masters: Master's degree related to the skill
- hackathon_participation: built project during a hackathon/competition
- demonstrated_weak: skill named in project context, no outcomes or detail
- degree_bachelors: Bachelor's degree related to the skill
- claimed: appears in job responsibilities, no project backing
- mentioned: skills section only — NEVER higher than this from skills 
  lists alone, ever
- absent: no evidence found — use liberally

CRITICAL: Skills sections, competency tables, and specialization lists 
are self-reported marketing copy. They prove the candidate knows the word. 
They never qualify as demonstrated_strong or demonstrated_weak alone.

GITHUB EVIDENCE RULES — apply simultaneously with resume evidence:
- A repository that exists with code present = AT MINIMUM demonstrated_weak,
  even without a README. Do not classify an existing repo as mentioned or absent.
- demonstrated_strong: repo with README + described purpose + 
  commits showing progression, not a tutorial clone
- demonstrated_weak: repo exists with code but no README, 
  minimal commits, or clearly forked — still counts as project evidence
- mentioned: language appears in GitHub stats only, no repos found
- absent: no GitHub data provided or no repository for this skill
- Note: Ensure you utilize the provided repository 'topics' and 'last pushed' dates to better assess the candidate's depth and recency in a skill.
Treat GitHub evidence as equal weight to resume evidence when both are present.

For each skill, provide: rawProficiencyEstimate (0–100, your honest estimate of demonstrated proficiency), evidenceType (from the enum), certificationBonus (0, 3, 5, 8, or 10 from any directly relevant certifications — output separately, do not add to raw estimate), and a 1–2 sentence reasoning.

PHASE 4 — SELF-AUDIT (mandatory — do not skip)
Answer each check. If any fails, revise before outputting.

CHECK 1 — GAP MINIMUM
At least 3 skills in gaps?
If no: you are inflating. Return to Phase 3 and reassess.

CHECK 2 — SKILLS SECTION CONTAMINATION
Any skill upgraded to demonstrated_strong or demonstrated_weak solely 
from a skills/competencies/specializations section?
If yes: downgrade to mentioned and re-score.

CHECK 3 — SCORE REALITY
Match percentage above 85% with fewer than 2 core gaps?
If yes: almost certainly inflated. A candidate who covers 85%+ of a 
senior role's requirements would already hold that role. Reassess.

CHECK 4 — SENIOR SKILL COVERAGE
Candidate has 5+ years or holds lead/director/founder title?
Radar must include at least one leadership skill AND one 
architecture or systems skill. Add them if missing.

TARGET ROLE EXTRACTION:
Extract a concise, specific job title from the user input below.
Short input (e.g. "junior data analyst") → proper capitalization, exact title.
Long input or URL → synthesize the most accurate specific title.

Always return valid JSON matching the provided schema.
Think step by step.
Complete each phase fully before moving to the next.
Do not skip the Phase 4 self-audit under any circumstance.
`,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      });

      const text = response.text || "";
      const sanitizedText = text
        .replace(/```json\n?/, "")
        .replace(/```\n?/, "")
        .trim();

      const raw = JSON.parse(sanitizedText);

      const roleSkills = raw.rawSkillExtraction.roleDefinition.skills;
      const userEvidence = raw.rawSkillExtraction.userEvidence;

      const radarData = buildRadarData(roleSkills, userEvidence);
      const { strengths, gaps } = deriveStrengthsAndGaps(
        roleSkills,
        userEvidence,
      );
      const matchPercentage = computeMatchPercentage(
        roleSkills.map((skill: any) => {
          const evidence = userEvidence.find(
            (e: any) => e.skillName === skill.name,
          );
          const userScore = evidence
            ? computeSkillScore(
                evidence.rawProficiencyEstimate,
                evidence.evidenceType,
                evidence.certificationBonus || 0,
              )
            : 0;
          return {
            tier: skill.tier,
            userScore,
            targetProficiency: skill.targetProficiency,
          };
        }),
      );

      return {
        targetRole: raw.targetRole,
        matchPercentage,
        skills: {
          radarData,
          strengths,
          gaps,
        },
      } as AnalysisResponse;
    } catch (error: any) {
      lastError = error;
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("quota");

      if (attempt < fallbackModels.length - 1) {
        if (isRateLimit) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        continue;
      }

      if (attempt === fallbackModels.length - 1) {
        if (isRateLimit) {
          throw new Error(
            "The AI service is currently at maximum capacity. Please wait a minute and try again.",
          );
        }
        throw new Error(
          error?.message || "Failed to analyze resume. Please try again.",
        );
      }
    }
  }
  throw lastError;
}
