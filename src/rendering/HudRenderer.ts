import { Snake } from '../entities/Snake';
import { CANVAS_WIDTH, CELL_SIZE, HUD_ROWS, COLOR_HUD_BG, COLOR_WALL, COLOR_FOOD_SAFE } from '../constants';

export class HudRenderer {
  static readonly SOUND_ICON_RECT = { x: 4, y: 4, w: 22, h: 22 };

  render(
    ctx: CanvasRenderingContext2D,
    _snake: Snake,
    score: number,
    round: number,
    targetScore: number,
    highScore = 0,
    muted = false,
  ) {
    const width = CANVAS_WIDTH;
    const height = HUD_ROWS * CELL_SIZE;

    ctx.fillStyle = COLOR_HUD_BG;
    ctx.fillRect(0, 0, width, height);

    // Sound icon (top-left)
    this.renderSoundIcon(ctx, muted);

    // Line 1: ROUND n (left-center) + BEST: n (right)
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLOR_WALL;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ROUND ${round}`, width / 2, 18);

    if (highScore > 0) {
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`BEST:${highScore}`, width - 6, 18);
    }

    // Line 2: Score / Target (centered)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    const scoreStr = `${score}`;
    const scoreW = ctx.measureText(scoreStr).width;
    ctx.font = '12px monospace';
    const targetStr = ` / ${targetScore}`;
    const targetW = ctx.measureText(targetStr).width;
    const totalW = scoreW + targetW;
    const startX = (width - totalW) / 2;

    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(scoreStr, startX, 44);
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.fillText(targetStr, startX + scoreW, 44);

    // Line 3: Full-width progress bar
    const barX = 10;
    const barY = 68;
    const barW = width - 20;
    const barH = 7;
    const fillRatio = Math.min(score / targetScore, 1);

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    if (fillRatio > 0) {
      const barColor = fillRatio >= 1 ? '#4ecca3' : '#00d2ff';
      ctx.shadowColor = barColor;
      ctx.shadowBlur = 6;
      ctx.fillStyle = barColor;
      ctx.beginPath();
      ctx.roundRect(barX, barY, Math.max(barH, barW * fillRatio), barH, 3);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  }

  private renderSoundIcon(ctx: CanvasRenderingContext2D, muted: boolean) {
    const cx = 15;
    const cy = 15;

    ctx.save();
    ctx.globalAlpha = muted ? 0.4 : 1;

    // Speaker body
    const color = muted ? '#555' : '#aaa';
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    // Speaker cone (trapezoid + rectangle)
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 2);
    ctx.lineTo(cx - 5, cy + 2);
    ctx.lineTo(cx - 2, cy + 2);
    ctx.lineTo(cx + 2, cy + 5);
    ctx.lineTo(cx + 2, cy - 5);
    ctx.lineTo(cx - 2, cy - 2);
    ctx.closePath();
    ctx.fill();

    if (muted) {
      // X mark
      ctx.beginPath();
      ctx.moveTo(cx + 5, cy - 3);
      ctx.lineTo(cx + 10, cy + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 3);
      ctx.lineTo(cx + 5, cy + 3);
      ctx.stroke();
    } else {
      // Sound waves (arcs)
      ctx.beginPath();
      ctx.arc(cx + 2, cy, 5, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 2, cy, 9, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
    }

    ctx.restore();
  }
}
