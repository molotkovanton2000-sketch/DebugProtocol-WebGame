<template>
  <div
    class="boss-avatar"
    :class="[`boss-avatar--${mood}`, { 'boss-avatar--hands': withHands }]"
    :style="{ '--boss-size': size }"
  >
    <img v-if="withHands" class="boss-avatar__hand boss-avatar__hand--left pixelated" src="/images/hand.png" alt="" />
    <img class="boss-avatar__body pixelated" src="/images/boss.png" :alt="name || 'вирус'" />
    <img v-if="withHands" class="boss-avatar__hand boss-avatar__hand--right pixelated" src="/images/hand.png" alt="" />
  </div>
</template>

<script>
/**
 * Вирус в капюшоне (+ опционально руки).
 * size — ширина в пикселях макета; mood: idle | hurt | attack | defeated
 */
export default {
  name: 'BossAvatar',
  props: {
    size: { type: Number, default: 960 },
    mood: { type: String, default: 'idle' },
    withHands: { type: Boolean, default: false },
    name: { type: String, default: '' },
  },
}
</script>

<style>
.boss-avatar {
  --s: calc(var(--px) * var(--boss-size));
  position: relative;
  width: var(--s);
  height: var(--s);
  pointer-events: none;
}

.boss-avatar__body {
  width: 100%;
  height: 100%;
  animation: breathe 4.5s ease-in-out infinite;
}

/* Руки: координаты сняты с макета экрана игры */
.boss-avatar__hand {
  position: absolute;
  top: calc(var(--s) * 0.138);
  width: calc(var(--s) * 0.734);
  height: auto;
  animation: float 3s ease-in-out infinite;
}

.boss-avatar__hand--left {
  left: calc(var(--s) * -0.585);
}

.boss-avatar__hand--right {
  left: calc(var(--s) * 0.793);
  transform: scaleX(-1);
  animation-name: float-mirrored;
  animation-delay: -1.5s;
}

@keyframes float-mirrored {
  0%, 100% { transform: scaleX(-1) translateY(0); }
  50% { transform: scaleX(-1) translateY(calc(var(--px) * -14)); }
}

/* Получил урон */
.boss-avatar--hurt .boss-avatar__body {
  animation: shake 420ms steps(6, end) 1;
  filter: brightness(1.8) saturate(2) drop-shadow(0 0 calc(var(--px) * 20) var(--color-neon));
}

/* Атакует игрока */
.boss-avatar--attack .boss-avatar__hand--left {
  animation: hand-strike-left 450ms steps(5, end) 1;
}

.boss-avatar--attack .boss-avatar__hand--right {
  animation: hand-strike-right 450ms steps(5, end) 1;
}

@keyframes hand-strike-left {
  50% { transform: translate(calc(var(--px) * 120), calc(var(--px) * 90)) rotate(-12deg); }
}

@keyframes hand-strike-right {
  50% { transform: scaleX(-1) translate(calc(var(--px) * 120), calc(var(--px) * 90)) rotate(-12deg); }
}

.boss-avatar--defeated {
  opacity: 0.25;
  filter: grayscale(1);
  transition: opacity 1s steps(8), filter 1s steps(8);
}
</style>
