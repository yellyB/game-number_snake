import { Snake } from '../entities/Snake';
import { CELL_SIZE, GRID_COLS, HUD_ROWS, COLOR_HUD_BG, COLOR_TEXT } from '../constants';

// Button bounds (must match Game.ts)
const BTN_W = 100;
const BTN_H = 36;
const BTN_X = GRID_COLS * CELL_SIZE - BTN_W - 10;
const BTN_Y = (HUD_ROWS * CELL_SIZE - BTN_H) / 2;

export class HudRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    score: number,
    round: number,
    targetScore: number,
    advanceReady: boolean,
  ) {
    const width = GRID_COLS * CELL_SIZE;
    const height = HUD_ROWS * CELL_SIZE;

    ctx.fillStyle = COLOR_HUD_BG;
    ctx.fillRect(0, 0, width, height);

    const y = height / 2;

    // Left: Round + Score
    ctx.textAlign = 'left';
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`R${round}`, 10, y - 12);
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText(`${score}/${targetScore}`, 10, y + 8);

    // Score bar
    const barX = 10;
    const barY = y + 20;
    const barW = 100;
    const barH = 5;
    const fillRatio = Math.min(score / targetScore, 1);
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = advanceReady ? '#4ecca3' : '#00d2ff';
    ctx.fillRect(barX, barY, barW * fillRatio, barH);

    // Center: Head value + snake length
    ctx.textAlign = 'center';
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`HEAD:${snake.head.value}`, width / 2, y - 8);
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.fillText(`LEN:${snake.segments.length}`, width / 2, y + 10);

    // Right: NEXT button or tail preview
    if (advanceReady) {
      this.renderNextButton(ctx);
    } else {
      this.renderTailPreview(ctx, snake, y);
    }
  }

  private renderNextButton(ctx: CanvasRenderingContext2D) {
    const pulse = Math.sin(performance.now() / 300);

    ctx.shadowColor = '#4ecca3';
    ctx.shadowBlur = 8 + pulse * 4;
    ctx.fillStyle = '#4ecca3';
    ctx.beginPath();
    ctx.roundRect(BTN_X, BTN_Y, BTN_W, BTN_H, 6);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEXT ▶', BTN_X + BTN_W / 2, BTN_Y + BTN_H / 2);
  }

  private renderTailPreview(ctx: CanvasRenderingContext2D, snake: Snake, y: number) {
    ctx.textAlign = 'right';
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = '11px monospace';
    const width = GRID_COLS * CELL_SIZE;
    ctx.fillText('TAIL:', width - 140, y - 12);

    const previewStart = width - 130;
    const boxSize = 20;
    const segs = snake.segments;
    const maxPreview = Math.min(segs.length, 6);

    for (let i = 0; i < maxPreview; i++) {
      const seg = segs[segs.length - 1 - i];
      const bx = previewStart + i * (boxSize + 3);
      const by = y - boxSize / 2 + 4;

      const isMatch = i > 0 && segs[segs.length - 1 - i].value === segs[segs.length - i].value;

      ctx.fillStyle = isMatch ? '#ffd369' : '#333';
      ctx.fillRect(bx, by, boxSize, boxSize);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(seg.value), bx + boxSize / 2, by + boxSize / 2 + 1);
    }
  }
}
