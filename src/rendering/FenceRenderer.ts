import { CELL_SIZE, GRID_COLS, PLAY_ROWS, PLAY_Y_OFFSET, COLOR_FENCE_ACTIVE } from '../constants';

const EXIT_CELLS = 3;
const FLASH_DURATION_MS = 1500;

export class FenceRenderer {
  render(ctx: CanvasRenderingContext2D, active: boolean, fenceOpenedAt: number) {
    const startY = PLAY_Y_OFFSET * CELL_SIZE;
    const width = GRID_COLS * CELL_SIZE;
    const height = PLAY_ROWS * CELL_SIZE;

    if (active) {
      this.renderActive(ctx, startY, width, height);
    } else {
      this.renderInactive(ctx, startY, width, height, fenceOpenedAt);
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  private renderActive(ctx: CanvasRenderingContext2D, startY: number, width: number, height: number) {
    const time = performance.now() / 100;
    ctx.strokeStyle = COLOR_FENCE_ACTIVE;
    ctx.lineWidth = 3;
    ctx.shadowColor = COLOR_FENCE_ACTIVE;
    ctx.shadowBlur = 8 + Math.sin(time) * 5;
    ctx.strokeRect(0.5, startY + 0.5, width - 1, height - 1);
  }

  private renderInactive(ctx: CanvasRenderingContext2D, startY: number, width: number, height: number, fenceOpenedAt: number) {
    const now = performance.now();
    const exitH = CELL_SIZE * EXIT_CELLS;
    const exitY = startY + height / 2 - exitH / 2;

    // Draw border in green, with a gap on the right for the exit
    const green = '#4ecca3';
    ctx.strokeStyle = green;
    ctx.lineWidth = 2;
    ctx.shadowColor = green;
    ctx.shadowBlur = 6;

    // Top edge
    ctx.beginPath();
    ctx.moveTo(0, startY + 0.5);
    ctx.lineTo(width, startY + 0.5);
    ctx.stroke();

    // Bottom edge
    ctx.beginPath();
    ctx.moveTo(0, startY + height - 0.5);
    ctx.lineTo(width, startY + height - 0.5);
    ctx.stroke();

    // Left edge
    ctx.beginPath();
    ctx.moveTo(0.5, startY);
    ctx.lineTo(0.5, startY + height);
    ctx.stroke();

    // Right edge — with gap
    ctx.beginPath();
    ctx.moveTo(width - 0.5, startY);
    ctx.lineTo(width - 0.5, exitY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - 0.5, exitY + exitH);
    ctx.lineTo(width - 0.5, startY + height);
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Glowing exit opening
    const pulse = Math.sin(now / 300);

    // Clear the exit gap area
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(width - 4, exitY + 1, 8, exitH - 2);

    // Bright pulsing exit border lines (top and bottom of gap)
    ctx.shadowColor = green;
    ctx.shadowBlur = 12 + pulse * 8;
    ctx.strokeStyle = green;
    ctx.lineWidth = 3;
    for (const ey of [exitY, exitY + exitH]) {
      ctx.beginPath();
      ctx.moveTo(width - CELL_SIZE, ey);
      ctx.lineTo(width, ey);
      ctx.stroke();
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Scrolling chevrons inside play area pointing to exit
    this.renderChevrons(ctx, exitY, exitH, width, now);

    // Flash overlay when fence just opened
    if (fenceOpenedAt > 0) {
      const elapsed = now - fenceOpenedAt;
      if (elapsed < FLASH_DURATION_MS) {
        const alpha = 0.25 * (1 - elapsed / FLASH_DURATION_MS);
        ctx.fillStyle = `rgba(78, 204, 163, ${alpha})`;
        ctx.fillRect(0, startY, width, height);
      }
    }
  }

  private renderChevrons(ctx: CanvasRenderingContext2D, exitY: number, exitH: number, width: number, now: number) {
    const chevronCount = 3;
    const spacing = 36;
    const baseX = width - chevronCount * spacing - 10;
    const cy = exitY + exitH / 2;
    // Scroll offset loops
    const scroll = (now / 400) % 1;

    ctx.save();
    // Clip to exit row area so chevrons don't bleed
    ctx.beginPath();
    ctx.rect(baseX - 10, exitY + 2, width - baseX + 10, exitH - 4);
    ctx.clip();

    for (let i = 0; i < chevronCount + 1; i++) {
      const x = baseX + (i + scroll) * spacing;
      const alpha = 0.3 + 0.5 * ((i + scroll) / chevronCount);
      ctx.fillStyle = `rgba(78, 204, 163, ${alpha})`;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('›', x, cy);
    }

    ctx.restore();
  }
}
