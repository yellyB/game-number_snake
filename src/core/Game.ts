import { GameState } from '../types';
import { Snake } from '../entities/Snake';
import { FoodManager } from '../entities/Food';
import { FoodSpawner } from '../entities/FoodSpawner';
import { CollisionSystem, wrapPos } from '../systems/CollisionSystem';
import { MergeSystem } from '../systems/MergeSystem';
import { DecaySystem } from '../systems/DecaySystem';
import { InputManager } from './InputManager';
import { GameLoop } from './GameLoop';
import { Renderer } from '../rendering/Renderer';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, SNAKE_TICK_MS,
  CELL_SIZE, MAX_FOOD_VALUE,
  ROUND_1_TARGET_SCORE, ROUND_SCORE_MULTIPLIER,
  ROUND_SPEED_DECREASE, MIN_TICK_MS,
  GRID_COLS, HUD_ROWS,
} from '../constants';

// HUD button bounds
const BTN_W = 100;
const BTN_H = 36;
const BTN_X = GRID_COLS * CELL_SIZE - BTN_W - 10;
const BTN_Y = (HUD_ROWS * CELL_SIZE - BTN_H) / 2;

export class Game {
  private ctx: CanvasRenderingContext2D;
  private snake = new Snake();
  private food = new FoodManager();
  private foodSpawner = new FoodSpawner();
  private collision = new CollisionSystem();
  private mergeSystem = new MergeSystem();
  // @ts-ignore reserved for hard mode
  private decaySystem = new DecaySystem();
  private input: InputManager;
  private loop: GameLoop;
  private renderer = new Renderer();

  private state: GameState = 'ready';
  score = 0;
  round = 1;
  maxFoodValue = MAX_FOOD_VALUE;

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;

    this.input = new InputManager(canvas);
    this.loop = new GameLoop(SNAKE_TICK_MS, () => this.tick(), (dt) => this.render(dt));

    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        if (this.state === 'playing') {
          this.spawnMergeItem();
        } else {
          this.handleAction();
        }
      }
      if (e.key === 'Enter' && this.advanceReady && this.state === 'playing') this.advanceRound();
    });
    canvas.addEventListener('touchstart', (e) => {
      if (this.state === 'ready' || this.state === 'game_over') {
        this.handleAction();
        return;
      }
      // Check HUD button tap
      if (this.advanceReady && this.state === 'playing') {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const tx = (touch.clientX - rect.left) * scaleX;
        const ty = (touch.clientY - rect.top) * scaleY;
        if (tx >= BTN_X && tx <= BTN_X + BTN_W && ty >= BTN_Y && ty <= BTN_Y + BTN_H) {
          e.preventDefault();
          this.advanceRound();
        }
      }
    }, { passive: false });
    canvas.addEventListener('click', (e) => {
      if (this.advanceReady && this.state === 'playing') {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        if (cx >= BTN_X && cx <= BTN_X + BTN_W && cy >= BTN_Y && cy <= BTN_Y + BTN_H) {
          this.advanceRound();
        }
      }
    });

    this.initGame();
    this.loop.start();
  }

  get targetScore(): number {
    return Math.floor(ROUND_1_TARGET_SCORE * Math.pow(ROUND_SCORE_MULTIPLIER, this.round - 1));
  }

  get advanceReady(): boolean {
    return this.score >= this.targetScore;
  }

  get tickMs(): number {
    return Math.max(MIN_TICK_MS, SNAKE_TICK_MS - (this.round - 1) * ROUND_SPEED_DECREASE);
  }

  private handleAction() {
    if (this.state === 'ready') {
      this.state = 'playing';
    } else if (this.state === 'game_over') {
      this.initGame();
      this.state = 'playing';
    }
  }

  // DEBUG: spawn merge item on space
  private spawnMergeItem() {
    this.foodSpawner.spawnMerge(this.food, this.snake);
  }

  private initGame() {
    this.snake.reset();
    this.food.clear();
    this.round = 1;
    this.maxFoodValue = MAX_FOOD_VALUE;
    this.foodSpawner.spawn(this.food, this.snake, this.maxFoodValue);
    this.score = 0;
    this.mergeSystem = new MergeSystem();
    this.loop.setTickMs(this.tickMs);
    this.state = 'ready';
  }

  private advanceRound() {
    this.round++;
    this.maxFoodValue++;
    this.loop.setTickMs(this.tickMs);
    this.food.clear();
    this.foodSpawner.spawn(this.food, this.snake, this.maxFoodValue);
    this.state = 'ready';
  }

  private tick() {
    if (this.state !== 'playing') return;

    const dir = this.input.consumeDirection();
    this.snake.direction = dir;

    const result = this.collision.check(this.snake, this.food);

    if (result.self) {
      this.state = 'game_over';
      this.snake.alive = false;
      return;
    }

    if (result.food && result.foodDangerous) {
      this.state = 'game_over';
      this.snake.alive = false;
      return;
    }

    if (result.food) {
      const eaten = this.food.removeAt(result.food.pos)!;

      if (eaten.type === 'removal') {
        this.snake.move();
        this.wrapHead();
        if (this.snake.segments.length > 1) {
          this.snake.segments.pop();
        }
      } else if (eaten.type === 'merge') {
        this.snake.move();
        this.wrapHead();
        if (this.mergeSystem.startMergeScan(this.snake)) {
          this.state = 'merging';
        }
      } else {
        this.snake.eat(eaten.value);
        this.wrapHead();
      }

      this.foodSpawner.spawnSingle(this.food, this.snake, this.maxFoodValue);
    } else {
      this.snake.move();
      this.wrapHead();
    }
  }

  private wrapHead() {
    const h = this.snake.head;
    const wrapped = wrapPos(h.pos);
    h.pos.x = wrapped.x;
    h.pos.y = wrapped.y;
  }

  private render(dt: number) {
    const now = performance.now();

    if (this.state === 'merging') {
      const stillMerging = this.mergeSystem.update(this.snake, now);
      if (!stillMerging) {
        const merges = this.mergeSystem.consumeCompletedMerges();
        for (const m of merges) {
          this.renderer.mergeAnimator.spawnBurst(
            m.pos.x * CELL_SIZE,
            m.pos.y * CELL_SIZE,
            m.resultValue,
          );
        }

        this.score += this.mergeSystem.consumeScore();
        this.state = 'playing';
      }
    }

    this.renderer.render(
      this.ctx,
      this.snake,
      this.food,
      this.mergeSystem,
      this.score,
      this.round,
      this.targetScore,
      this.advanceReady,
      this.state,
      dt,
    );
  }
}
