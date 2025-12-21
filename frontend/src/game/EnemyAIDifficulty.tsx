export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class DifficultyManager {
  currentDifficulty: DifficultyLevel = DifficultyLevel.MEDIUM;
  
  setDifficulty(level: DifficultyLevel) {
    this.currentDifficulty = level;
  }
  
  getDifficulty() {
    return this.currentDifficulty;
  }
}
