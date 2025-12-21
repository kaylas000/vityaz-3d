export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface DifficultyConfig {
  aggressionLevel: number;
  decisionDelayMs: number;
  comboProbability: number;
  retreatThreshold: number;
  targetingAccuracy: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.EASY]: {
    aggressionLevel: 0.3,
    decisionDelayMs: 500,
    comboProbability: 0.1,
    retreatThreshold: 50,
    targetingAccuracy: 0.5,
  },
  [DifficultyLevel.MEDIUM]: {
    aggressionLevel: 0.6,
    decisionDelayMs: 200,
    comboProbability: 0.4,
    retreatThreshold: 35,
    targetingAccuracy: 0.75,
  },
  [DifficultyLevel.HARD]: {
    aggressionLevel: 0.9,
    decisionDelayMs: 50,
    comboProbability: 0.7,
    retreatThreshold: 25,
    targetingAccuracy: 0.95,
  },
};

export class DifficultyManager {
  private currentDifficulty: DifficultyLevel = DifficultyLevel.MEDIUM;

  setDifficulty(level: DifficultyLevel): void {
    this.currentDifficulty = level;
  }

  getDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  getConfig(): DifficultyConfig {
    return DIFFICULTY_CONFIGS[this.currentDifficulty];
  }

  shouldAttemptCombo(): boolean {
    const config = this.getConfig();
    return Math.random() < config.comboProbability;
  }

  getTargetingAccuracy(): number {
    return this.getConfig().targetingAccuracy;
  }

  getDecisionDelay(): number {
    return this.getConfig().decisionDelayMs;
  }

  shouldRetreat(currentHealth: number, maxHealth: number): boolean {
    const config = this.getConfig();
    const healthPercentage = (currentHealth / maxHealth) * 100;
    return healthPercentage < config.retreatThreshold;
  }
}
