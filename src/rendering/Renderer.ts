import { GridRenderer } from './GridRenderer';
import { SnakeRenderer } from './SnakeRenderer';
import { FoodRenderer } from './FoodRenderer';
import { FenceRenderer } from './FenceRenderer';
import { MergeAnimator } from './MergeAnimator';
import { HudRenderer } from './HudRenderer';
import { Snake } from '../entities/Snake';
import { FoodManager } from '../entities/Food';
import { MergeSystem } from '../systems/MergeSystem';
import { RoundSystem } from '../systems/RoundSystem';
import { GameState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, PLAY_Y_OFFSET, PLAY_ROWS, COLOR_BG } from '../constants';

export class Renderer {
  private grid = new GridRenderer();
  private snakeRenderer = new SnakeRenderer();
  private foodRenderer = new FoodRenderer();
  private fenceRenderer = new FenceRenderer();
  mergeAnimator = new MergeAnimator();
  private hudRenderer = new HudRenderer();

  render(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    food: FoodManager,
    mergeSystem: MergeSystem,
    roundSystem: RoundSystem,
    lives: number,
    state: GameState,
    _dt: number,
  ) {
    // Clear
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // HUD
    this.hudRenderer.render(ctx, snake, roundSystem, lives);

    // Grid
    this.grid.render(ctx);

    // Fence
    this.fenceRenderer.render(ctx, roundSystem.fenceActive, roundSystem.fenceOpenedAt);

    // Food
    this.foodRenderer.render(ctx, food, snake);

    // Snake
    this.snakeRenderer.render(ctx, snake, mergeSystem);

    // Merge particles
    this.mergeAnimator.update(1 / 60);
    this.mergeAnimator.render(ctx);

    // "EXIT OPEN" banner (fades out over 2s)
    if (roundSystem.fenceOpenedAt > 0) {
      const elapsed = performance.now() - roundSystem.fenceOpenedAt;
      const duration = 2000;
      if (elapsed < duration) {
        const alpha = 1 - elapsed / duration;
        const cy = PLAY_Y_OFFSET * CELL_SIZE + (PLAY_ROWS * CELL_SIZE) / 2;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(CANVAS_WIDTH / 2 - 140, cy - 28, 280, 56);
        ctx.fillStyle = '#4ecca3';
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#4ecca3';
        ctx.shadowBlur = 16;
        ctx.fillText('EXIT OPEN ▶', CANVAS_WIDTH / 2, cy);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }

    // Overlay screens
    if (state === 'game_over') {
      this.renderOverlay(ctx, 'GAME OVER', 'Press SPACE or tap to restart', '#e94560');
    } else if (state === 'round_clear') {
      this.renderOverlay(ctx, `ROUND ${roundSystem.currentRound} CLEAR!`, 'Press SPACE or tap for next round', '#4ecca3');
    } else if (state === 'round_start') {
      const config = roundSystem.getRoundConfig();
      this.renderOverlay(ctx, `ROUND ${config.round}`, `Target: ${config.targetScore} pts — Press SPACE or tap`, '#00d2ff');
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
