<template>
  <ul class="mask-row" :class="`mask-row--${size}`" :aria-label="ariaLabel">
    <li
      v-for="(isBroken, i) in masks"
      :key="i"
      class="mask-row__item"
      :class="{ 'mask-row__item--broken': isBroken }"
      :style="{ animationDelay: i * 0.35 + 's' }"
    >
      <img
        class="mask-row__img pixelated"
        :src="isBroken ? '/images/mask-broken.png' : '/images/mask.png'"
        :alt="isBroken ? 'сломанная маска' : 'маска'"
      />
    </li>
  </ul>
</template>

<script>
import { computed } from 'vue'

/**
 * Ряд масок (они же «жизни» игрока).
 * count — сколько масок, broken — сколько из них сломано (справа налево).
 * size: lg (меню) | sm (HUD в игре)
 */
export default {
  name: 'MaskRow',
  props: {
    count: { type: Number, default: 3 },
    broken: { type: Number, default: 0 },
    size: { type: String, default: 'lg' },
  },
  setup(props) {
    const masks = computed(() =>
      Array.from({ length: props.count }, (_, i) => i >= props.count - props.broken),
    )
    const ariaLabel = computed(() => `Масок: ${props.count - props.broken} из ${props.count}`)
    return { masks, ariaLabel }
  },
}
</script>

<style>
.mask-row {
  display: flex;
  align-items: center;
  gap: calc(var(--px) * 42);
}

.mask-row__item {
  animation: float 3.2s ease-in-out infinite;
}

.mask-row__img {
  width: calc(var(--px) * 140);
  height: auto;
}

.mask-row__item--broken {
  animation-duration: 4.4s;
}

.mask-row__item--broken .mask-row__img {
  filter: drop-shadow(0 0 calc(var(--px) * 8) rgba(161, 0, 255, 0.45));
}

.mask-row--sm {
  gap: calc(var(--px) * 14);
}

.mask-row--sm .mask-row__img {
  width: calc(var(--px) * 58);
}

.mask-row--sm .mask-row__item {
  animation: none;
}
</style>
