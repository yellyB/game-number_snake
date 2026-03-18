# Known Issues

## 1. 라이프 잃은 후 음식 겹침

**상태:** 보류 (의도적)

**현상:**
라이프를 잃으면 뱀이 `(5, 9), (4, 9), (3, 9)` 위치로 리셋되지만, 기존 음식은 그대로 남아있다.
만약 리셋 위치에 음식이 있으면 뱀과 음식이 같은 칸에 겹쳐서 렌더링된다.
충돌 체크는 "다음 이동할 위치"만 보기 때문에 겹친 음식은 먹히지 않고 그대로 남는다.

**영향:** 시각적 겹침만 발생. 게임 로직에는 영향 없음.

**수정 방법:**
`src/core/Game.ts`의 `loseLife()`에서 뱀 리셋 후 겹치는 음식을 제거하면 된다.

```typescript
// loseLife() 내부, snake.reset() 이후에 추가
for (const seg of this.snake.segments) {
  this.food.removeAt(seg.pos);
}
```

---

## 2. Decay 시스템 비활성화 상태

**상태:** 기능 구현 완료, 현재 OFF

**현상:**
일정 거리(16칸) 이동 시 꼬리 끝 세그먼트를 제거하는 decay 시스템이 구현되어 있지만, 난이도 조절을 위해 비활성화해둔 상태. 나중에 플레이 모드(하드 모드 등) 선택에 따라 활성화할 예정.

**관련 파일:**
- `src/systems/DecaySystem.ts` — decay 로직 (코드 유지)
- `src/core/Game.ts` — `tick()` 내 decay 호출부 주석 처리됨

**활성화 방법:**
`src/core/Game.ts`에서 아래 주석을 해제하면 된다.

```typescript
// Tail decay (disabled — reserved for hard mode)
// if (this.state === 'playing' && this.decaySystem.update(this.snake)) {
//   this.loseLife();
//   return;
// }
```

**참고:** decay 활성화 시, 합체 중(`state === 'merging'`)에는 decay가 스킵되도록 이미 처리되어 있음.

---

## 3. 제거 블럭 decay 이중 페널티

**상태:** 보류 (decay 활성화 시 검토 필요)

**현상:**
제거 블럭을 먹으면:
- 꼬리 세그먼트 1개 제거 (손해 1)
- decay 카운터 +1 (손해 2)

일반 이동이나 먹이 먹을 때도 동일하게 decay 카운터가 +1 되므로,
제거 블럭만 특별히 이중 페널티를 받는 건 아니지만, 보상 없이 꼬리를 잃는 상황에서 추가 부담이 된다.

**영향:** 밸런스 문제. 제거 블럭 사용이 지나치게 불리하다고 느껴질 수 있음.

**수정 방법:**
`src/core/Game.ts`의 removal 블럭 분기에서 `move()` 호출 후 카운터를 되돌리면 된다.

```typescript
if (eaten.type === 'removal') {
  this.snake.move();
  this.snake.distanceSinceDecay--; // decay 페널티 상쇄
  if (this.snake.segments.length > 1) {
    this.snake.segments.pop();
  }
}
```
