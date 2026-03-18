import { Snake } from '../entities/Snake';
import { CELL_SIZE, GRID_COLS, HUD_ROWS, PLAY_Y_OFFSET, PLAY_ROWS, COLOR_HUD_BG, COLOR_SNAKE_HEAD } from '../constants';
import { getValueColor } from '../utils/colors';

export class HudRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    score: number,
    round: number,
    targetScore: number,
  ) {
    const width = GRID_COLS * CELL_SIZE;
    const height = HUD_ROWS * CELL_SIZE;

    ctx.fillStyle = COLOR_HUD_BG;
    ctx.fillRect(0, 0, width, height);

    // Line 1: ROUND n (centered)
    const line1Y = 22;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`ROUND ${round}`, width / 2, line1Y);

    // Line 2: Score / Target (centered)
    const line2Y = 52;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    const scoreStr = `${score}`;
    const targetStr = ` / ${targetScore}`;
    const fullW = ctx.measureText(scoreStr).width;
    ctx.font = '13px monospace';
    const targetW = ctx.measureText(targetStr).width;
    const totalTextW = fullW + targetW;
    const startX = (width - totalTextW) / 2;

    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(scoreStr, startX, line2Y);
    ctx.fillStyle = '#666';
    ctx.font = '13px monospace';
    ctx.fillText(targetStr, startX + fullW, line2Y);

    // Line 3: Full-width progress bar
    const barX = 10;
    const barY = 76;
    const barW = width - 20;
    const barH = 8;
    const fillRatio = Math.min(score / targetScore, 1);

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    if (fillRatio > 0) {
      const barColor = fillRatio >= 1 ? '#4ecca3' : '#00d2ff';
      ctx.shadowColor = barColor;
      ctx.shadowBlur = 6;
      ctx.fillStyle = barColor;
      ctx.beginPath();
      ctx.roundRect(barX, barY, Math.max(barH, barW * fillRatio), barH, 4);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // Segment info — vertical list on right side of play area
    this.renderSegmentList(ctx, snake);
  }

  private renderSegmentList(ctx: CanvasRenderingContext2D, snake: Snake) {
    const width = GRID_COLS * CELL_SIZE;
    const playTop = PLAY_Y_OFFSET * CELL_SIZE;
    const segs = snake.segments;

    // Build run-length groups
    const groups: { value: number; count: number }[] = [];
    for (const seg of segs) {
      if (groups.length > 0 && groups[groups.length - 1].value === seg.value) {
        groups[groups.length - 1].count++;
      } else {
        groups.push({ value: seg.value, count: 1 });
      }
    }

    const boxSize = 18;
    const rowH = 24;
    const maxGroups = Math.min(groups.length, Math.floor(PLAY_ROWS * CELL_SIZE / rowH));
    const rightX = width - 6;

    for (let i = 0; i < maxGroups; i++) {
      const g = groups[i];
      const cy = playTop + 14 + i * rowH;

      // xN count label (right-aligned)
      ctx.fillStyle = '#666';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const countStr = `x${g.count}`;
      const countW = ctx.measureText(countStr).width;
      ctx.fillText(countStr, rightX, cy);

      // Colored box
      const bx = rightX - countW - boxSize - 2;
      const by = cy - boxSize / 2;
      const isHead = i === 0;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = isHead ? COLOR_SNAKE_HEAD : getValueColor(g.value);
      ctx.beginPath();
      ctx.roundRect(bx, by, boxSize, boxSize, 3);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Value number in box
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(g.value), bx + boxSize / 2, cy);
    }
  }
}
