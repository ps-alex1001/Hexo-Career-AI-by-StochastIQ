import { describe, it, expect } from 'vitest';
import { computeSkillScore, computeMatchPercentage } from './geminiService';

describe('computeSkillScore', () => {
  it('should apply demonstrated_strong multiplier correctly', () => {
    // 100 * 1.00 = 100
    expect(computeSkillScore(100, 'demonstrated_strong')).toBe(100);
    // 80 * 1.00 = 80
    expect(computeSkillScore(80, 'demonstrated_strong')).toBe(80);
  });

  it('should apply demonstrated_weak multiplier correctly', () => {
    // 100 * 0.80 = 80
    expect(computeSkillScore(100, 'demonstrated_weak')).toBe(80);
    // 50 * 0.80 = 40
    expect(computeSkillScore(50, 'demonstrated_weak')).toBe(40);
  });

  it('should apply new evidence multipliers correctly', () => {
    expect(computeSkillScore(100, 'open_source_contribution')).toBe(95);
    expect(computeSkillScore(100, 'technical_assessment_completion')).toBe(90);
    expect(computeSkillScore(100, 'degree_doctorate')).toBe(90);
    expect(computeSkillScore(100, 'degree_masters')).toBe(85);
    expect(computeSkillScore(100, 'hackathon_participation')).toBe(85);
    expect(computeSkillScore(100, 'degree_bachelors')).toBe(70);
  });

  it('should apply claimed multiplier correctly', () => {
    // 100 * 0.55 = 55
    expect(computeSkillScore(100, 'claimed')).toBe(55);
    // 60 * 0.55 = 33
    expect(computeSkillScore(60, 'claimed')).toBe(33);
  });

  it('should apply mentioned multiplier correctly', () => {
    // 100 * 0.35 = 35
    expect(computeSkillScore(100, 'mentioned')).toBe(35);
  });

  it('should apply absent multiplier correctly', () => {
    // 100 * 0.00 = 0
    expect(computeSkillScore(100, 'absent')).toBe(0);
  });

  it('should add certification bonus correctly', () => {
    // (50 * 0.55) + 10 = 28 + 10 = 38 (Math.round(27.5) + 10)
    expect(computeSkillScore(50, 'claimed', 10)).toBe(38);
    
    // (100 * 0.35) + 5 = 35 + 5 = 40
    expect(computeSkillScore(100, 'mentioned', 5)).toBe(40);
  });

  it('should cap the base score + cert bonus at 100', () => {
    // (100 * 1.00) + 10 = 110 => 100
    expect(computeSkillScore(100, 'demonstrated_strong', 10)).toBe(100);
  });

  it('should handle unknown evidence type gracefully by applying 0 multiplier', () => {
    expect(computeSkillScore(100, 'unknown_type')).toBe(0);
    expect(computeSkillScore(100, 'unknown_type', 15)).toBe(15);
  });
});

