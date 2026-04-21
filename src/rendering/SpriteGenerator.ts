import { Direction } from '../types';
import { COLOR_BG } from '../constants';

type SpriteCanvas = HTMLCanvasElement | OffscreenCanvas;

function createCanvas(w: number, h: number): [SpriteCanvas, CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D] {
  if (typeof OffscreenCanvas !== 'undefined') {
    const c = new OffscreenCanvas(w, h);
    return [c, c.getContext('2d')!];
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

export class SpriteGenerator {
  // Snake head sprites per direction
  readonly snakeHead: Record<Direction, SpriteCanvas> = {} as any;
  // Food item sprites
  readonly scissors: SpriteCanvas;
  readonly mergeTrigger: SpriteCanvas;
  // D-pad arrow sprites per direction (white for idle, cyan for active)
  readonly dpadArrow: Record<Direction, SpriteCanvas> = {} as any;
  readonly dpadArrowActive: Record<Direction, SpriteCanvas> = {} as any;
  // Sound icon sprites
  readonly soundOn: SpriteCanvas;
  readonly soundOff: SpriteCanvas;

  constructor() {
    // Snake heads (28×28, 4 directions)
    for (const dir of [Direction.Up, Direction.Right, Direction.Down, Direction.Left]) {
      this.snakeHead[dir] = this.generateSnakeHead(dir);
    }

    this.scissors = this.generateScissors();
    this.mergeTrigger = this.generateMergeTrigger();

    for (const dir of [Direction.Up, Direction.Right, Direction.Down, Direction.Left]) {
      this.dpadArrow[dir] = this.generateDpadArrow(dir, '#ffffff');
      this.dpadArrowActive[dir] = this.generateDpadArrow(dir, '#00d2ff');
    }

    this.soundOn = this.generateSoundIcon(false);
    this.soundOff = this.generateSoundIcon(true);
  }

  private generateSnakeHead(dir: Direction): SpriteCanvas {
    const size = 28;
    const [canvas, ctx] = createCanvas(size, size);

    // Eyes: white 3×3 squares with 1×1 black pupil
    // Eye positions shift based on direction
    const eyeSize = 3;
    const pupilSize = 1;

    // Base eye positions (centered default)
    let leftEyeX: number, leftEyeY: number;
    let rightEyeX: number, rightEyeY: number;
    let leftPupilOffX: number, leftPupilOffY: number;
    let rightPupilOffX: number, rightPupilOffY: number;

    switch (dir) {
      case Direction.Up:
        leftEyeX = 7; leftEyeY = 8;
        rightEyeX = 18; rightEyeY = 8;
        leftPupilOffX = 1; leftPupilOffY = 0;
        rightPupilOffX = 1; rightPupilOffY = 0;
        break;
      case Direction.Down:
        leftEyeX = 7; leftEyeY = 17;
        rightEyeX = 18; rightEyeY = 17;
        leftPupilOffX = 1; leftPupilOffY = 2;
        rightPupilOffX = 1; rightPupilOffY = 2;
        break;
      case Direction.Left:
        leftEyeX = 6; leftEyeY = 8;
        rightEyeX = 6; rightEyeY = 17;
        leftPupilOffX = 0; leftPupilOffY = 1;
        rightPupilOffX = 0; rightPupilOffY = 1;
        break;
      case Direction.Right:
        leftEyeX = 19; leftEyeY = 8;
        rightEyeX = 19; rightEyeY = 17;
        leftPupilOffX = 2; leftPupilOffY = 1;
        rightPupilOffX = 2; rightPupilOffY = 1;
        break;
    }

    // White eye squares
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
    ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);

    // Black pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(leftEyeX + leftPupilOffX, leftEyeY + leftPupilOffY, pupilSize, pupilSize);
    ctx.fillRect(rightEyeX + rightPupilOffX, rightEyeY + rightPupilOffY, pupilSize, pupilSize);

    return canvas;
  }

  private generateScissors(): SpriteCanvas {
    const size = 20;
    const [canvas, ctx] = createCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Pixel art scissors on transparent bg
    ctx.fillStyle = '#ffffff';

    // Top blade (going upper-right from center)
    ctx.fillRect(cx - 1, cy - 6, 2, 3);   // top vertical
    ctx.fillRect(cx + 1, cy - 4, 2, 2);   // angle right
    ctx.fillRect(cx - 3, cy - 4, 2, 2);   // angle left

    // Bottom blade (going lower-right from center)
    ctx.fillRect(cx - 1, cy + 3, 2, 3);   // bottom vertical
    ctx.fillRect(cx + 1, cy + 2, 2, 2);   // angle right
    ctx.fillRect(cx - 3, cy + 2, 2, 2);   // angle left

    // Center pivot
    ctx.fillRect(cx - 1, cy - 1, 2, 2);

    // Handle rings (left side)
    // Top ring
    ctx.fillRect(cx - 7, cy - 5, 4, 1);
    ctx.fillRect(cx - 8, cy - 4, 1, 2);
    ctx.fillRect(cx - 4, cy - 4, 1, 2);
    ctx.fillRect(cx - 7, cy - 2, 4, 1);

    // Bottom ring
    ctx.fillRect(cx - 7, cy + 1, 4, 1);
    ctx.fillRect(cx - 8, cy + 2, 1, 2);
    ctx.fillRect(cx - 4, cy + 2, 1, 2);
    ctx.fillRect(cx - 7, cy + 4, 4, 1);

    return canvas;
  }

  private generateMergeTrigger(): SpriteCanvas {
    const size = 20;
    const [canvas, ctx] = createCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Sparkle/star pattern
    ctx.fillStyle = COLOR_BG;

    // Center cross (star core)
    ctx.fillRect(cx - 1, cy - 4, 2, 8);  // vertical bar
    ctx.fillRect(cx - 4, cy - 1, 8, 2);  // horizontal bar

    // Diagonal accents (small dots at corners for sparkle)
    ctx.fillRect(cx - 3, cy - 3, 1, 1);
    ctx.fillRect(cx + 2, cy - 3, 1, 1);
    ctx.fillRect(cx - 3, cy + 2, 1, 1);
    ctx.fillRect(cx + 2, cy + 2, 1, 1);

    return canvas;
  }

  private generateDpadArrow(dir: Direction, color: string): SpriteCanvas {
    const size = 16;
    const [canvas, ctx] = createCanvas(size, size);

    ctx.fillStyle = color;

    switch (dir) {
      case Direction.Up:
        // Upward pointing arrow
        ctx.fillRect(7, 2, 2, 2);
        ctx.fillRect(5, 4, 6, 2);
        ctx.fillRect(3, 6, 10, 2);
        ctx.fillRect(6, 8, 4, 4);
        break;
      case Direction.Down:
        // Downward pointing arrow
        ctx.fillRect(6, 4, 4, 4);
        ctx.fillRect(3, 8, 10, 2);
        ctx.fillRect(5, 10, 6, 2);
        ctx.fillRect(7, 12, 2, 2);
        break;
      case Direction.Left:
        // Left pointing arrow
        ctx.fillRect(2, 7, 2, 2);
        ctx.fillRect(4, 5, 2, 6);
        ctx.fillRect(6, 3, 2, 10);
        ctx.fillRect(8, 6, 4, 4);
        break;
      case Direction.Right:
        // Right pointing arrow
        ctx.fillRect(4, 6, 4, 4);
        ctx.fillRect(8, 3, 2, 10);
        ctx.fillRect(10, 5, 2, 6);
        ctx.fillRect(12, 7, 2, 2);
        break;
    }

    return canvas;
  }

  private generateSoundIcon(muted: boolean): SpriteCanvas {
    const size = 44;
    const p = 2; // pixel size (2x scale)
    const [canvas, ctx] = createCanvas(size, size);
    const cx = 20;
    const cy = 22;

    ctx.fillStyle = muted ? '#555555' : '#aaaaaa';

    // Speaker body (left side)
    ctx.fillRect(cx - 6 * p, cy - 2 * p, 3 * p, 4 * p);      // rectangle part
    ctx.fillRect(cx - 3 * p, cy - 4 * p, 2 * p, 8 * p);       // cone part

    if (muted) {
      ctx.fillStyle = '#555555';
      ctx.fillRect(cx + 2 * p, cy - 3 * p, p, p);
      ctx.fillRect(cx + 3 * p, cy - 2 * p, p, p);
      ctx.fillRect(cx + 4 * p, cy - 1 * p, p, p);
      ctx.fillRect(cx + 5 * p, cy, p, p);
      ctx.fillRect(cx + 4 * p, cy + 1 * p, p, p);
      ctx.fillRect(cx + 3 * p, cy + 2 * p, p, p);
      ctx.fillRect(cx + 2 * p, cy + 3 * p, p, p);
      // Other diagonal
      ctx.fillRect(cx + 6 * p, cy - 3 * p, p, p);
      ctx.fillRect(cx + 5 * p, cy - 2 * p, p, p);
      ctx.fillRect(cx + 4 * p, cy - 1 * p, p, p);
      ctx.fillRect(cx + 4 * p, cy + 1 * p, p, p);
      ctx.fillRect(cx + 3 * p, cy + 2 * p, p, p);
      ctx.fillRect(cx + 2 * p, cy + 3 * p, p, p);
    } else {
      // Sound waves
      ctx.fillRect(cx + 2 * p, cy - 1 * p, p, 2 * p);
      ctx.fillRect(cx + 4 * p, cy - 2 * p, p, p);
      ctx.fillRect(cx + 4 * p, cy + 2 * p, p, p);
      ctx.fillRect(cx + 5 * p, cy - 1 * p, p, 2 * p);
      ctx.fillRect(cx + 7 * p, cy - 3 * p, p, p);
      ctx.fillRect(cx + 7 * p, cy + 3 * p, p, p);
      ctx.fillRect(cx + 8 * p, cy - 2 * p, p, 4 * p);
    }

    return canvas;
  }
}
