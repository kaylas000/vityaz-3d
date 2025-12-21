import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyAI, AIManager, AIState } from '../game3d/EnemyAI';

describe('EnemyAI', () => {
  let enemy: EnemyAI;

  beforeEach(() => {
    enemy = new EnemyAI();
    enemy.position = { x: 0, y: 0 };
    enemy.health = 100;
    enemy.stamina = 100;
  });

  it('should initialize with default values', () => {
    expect(enemy.health).toBe(100);
    expect(enemy.stamina).toBe(100);
    expect(enemy.aiState).toBe(AIState.IDLE);
    expect(enemy.aggressionLevel).toBe(0.6);
  });

  it('should attack when player is within 2 tiles', () => {
    const playerPos = { x: 1, y: 0 }; // distance = 1
    const action = enemy.calculateNextAction(playerPos);
    expect(action.type).toBe('ATTACK');
    expect(enemy.aiState).toBe(AIState.ATTACK);
  });

  it('should hunt when player is 2-5 tiles away', () => {
    const playerPos = { x: 3, y: 0 }; // distance = 3
    const action = enemy.calculateNextAction(playerPos);
    expect(action.type).toBe('HUNT');
    expect(enemy.aiState).toBe(AIState.HUNT);
  });

  it('should patrol when player is more than 5 tiles away', () => {
    const playerPos = { x: 10, y: 0 }; // distance = 10
    const action = enemy.calculateNextAction(playerPos);
    expect(action.type).toBe('PATROL');
    expect(enemy.aiState).toBe(AIState.PATROL);
  });

  it('should retreat or defend when health is low', () => {
    enemy.health = 25;
    const playerPos = { x: 0, y: 0 };
    const action = enemy.calculateNextAction(playerPos);
    expect(['RETREAT', 'DEFEND']).toContain(action.type);
  });

  it('should defend when stamina is low', () => {
    enemy.stamina = 15;
    const playerPos = { x: 2, y: 0 };
    const action = enemy.calculateNextAction(playerPos);
    expect(action.type).toBe('DEFEND');
  });
});

describe('AIManager', () => {
  let manager: AIManager;
  let enemy1: EnemyAI;
  let enemy2: EnemyAI;

  beforeEach(() => {
    enemy1 = new EnemyAI();
    enemy1.position = { x: 0, y: 0 };
    enemy2 = new EnemyAI();
    enemy2.position = { x: 5, y: 5 };
    manager = new AIManager([enemy1, enemy2]);
  });

  it('should manage multiple enemies', () => {
    expect(manager.enemies.length).toBe(2);
  });

  it('should update all enemies and return their actions', () => {
    const playerPos = { x: 1, y: 0 };
    const actions = manager.update(playerPos);
    expect(actions.length).toBe(2);
    expect(actions[0].type).toBe('ATTACK'); // close to player
    expect(actions[1].type).toBe('PATROL'); // far from player
  });

  it('should add enemies', () => {
    const enemy3 = new EnemyAI();
    manager.addEnemy(enemy3);
    expect(manager.enemies.length).toBe(3);
  });

  it('should remove enemies by id', () => {
    enemy1.id = 'enemy-1';
    manager.removeEnemy('enemy-1');
    expect(manager.enemies.length).toBe(1);
    expect(manager.enemies[0]).toBe(enemy2);
  });
});
