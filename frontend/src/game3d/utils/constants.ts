/**
 * Game Configuration and Constants
 */

export const GAME_CONFIG = {
  // Canvas
  CANVAS_WIDTH: typeof window !== 'undefined' ? window.innerWidth : 800,
  CANVAS_HEIGHT: typeof window !== 'undefined' ? window.innerHeight : 600,

  // Physics
  GRAVITY: -9.81,

  // Player
  PLAYER_SPEED: 200,
  PLAYER_HEALTH: 100,
  PLAYER_START_POS: { x: 0, y: 1, z: 0 },
  PLAYER_MODEL_SCALE: 1.0, // Scale factor for loaded 3D model

  // Enemy
  ENEMY_BASIC_SPEED: 100,
  ENEMY_BASIC_HEALTH: 20,
  ENEMY_BASIC_DAMAGE: 10,
  ENEMY_TANK_SPEED: 80,
  ENEMY_TANK_HEALTH: 40,
  ENEMY_TANK_DAMAGE: 15,
  ENEMY_SPAWN_DISTANCE: 20,
  ENEMY_ATTACK_COOLDOWN: 1000, // 1 sec between attacks
  ENEMY_MODEL_SCALE: 1.0, // Scale factor for loaded 3D model

  // Projectile
  PROJECTILE_SPEED: 100,
  PROJECTILE_DAMAGE: 20,
  PROJECTILE_LIFETIME: 5000, // ms

  // Game
  SHOOT_COOLDOWN: 200, // ms
  INITIAL_ENEMIES_PER_WAVE: 3,
  WAVE_DIFFICULTY_MULTIPLIER: 1.5,

  // Collision
  COLLISION_DISTANCE: 1.0, // FIXED: optimized for entity sizes
}

export const COLORS = {
  PLAYER: { r: 0, g: 1, b: 0 },      // Green
  ENEMY_BASIC: { r: 1, g: 0, b: 0 }, // Red
  ENEMY_TANK: { r: 0.3, g: 0.3, b: 0.3 }, // Gray
  PROJECTILE: { r: 1, g: 1, b: 0 },  // Yellow
  SKY: { r: 0.5, g: 0.7, b: 1 },     // Light Blue
  GROUND: { r: 0.2, g: 0.5, b: 0.2 }, // Dark Green
}

export const INPUTS = {
  FORWARD: 'W',
  BACKWARD: 'S',
  LEFT: 'A',
  RIGHT: 'D',
  JUMP: ' ',
  SHOOT: 'CLICK',
}
