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
    showTutorial = false,
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
    } else if (state === 'ready' && showTutorial) {
      this.renderTutorial(ctx);
    } else if (state === 'ready') {
      this.renderOverlay(ctx, `ROUND ${round}`, 'Press SPACE or tap to start', '#00d2ff');
    }
  }

  private renderTutorial(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    let y = 100;
    const gap = 38;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title
    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('HOW TO PLAY', cx, y);
    y += gap * 1.6;

    // Movement
    ctx.fillStyle = '#eee';
    ctx.font = '15px monospace';
    ctx.fillText('Swipe or Arrow Keys to move', cx, y);
    y += gap * 1.4;

    // Eat rules
    ctx.fillStyle = '#4ecca3';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('Eat  ≤ HEAD  →  Grow!', cx, y);
    y += gap;
    ctx.fillStyle = '#e94560';
    ctx.fillText('Eat  > HEAD  →  Death!', cx, y);
    y += gap * 1.4;

    // Merge
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('◆ M   Merge equal neighbors', cx, y);
    y += gap * 0.8;
    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText('[1][1]→[2]   [2][2]→[3]', cx, y);
    y += gap * 0.7;
    ctx.fillText('Merge = Score!', cx, y);
    y += gap * 1.3;

    // Scissors
    ctx.fillStyle = '#b388ff';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('✂  Cuts your tail', cx, y);
    y += gap * 2;

    // Tap prompt
    const pulse = Math.sin(performance.now() / 400) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    ctx.font = '16px monospace';
    ctx.fillText('Tap or press SPACE', cx, y);
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
