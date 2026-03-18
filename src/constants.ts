// Grid — portrait layout for mobile
export const CELL_SIZE = 30;
export const GRID_COLS = 13;
export const GRID_ROWS = 22;
export const HUD_ROWS = 3;
export const PLAY_ROWS = GRID_ROWS - HUD_ROWS; // 19
export const PLAY_Y_OFFSET = HUD_ROWS; // play area starts at row 3
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE; // 390
export const GRID_HEIGHT = GRID_ROWS * CELL_SIZE; // 660

// D-pad area below grid
export const DPAD_AREA_Y = GRID_HEIGHT;
export const DPAD_AREA_HEIGHT = 150;
export const CANVAS_HEIGHT = DPAD_AREA_Y + DPAD_AREA_HEIGHT; // 810
export const DPAD_BTN_SIZE = 70;

// Timing
export const SNAKE_TICK_MS = 400;
export const MERGE_GLOW_MS = 150;
export const MERGE_SHRINK_MS = 150;
export const MERGE_DELAY_MS = MERGE_GLOW_MS + MERGE_SHRINK_MS; // 300 total per step

// Gameplay
export const DECAY_DISTANCE = 16;
export const INITIAL_LIVES = 1;
export const FOOD_COUNT_MAX = 15;
export const FOOD_INITIAL_COUNT = 3;
export const FOOD_SPAWN_INTERVAL_MS = 2000; // time between each food spawn

// Scoring
export const MERGE_BASE_SCORE = 10;
export const CHAIN_MULTIPLIER = 2; // each chain step multiplies score

// Round progression
export const ROUND_1_TARGET_SCORE = 600;
export const ROUND_SCORE_MULTIPLIER = 1.8;
export const ROUND_SPEED_DECREASE = 30; // ms faster per round
export const MIN_TICK_MS = 150;
export const ROUND_CLEAR_POP_MS = 100; // ms between each segment pop
export const ROUND_CLEAR_BONUS_BASE = 50; // bonus = round * this

// Colors
export const COLOR_BG = '#1a1a2e';
export const COLOR_GRID = '#16213e';
export const COLOR_GRID_LINE = '#0f3460';
export const COLOR_SNAKE_HEAD = '#e94560';
export const COLOR_SNAKE_BODY = '#533483';
export const COLOR_FOOD_SAFE = '#4ecca3';
export const COLOR_FOOD_DANGER = '#e23e57';
export const COLOR_FOOD_MERGEABLE = '#ffd369';
export const COLOR_WALL = '#00d2ff';
export const COLOR_HUD_BG = '#0f0f23';
export const COLOR_TEXT = '#eee';
export const COLOR_MERGE_GLOW = '#ffd700';

// Food spawn
export const MAX_FOOD_VALUE = 3; // only 1~3 spawn; higher values come from merging
// Category weights (must sum to 1.0)
export const FOOD_CHANCE_MEANINGFUL = 0.60;
export const FOOD_CHANCE_EDIBLE = 0.25;
export const FOOD_CHANCE_DANGEROUS = 0.10;
export const FOOD_CHANCE_SPECIAL = 0.05;

// Special items
export const COLOR_FOOD_REMOVAL = '#b388ff';
export const COLOR_FOOD_MERGE = '#ffd700';
