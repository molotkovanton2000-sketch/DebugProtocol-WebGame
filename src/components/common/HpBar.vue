<template>
  <div
    class="hp-bar"
    :class="`hp-bar--${variant}`"
    role="meter"
    :aria-label="label"
    :aria-valuenow="current"
    aria-valuemin="0"
    :aria-valuemax="max"
  >
    <div v-if="label" class="hp-bar__label">
      <span>{{ label }}</span>
      <span class="hp-bar__value">{{ current }}/{{ max }}</span>
    </div>
    <div class="hp-bar__track">
      <div class="hp-bar__lag" :style="{ width: percent + '%' }" />
      <div class="hp-bar__fill" :style="{ width: percent + '%' }" />
      <span v-for="n in segments - 1" :key="n" class="hp-bar__tick" :style="{ left: (n / segments) * 100 + '%' }" />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

/** Универсальная пиксельная полоска HP. variant: boss | player */
export default {
  name: 'HpBar',
  props: {
    current: { type: Number, required: true },
    max: { type: Number, required: true },
    label: { type: String, default: '' },
    variant: { type: String, default: 'boss' },
    segments: { type: Number, default: 10 },
  },
  setup(props) {
    const percent = computed(() =>
      props.max > 0 ? Math.max(0, Math.min(100, (props.current / props.max) * 100)) : 0,
    )
    return { percent }
  },
}
</script>

<style>
.hp-bar {
  width: 100%;
}

.hp-bar__label {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--px) * 16);
  margin-bottom: calc(var(--px) * 12);
  font-size: calc(var(--px) * 22);
  text-transform: uppercase;
}

.hp-bar__value {
  color: var(--color-text-muted);
}

.hp-bar__track {
  position: relative;
  height: calc(var(--px) * 28);
  border: calc(var(--px) * 5) solid #fff;
  background: #120018;
  overflow: hidden;
}

.hp-bar__fill,
.hp-bar__lag {
  position: absolute;
  inset: 0 auto 0 0;
}

.hp-bar__fill {
  background: var(--color-hp-boss);
  transition: width 260ms steps(6, end);
}

/* «Отстающая» полоска, как в файтингах */
.hp-bar__lag {
  background: #fff;
  transition: width 700ms 250ms steps(10, end);
}

.hp-bar__tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: calc(var(--px) * 4);
  background: #000;
  opacity: 0.55;
}

.hp-bar--player .hp-bar__fill {
  background: var(--color-hp-player);
}

.hp-bar--player .hp-bar__lag {
  background: var(--color-danger);
}
</style>
