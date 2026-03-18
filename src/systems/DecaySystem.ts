import { Snake } from '../entities/Snake';
import { DECAY_DISTANCE } from '../constants';

export class DecaySystem {
  /** Returns true if snake should lose a life (head only, nothing left to remove) */
  update(snake: Snake): boolean {
    if (snake.distanceSinceDecay >= DECAY_DISTANCE) {
      snake.distanceSinceDecay = 0;
      if (snake.segments.length > 1) {
        snake.segments.pop();
      } else {
        return true; // head only, can't remove more → lose life
      }
    }
    return false;
  }
}