describe('computeMatchPercentage', () => {
  it('should calculate match percentage correctly for perfect match', () => {
    const scoredSkills = [
      { tier: 'core', userScore: 100, targetProficiency: 100 },
      { tier: 'supporting', userScore: 100, targetProficiency: 100 },
      { tier: 'contextual', userScore: 100, targetProficiency: 100 },
    ];
    // core: 1.0 * 0.6 = 0.6
    // supporting: 1.0 * 0.3 = 0.3
    // contextual: 1.0 * 0.1 = 0.1
    // Total = 1.0 => 100%
    expect(computeMatchPercentage(scoredSkills)).toBe(100);
  });

  it('should calculate match percentage correctly for partial match', () => {
    const scoredSkills = [
      { tier: 'core', userScore: 80, targetProficiency: 100 }, // 0.8
      { tier: 'supporting', userScore: 50, targetProficiency: 100 }, // 0.5
      { tier: 'contextual', userScore: 0, targetProficiency: 100 }, // 0.0
    ];
    // core: 0.8 * 0.6 = 0.48
    // supporting: 0.5 * 0.3 = 0.15
    // contextual: 0.0 * 0.1 = 0.0
    // Total = 0.63 => 63%
    expect(computeMatchPercentage(scoredSkills)).toBe(63);
  });

  it('should apply critical gap penalty if a core skill is below 65% of target', () => {
    const scoredSkills = [
      { tier: 'core', userScore: 60, targetProficiency: 100 }, // 0.60 (< 0.65) -> Gap!
      { tier: 'supporting', userScore: 100, targetProficiency: 100 }, // 1.0
      { tier: 'contextual', userScore: 100, targetProficiency: 100 }, // 1.0
    ];
    // core: 0.6 * 0.6 = 0.36
    // supporting: 1.0 * 0.3 = 0.3
    // contextual: 1.0 * 0.1 = 0.1
    // Total weight = 1.0
    // Base score = 0.76 (76%)
    // Penalty multiplier: 1 - 0.08 = 0.92
    // Final score = 0.76 * 0.92 = 0.6992 => 70%
    expect(computeMatchPercentage(scoredSkills)).toBe(70);
  });

  it('should apply multiple critical gap penalties up to a max penalty of 25%', () => {
    const scoredSkills = [
      { tier: 'core', userScore: 10, targetProficiency: 100 }, // Gap 1
      { tier: 'core', userScore: 10, targetProficiency: 100 }, // Gap 2
      { tier: 'core', userScore: 10, targetProficiency: 100 }, // Gap 3
      { tier: 'core', userScore: 10, targetProficiency: 100 }, // Gap 4 -> 4 * 0.08 = 0.32 penalty (capped at 0.25)
      { tier: 'supporting', userScore: 100, targetProficiency: 100 },
      { tier: 'contextual', userScore: 100, targetProficiency: 100 },
    ];
    // core avg = 0.1
    // supp avg = 1.0
    // ctx avg = 1.0
    // Base weighted score = (0.1 * 0.6) + (1.0 * 0.3) + (1.0 * 0.1) = 0.46
    // Penalty multiplier = 1 - 0.25 = 0.75
    // Final = 0.46 * 0.75 = 0.345 => 35%
    expect(computeMatchPercentage(scoredSkills)).toBe(35);
  });

  it('should allow match percentage to exceed 100% for overqualified candidates', () => {
    const scoredSkills = [
      { tier: 'core', userScore: 150, targetProficiency: 100 }, // Ratio = 1.5
    ];
    // Core = 1.5 * 0.6 = 0.9
    // Supp = empty => weight 0
    // Ctx = empty => weight 0
    // Total weight = 0.6
    // Normalized score = 0.9 / 0.6 = 1.5 => 150%
    expect(computeMatchPercentage(scoredSkills)).toBe(150);
  });

  it('should not inflate score for missing tiers (missing tiers are excluded from weight)', () => {
    const scoredSkills = [
      { tier: 'core', userScore: 80, targetProficiency: 100 },
    ];
    // core: 0.8 * 0.6 = 0.48
    // supporting: empty => weight 0
    // contextual: empty => weight 0
    // Base score: (0.8 * 0.6) / 0.6 = 0.8
    // No gaps (0.8 >= 0.65)
    // Final = 80%
    expect(computeMatchPercentage(scoredSkills)).toBe(80);
  });

  it('should not return a negative match percentage', () => {
    const scoredSkills = [
      { tier: 'core', userScore: 0, targetProficiency: 100 }, // Ratio 0 => Gap
      { tier: 'core', userScore: 0, targetProficiency: 100 }, // Ratio 0 => Gap
      { tier: 'core', userScore: 0, targetProficiency: 100 }, // Ratio 0 => Gap
      { tier: 'supporting', userScore: 0, targetProficiency: 100 }, 
      { tier: 'contextual', userScore: 0, targetProficiency: 100 }, 
    ];
    // Base score = 0
    // Penalty = min(25%, 3 * 8%) = 24%
    // 0 - 0.24 = -0.24 => should be capped at 0 via Math.max(0, ...)
    expect(computeMatchPercentage(scoredSkills)).toBe(0);
  });
});
