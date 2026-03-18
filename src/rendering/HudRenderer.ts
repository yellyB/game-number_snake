import { Snake } from '../entities/Snake';
import { CELL_SIZE, GRID_COLS, HUD_ROWS, COLOR_HUD_BG, COLOR_TEXT } from '../constants';

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
    const barColor = fillRatio >= 1 ? '#4ecca3' : '#00d2ff';
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * fillRatio, barH);

    // Center: Head value + snake length
    ctx.textAlign = 'center';
    ctx.fillStyle = COLOR_TEXT;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`HEAD:${snake.head.value}`, width / 2, y - 8);
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.fillText(`LEN:${snake.segments.length}`, width / 2, y + 10);

    // Right: tail preview
    this.renderTailPreview(ctx, snake, y);
  }

  private renderTailPreview(ctx: CanvasRenderingContext2D, snake: Snake, y: number) {
    const width = GRID_COLS * CELL_SIZE;
    const segs = snake.segments;

    // Build run-length groups from head (index 0) to tail
    const groups: { value: number; count: number }[] = [];
    for (const seg of segs) {
      if (groups.length > 0 && groups[groups.length - 1].value === seg.value) {
        groups[groups.length - 1].count++;
      } else {
        groups.push({ value: seg.value, count: 1 });
      }
    }

    // Draw groups left to right (head first)
    const boxSize = 20;
    const startX = width - 10;
    let x = startX;

    // Measure total width first to right-align
    const groupWidths: number[] = [];
    const maxGroups = Math.min(groups.length, 8);
    for (let i = 0; i < maxGroups; i++) {
      const g = groups[i];
      const countStr = `x${g.count}`;
      ctx.font = 'bold 18px monospace';
      const countW = ctx.measureText(countStr).width;
      groupWidths.push(boxSize + countW + 4);
    }
    const totalW = groupWidths.reduce((a, b) => a + b, 0);
    x = startX - totalW;

    const centerY = y + 4;

    for (let i = 0; i < maxGroups; i++) {
      const g = groups[i];
      const bx = x;
      const by = centerY - boxSize / 2;

      // Box
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#e94560' : '#333';
      ctx.fillRect(bx, by, boxSize, boxSize);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(g.value), bx + boxSize / 2, centerY);

      // xN label
      ctx.fillStyle = '#888';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`x${g.count}`, bx + boxSize + 1, centerY);

      x += groupWidths[i];
    }
  }
}
