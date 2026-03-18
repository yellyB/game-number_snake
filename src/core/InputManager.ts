import { Direction } from '../types';

export interface JoystickState {
  active: boolean;
  centerX: number;
  centerY: number;
  thumbX: number;
  thumbY: number;
}

export class InputManager {
  private bufferedDir: Direction | null = null;
  private currentDir: Direction = Direction.Right;
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 20;

  readonly joystick: JoystickState = {
    active: false,
    centerX: 0,
    centerY: 0,
    thumbX: 0,
    thumbY: 0,
  };

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
  }

  private onKeyDown(e: KeyboardEvent) {
    let dir: Direction | null = null;
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': dir = Direction.Up; break;
      case 'ArrowRight': case 'd': case 'D': dir = Direction.Right; break;
      case 'ArrowDown': case 's': case 'S': dir = Direction.Down; break;
      case 'ArrowLeft': case 'a': case 'A': dir = Direction.Left; break;
    }
    if (dir !== null) {
      e.preventDefault();
      this.tryBuffer(dir);
    }
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
    this.joystick.active = true;
    this.joystick.centerX = t.clientX;
    this.joystick.centerY = t.clientY;
    this.joystick.thumbX = t.clientX;
    this.joystick.thumbY = t.clientY;
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    this.joystick.thumbX = t.clientX;
    this.joystick.thumbY = t.clientY;

    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;
    if (Math.abs(dx) < this.SWIPE_THRESHOLD && Math.abs(dy) < this.SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.tryBuffer(dx > 0 ? Direction.Right : Direction.Left);
    } else {
      this.tryBuffer(dy > 0 ? Direction.Down : Direction.Up);
    }
  }

  private onTouchEnd(e: TouchEvent) {
    e.preventDefault();
    this.joystick.active = false;
  }

  private tryBuffer(dir: Direction) {
    // Prevent 180-degree reversal
    if ((dir + 2) % 4 === this.currentDir) return;
    this.bufferedDir = dir;
  }

  consumeDirection(): Direction {
    if (this.bufferedDir !== null) {
      this.currentDir = this.bufferedDir;
      this.bufferedDir = null;
    }
    return this.currentDir;
  }

  getCurrentDirection(): Direction {
    return this.currentDir;
  }

  setDirection(dir: Direction) {
    this.currentDir = dir;
  }
}
