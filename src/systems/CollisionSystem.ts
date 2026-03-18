import { Snake } from '../entities/Snake';
import { FoodManager } from '../entities/Food';
import { FoodItem } from '../types';
import { Vec2, vec2Eq } from '../utils/Vec2';
import { GRID_COLS, PLAY_ROWS, PLAY_Y_OFFSET } from '../constants';

export interface CollisionResult {
  self: boolean;
  wall: boolean;
  food: FoodItem | null;
  foodDangerous: boolean;
}

/** Check if position is outside play area bounds */
function isOutOfBounds(pos: Vec2): boolean {
  return pos.x < 0 || pos.x >= GRID_COLS ||
    pos.y < PLAY_Y_OFFSET || pos.y >= PLAY_Y_OFFSET + PLAY_ROWS;
}

export class CollisionSystem {
  check(snake: Snake, foodManager: FoodManager): CollisionResult {
    const nextPos = snake.nextHeadPos();
    const result: CollisionResult = {
      self: false,
      wall: false,
      food: null,
      foodDangerous: false,
    };

    if (isOutOfBounds(nextPos)) {
      result.wall = true;
      return result;
    }

    // Food collision
    const food = foodManager.getAt(nextPos);

    // Self collision
    const tailPos = snake.tail.pos;
    const willGrow = food !== undefined && food.type === 'normal';
    const isSelfHit = snake.occupies(nextPos, true);
    if (isSelfHit) {
      const hittingTailOnly = vec2Eq(nextPos, tailPos);
      if (!hittingTailOnly || willGrow) {
        result.self = true;
        return result;
      }
    }
    if (food) {
      result.food = food;
      result.foodDangerous = food.type === 'normal' && food.value > snake.head.value;
    }

    return result;
  }
}
