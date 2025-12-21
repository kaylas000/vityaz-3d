import { Arena } from './Arena';

export interface PathNode {
  x: number;
  y: number;
  g: number; // cost from start
  h: number; // heuristic to goal
  f: number; // g + h
  parent?: PathNode;
}

export class AStarPathfinder {
  static findPath(arena: Arena, start: { x: number; y: number }, goal: { x: number; y: number }): Array<{ x: number; y: number }> {
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    const startNode: PathNode = { x: start.x, y: start.y, g: 0, h: this.heuristic(start, goal), f: 0 };
    startNode.f = startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
      let current = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      if (current.x === goal.x && current.y === goal.y) {
        return this.reconstructPath(current);
      }

      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.x},${current.y}`);

      const neighbors = this.getNeighbors(current, arena);
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

        const tentativeG = current.g + 1;
        let openNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!openNode) {
          openNode = neighbor;
          openSet.push(openNode);
        } else if (tentativeG >= openNode.g) {
          continue;
        }

        openNode.parent = current;
        openNode.g = tentativeG;
        openNode.h = this.heuristic(openNode, goal);
        openNode.f = openNode.g + openNode.h;
      }
    }

    // No path found, return empty array
    return [];
  }

  private static heuristic(pos: { x: number; y: number }, goal: { x: number; y: number }): number {
    // Manhattan distance
    return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
  }

  private static getNeighbors(node: PathNode, arena: Arena): PathNode[] {
    const neighbors: PathNode[] = [];
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: -1 }, // diagonal up-right
      { x: -1, y: -1 }, // diagonal up-left
      { x: 1, y: 1 },  // diagonal down-right
      { x: -1, y: 1 }, // diagonal down-left
    ];

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;
      
      // Check arena bounds
      if (newX >= 0 && newX < 50 && newY >= 0 && newY < 50) {
        neighbors.push({
          x: newX,
          y: newY,
          g: 0,
          h: 0,
          f: 0,
        });
      }
    }

    return neighbors;
  }

  private static reconstructPath(node: PathNode): Array<{ x: number; y: number }> {
    const path: Array<{ x: number; y: number }> = [];
    let current: PathNode | undefined = node;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return path;
  }
}
