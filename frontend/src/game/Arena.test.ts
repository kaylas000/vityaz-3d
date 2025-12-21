import { describe, it, expect } from 'vitest';
import Arena, { TerrainType } from './Arena';

describe('Arena.generateArena', () => {
  it('creates a grid with specified width and height', () => {
    const grid = new Arena({} as any, 10, 12).grid;
    expect(grid.length).toBe(12);
    expect(grid[0].length).toBe(10);
  });

  it('tiles have required properties', () => {
    const arena = new Arena({} as any, 8, 8);
    const t = arena.getTile(1, 1);
    expect(t).toBeTruthy();
    expect(t?.terrain).toMatch(/plain|water|rock|obstacle/ as unknown as RegExp);
    expect(typeof t?.traversable).toBe('boolean');
  });

  it('generateSpawnPointsIndices returns expected indices', () => {
    const inds = Arena.generateSpawnPointsIndices(50, 50);
    expect(Array.isArray(inds)).toBe(true);
    expect(inds.length).toBeGreaterThanOrEqual(4);
    // corners
    expect(inds[0]).toEqual([1, 1]);
    expect(inds[1]).toEqual([48, 1]);
  });

  it('getSpawnPoint maps indices to coordinates', () => {
    const arena = new Arena({} as any, 50, 50);
    const p0 = arena.getSpawnPoint(0);
    const p1 = arena.getSpawnPoint(1);
    expect(p0.x).not.toBeNaN();
    expect(p1.z).not.toBeNaN();
    expect(p0.equals(p1)).toBe(false);
  });
});