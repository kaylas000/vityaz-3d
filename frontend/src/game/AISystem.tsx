// AI System Index - Exports all AI modules for game integration

export * from './EnemyAI';
export * from './EnemyAIDifficulty';
export * from './Pathfinding';
export * from './CombatPatterns';
export * from './GameLoop';

// AI System initialization
export class AISystemManager {
  private difficultyManager: any;
  private pathfinder: any;
  private tacticsEngine: any;
  private behaviorTree: any;

  constructor() {
    // Initialize all AI subsystems
    // This will be expanded in Phase 6
  }
}
