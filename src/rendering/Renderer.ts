import { GridRenderer } from './GridRenderer';
import { SnakeRenderer } from './SnakeRenderer';
import { FoodRenderer } from './FoodRenderer';
import { WallRenderer } from './WallRenderer';
import { MergeAnimator } from './MergeAnimator';
import { HudRenderer } from './HudRenderer';
import { Snake } from '../entities/Snake';
import { FoodManager } from '../entities/Food';
import { MergeSystem } from '../systems/MergeSystem';
import { GameState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_BG } from '../constants';

export class Renderer {
  private grid = new GridRenderer();
  private snakeRenderer = new SnakeRenderer();
  private foodRenderer = new FoodRenderer();
  private wallRenderer = new WallRenderer();
  mergeAnimator = new MergeAnimator();
  private hudRenderer = new HudRenderer();

  render(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    food: FoodManager,
    mergeSystem: MergeSystem,
    score: number,
    round: number,
    targetScore: number,
    advanceReady: boolean,
    state: GameState,
    _dt: number,
    roundClearBonus = 0,
  ) {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.hudRenderer.render(ctx, snake, score, round, targetScore, advanceReady);
    this.grid.render(ctx);
    this.wallRenderer.render(ctx);
    this.foodRenderer.render(ctx, food, snake);
    this.snakeRenderer.render(ctx, snake, mergeSystem);

    this.mergeAnimator.update(1 / 60);
    this.mergeAnimator.render(ctx);

    if (state === 'game_over') {
      this.renderOverlay(ctx, 'GAME OVER', `Score: ${score} — Press SPACE or tap`, '#e94560');
    } else if (state === 'round_clear') {
      this.renderRoundClear(ctx, round, roundClearBonus);
    } else if (state === 'ready') {
      this.renderOverlay(ctx, `ROUND ${round}`, 'Press SPACE or tap to start', '#00d2ff');
    }
  }

  private renderRoundClear(ctx: CanvasRenderingContext2D, round: number, bonus: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#4ecca3';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ROUND ${round} CLEAR!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    if (bonus > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`+${bonus} BONUS`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    }
  }

  private renderOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string, color: string) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = color;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  }
}
