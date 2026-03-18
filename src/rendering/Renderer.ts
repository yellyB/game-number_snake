import { GridRenderer } from './GridRenderer';
import { SnakeRenderer } from './SnakeRenderer';
import { FoodRenderer } from './FoodRenderer';
import { WallRenderer } from './WallRenderer';
import { MergeAnimator } from './MergeAnimator';
import { HudRenderer } from './HudRenderer';
import { Snake } from '../entities/Snake';
import { FoodManager } from '../entities/Food';
import { MergeSystem } from '../systems/MergeSystem';
import { Direction, GameState } from '../types';
import { JoystickState, DPAD_RECTS } from '../core/InputManager';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GRID_HEIGHT, COLOR_BG, COLOR_HUD_BG,
  DPAD_BTN_SIZE,
} from '../constants';

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
    state: GameState,
    _dt: number,
    roundClearBonus = 0,
    showTutorial = false,
    joystick?: JoystickState,
    activeDpadDir?: Direction | null,
  ) {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.hudRenderer.render(ctx, snake, score, round, targetScore);
    this.grid.render(ctx);
    this.wallRenderer.render(ctx);
    this.foodRenderer.render(ctx, food, snake);
    this.snakeRenderer.render(ctx, snake, mergeSystem);

    this.mergeAnimator.update(1 / 60);
    this.mergeAnimator.render(ctx);

    // D-pad (always visible)
    this.renderDpad(ctx, activeDpadDir ?? null);

    if (joystick?.active) {
      this.renderJoystick(ctx, joystick);
    }

    if (state === 'game_over') {
      this.renderOverlay(ctx, 'GAME OVER', `Score: ${score} — Tap to restart`, '#e94560');
    } else if (state === 'round_clear') {
      this.renderRoundClear(ctx, round, roundClearBonus);
    } else if (state === 'ready' && showTutorial) {
      this.renderTutorial(ctx);
    } else if (state === 'ready') {
      this.renderOverlay(ctx, `ROUND ${round}`, 'Tap or press SPACE to start', '#00d2ff');
    }
  }

  // ── D-pad ──

  private renderDpad(ctx: CanvasRenderingContext2D, activeDir: Direction | null) {
    // Background
    ctx.fillStyle = COLOR_HUD_BG;
    ctx.fillRect(0, GRID_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - GRID_HEIGHT);

    const s = DPAD_BTN_SIZE;
    const arrows: [Direction, string][] = [
      [Direction.Up, '▲'],
      [Direction.Down, '▼'],
      [Direction.Left, '◀'],
      [Direction.Right, '▶'],
    ];

    for (const [dir, symbol] of arrows) {
      const r = DPAD_RECTS[dir];
      const isActive = dir === activeDir;

      // Button background
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, s, s, 12);
      ctx.fill();

      // Border
      ctx.strokeStyle = isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Arrow symbol
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, r.x + s / 2, r.y + s / 2);
    }
  }

  // ── Tutorial ──

  private renderTutorial(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cx = CANVAS_WIDTH / 2;
    const S = 20;
    const step = S + 2;
    const gap = 6;

    ctx.textBaseline = 'middle';

    // Title
    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HOW TO PLAY', cx, 70);

    const eatCol = cx - 18;

    // ── Row 1: Safe eat — [2][3] eats (1) → [1][2][3] ✓ Grow! ──
    let y = 150;
    let x = eatCol - 2 * step - gap;
    this.tSeg(ctx, x, y, 2, false, S); x += step;
    this.tSeg(ctx, x, y, 3, true, S);
    this.tBite(ctx, x + S, y + S / 2, gap);
    x += step + gap;
    this.tFood(ctx, x, y, 1, '#4ecca3', S);
    ctx.fillStyle = '#4ecca3'; ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('eat!', x + S / 2, y - 5);
    x += step + 16;
    this.tArrow(ctx, x, y + S / 2); x += 24;
    this.tResultBg(ctx, x - 3, y - 3, 3 * step + 6, S + 6, '#4ecca3');
    this.tSeg(ctx, x, y, 1, false, S); x += step;
    this.tSeg(ctx, x, y, 2, false, S); x += step;
    this.tSeg(ctx, x, y, 3, true, S); x += step + 6;
    ctx.fillStyle = '#4ecca3'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText('✓ Grow!', x, y + S / 2);

    // ── Row 2: Danger eat — [1][2][3] eats (5) ✗ Death! ──
    y += 80;
    x = eatCol - 3 * step - gap;
    this.tSeg(ctx, x, y, 1, false, S); x += step;
    this.tSeg(ctx, x, y, 2, false, S); x += step;
    this.tSeg(ctx, x, y, 3, true, S);
    this.tBite(ctx, x + S, y + S / 2, gap);
    x += step + gap;
    this.tFood(ctx, x, y, 5, '#e94560', S);
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('eat!', x + S / 2, y - 5);
    x += step + 16;
    this.tArrow(ctx, x, y + S / 2); x += 24;
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText('✗ Death!', x, y + S / 2);

    // ── Row 3: Merge — [1][1][1] eats M → [1][2] Score! ──
    y += 80;
    x = eatCol - 3 * step - gap;
    this.tSeg(ctx, x, y, 1, false, S); x += step;
    this.tSeg(ctx, x, y, 1, false, S); x += step;
    this.tSeg(ctx, x, y, 1, true, S);
    this.tBite(ctx, x + S, y + S / 2, gap);
    x += step + gap;
    this.tMergeItem(ctx, x, y, S);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('eat!', x + S / 2, y - 5);
    x += step + 16;
    this.tArrow(ctx, x, y + S / 2); x += 24;
    this.tResultBg(ctx, x - 3, y - 3, 2 * step + 6, S + 6, '#ffd700');
    this.tSeg(ctx, x, y, 1, false, S); x += step;
    this.tSeg(ctx, x, y, 2, true, S); x += step + 6;
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText('Score!', x, y + S / 2);

    // ── Row 4: Scissors — [1][2][3] eats ✂ → [2][3] Cut! ──
    y += 80;
    x = eatCol - 3 * step - gap;
    this.tSeg(ctx, x, y, 1, false, S); x += step;
    this.tSeg(ctx, x, y, 2, false, S); x += step;
    this.tSeg(ctx, x, y, 3, true, S);
    this.tBite(ctx, x + S, y + S / 2, gap);
    x += step + gap;
    this.tScissors(ctx, x, y, S);
    ctx.fillStyle = '#b388ff'; ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('eat!', x + S / 2, y - 5);
    x += step + 16;
    this.tArrow(ctx, x, y + S / 2); x += 24;
    this.tResultBg(ctx, x - 3, y - 3, 2 * step + 6, S + 6, '#b388ff');
    this.tSeg(ctx, x, y, 2, false, S); x += step;
    this.tSeg(ctx, x, y, 3, true, S); x += step + 6;
    ctx.fillStyle = '#b388ff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText('Cut!', x, y + S / 2);

    // ── Row 5: Self-collision — [1][2][3] hits [body] → ✗ Death! ──
    y += 80;
    x = eatCol - 3 * step - gap;
    this.tSeg(ctx, x, y, 1, false, S); x += step;
    this.tSeg(ctx, x, y, 2, false, S); x += step;
    this.tSeg(ctx, x, y, 3, true, S);
    this.tBite(ctx, x + S, y + S / 2, gap);
    x += step + gap;
    // Body segment as collision target (drawn as body, not food)
    this.tSeg(ctx, x, y, 2, false, S);
    // X marker on body segment
    ctx.strokeStyle = 'rgba(233,69,96,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 3);
    ctx.lineTo(x + S - 3, y + S - 3);
    ctx.moveTo(x + S - 3, y + 3);
    ctx.lineTo(x + 3, y + S - 3);
    ctx.stroke();
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('hit!', x + S / 2, y - 5);
    x += step + 16;
    this.tArrow(ctx, x, y + S / 2); x += 24;
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText('✗ Death!', x, y + S / 2);

    // ── Tap prompt ──
    const pulse = Math.sin(performance.now() / 400) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    ctx.font = '14px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Tap or press SPACE', cx, 580);
  }

  // ── Tutorial mini drawing helpers ──

  private tBite(ctx: CanvasRenderingContext2D, x: number, cy: number, w: number) {
    const t = (performance.now() % 800) / 800;
    const midX = x + w / 2;
    const sz = 4;
    ctx.globalAlpha = 0.4 + t * 0.4;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(midX - sz, cy - sz);
    ctx.lineTo(midX + sz, cy);
    ctx.lineTo(midX - sz, cy + sz);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private tArrow(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⇒', x + 8, y);
  }

  private tResultBg(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  private tSeg(ctx: CanvasRenderingContext2D, x: number, y: number, value: number, isHead: boolean, s: number) {
    ctx.fillStyle = isHead ? '#e94560' : '#533483';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, s - 2, s - 2, isHead ? 4 : 2);
    ctx.fill();
    if (isHead) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(s * 0.5)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), x + s / 2, y + s / 2);
  }

  private tFood(ctx: CanvasRenderingContext2D, x: number, y: number, value: number, color: string, s: number) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + s / 2, y + s / 2, s * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(s * 0.45)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), x + s / 2, y + s / 2);
  }

  private tMergeItem(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    const mcx = x + s / 2;
    const mcy = y + s / 2;
    const r = s * 0.38;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(mcx, mcy - r);
    ctx.lineTo(mcx + r, mcy);
    ctx.lineTo(mcx, mcy + r);
    ctx.lineTo(mcx - r, mcy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1a1a2e';
    ctx.font = `bold ${Math.floor(s * 0.45)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', mcx, mcy);
  }

  private tScissors(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.fillStyle = '#b388ff';
    ctx.beginPath();
    ctx.arc(x + s / 2, y + s / 2, s * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(s * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✂', x + s / 2, y + s / 2);
  }

  // ── Joystick ──

  private renderJoystick(ctx: CanvasRenderingContext2D, joy: JoystickState) {
    const canvas = ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const jcx = (joy.centerX - rect.left) * scaleX;
    const jcy = (joy.centerY - rect.top) * scaleY;
    const tx = (joy.thumbX - rect.left) * scaleX;
    const ty = (joy.thumbY - rect.top) * scaleY;

    const baseR = 40;
    const thumbR = 18;

    let dx = tx - jcx;
    let dy = ty - jcy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > baseR) {
      dx = dx / dist * baseR;
      dy = dy / dist * baseR;
    }

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(jcx, jcy, baseR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(jcx + dx, jcy + dy, thumbR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  // ── Overlays ──

  private renderRoundClear(ctx: CanvasRenderingContext2D, round: number, bonus: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, GRID_HEIGHT);

    ctx.fillStyle = '#4ecca3';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ROUND ${round} CLEAR!`, CANVAS_WIDTH / 2, GRID_HEIGHT / 2 - 20);

    if (bonus > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`+${bonus} BONUS`, CANVAS_WIDTH / 2, GRID_HEIGHT / 2 + 20);
    }
  }

  private renderOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string, color: string) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, GRID_HEIGHT);

    ctx.fillStyle = color;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, CANVAS_WIDTH / 2, GRID_HEIGHT / 2 - 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ctx.fillText(subtitle, CANVAS_WIDTH / 2, GRID_HEIGHT / 2 + 20);
  }
}
