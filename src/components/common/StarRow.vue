<template>
  <ul class="star-row" :aria-label="`Звёзд: ${lit} из ${count}`">
    <li
      v-for="n in count"
      :key="n"
      class="star-row__item"
      :class="{ 'star-row__item--on': n <= lit }"
    >
      <svg class="star-row__svg" viewBox="0 0 24 23" aria-hidden="true">
        <polygon points="12,0 14.9,8.6 24,8.7 16.7,14.1 19.4,22.9 12,17.6 4.6,22.9 7.3,14.1 0,8.7 9.1,8.6" />
      </svg>
    </li>
  </ul>
</template>

<script>
/** Ряд звёзд: на экране сложности подсвечивает 1/2/3 звезды. */
export default {
  name: 'StarRow',
  props: {
    count: { type: Number, default: 3 },
    lit: { type: Number, default: 3 },
  },
}
</script>

<style>
.star-row {
  display: flex;
  align-items: center;
  gap: calc(var(--px) * 72);
}

.star-row__svg {
  width: calc(var(--px) * 124);
  height: auto;
  fill: var(--color-star-off);
  transition: fill 150ms steps(3), transform 150ms steps(3);
}

.star-row__item--on .star-row__svg {
  fill: var(--color-star);
  filter: drop-shadow(0 0 calc(var(--px) * 10) rgba(255, 255, 255, 0.35));
}
</style>
