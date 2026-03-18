import { Segment, Direction, DIR_VECTORS } from '../types';
import { Vec2, vec2Add, vec2Eq } from '../utils/Vec2';
import { GRID_COLS, PLAY_ROWS, PLAY_Y_OFFSET } from '../constants';

export class Snake {
  segments: Segment[] = [];
  direction: Direction = Direction.Right;
  alive = true;
  distanceSinceDecay = 0;

  constructor() {
    this.reset();
  }

  reset(round = 1) {
    const startX = 5;
    const startY = PLAY_Y_OFFSET + Math.floor(PLAY_ROWS / 2);
    const base = round; // round 1: head=2,tail=1 / round 2: head=3,tail=2
    this.segments = [
      { pos: { x: startX, y: startY }, value: base + 1 },
      { pos: { x: startX - 1, y: startY }, value: base },
    ];
    this.direction = Direction.Right;
    this.alive = true;
    this.distanceSinceDecay = 0;
  }

  get head(): Segment {
    return this.segments[0];
  }

  get tail(): Segment {
    return this.segments[this.segments.length - 1];
  }

  nextHeadPos(): Vec2 {
    const delta = DIR_VECTORS[this.direction];
    return vec2Add(this.head.pos, delta);
  }

  /** Normal move: shift all positions forward, length unchanged */
  move() {
    for (let i = this.segments.length - 1; i > 0; i--) {
      this.segments[i].pos = { ...this.segments[i - 1].pos };
    }
    this.segments[0].pos = this.nextHeadPos();
    this.distanceSinceDecay++;
  }

  /** Eat food: shift positions, grow by adding food value at old tail position */
  eat(foodValue: number) {
    const oldTailPos = { ...this.segments[this.segments.length - 1].pos };
    for (let i = this.segments.length - 1; i > 0; i--) {
      this.segments[i].pos = { ...this.segments[i - 1].pos };
    }
    this.segments[0].pos = this.nextHeadPos();
    this.segments.push({ pos: oldTailPos, value: foodValue });
    this.distanceSinceDecay++;
  }

  occupies(pos: Vec2, skipHead = false): boolean {
    const start = skipHead ? 1 : 0;
    for (let i = start; i < this.segments.length; i++) {
      if (vec2Eq(this.segments[i].pos, pos)) return true;
    }
    return false;
  }

  isInBounds(pos: Vec2): boolean {
    return pos.x >= 0 && pos.x < GRID_COLS && pos.y >= PLAY_Y_OFFSET && pos.y < PLAY_Y_OFFSET + PLAY_ROWS;
  }
}
