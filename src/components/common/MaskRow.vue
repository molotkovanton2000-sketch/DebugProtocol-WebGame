<template>
  <ul class="mask-row" :class="`mask-row--${size}`" :aria-label="ariaLabel">
    <li
      v-for="(state, i) in items"
      :key="i"
      class="mask-row__item"
      :class="{ 'mask-row__item--broken': state === 'broken' }"
      :style="{ animationDelay: i * 0.35 + 's' }"
    >
      <img
        class="mask-row__img pixelated"
        :src="srcFor(state)"
        :alt="state === 'broken' ? 'сломанная маска' : 'маска'"
      />
    </li>
  </ul>
</template>

<script>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { freshGif, preloadGif, releaseGif } from '../../utils/freshGif'

const RESTORE_GIF = '/images/anim/mask-restore.gif'

const RESTORE_MS = 1400 // 12 кадров по 120 мс

/**
 * Ряд масок.
 *  - states: ['whole' | 'broken', ...] — явное состояние каждой маски (главное меню);
 *  - или count + broken — сколько масок и сколько из них сломано справа налево (HUD).
 *  - restoreIndex >= 0 — маска с этим индексом сначала показывается сломанной,
 *    затем проигрывается анимация «маска соединяется».
 * size: lg (меню) | sm (HUD в игре)
 */
export default {
  name: 'MaskRow',
  props: {
    count: { type: Number, default: 3 },
    broken: { type: Number, default: 0 },
    states: { type: Array, default: null },
    restoreIndex: { type: Number, default: -1 },
    restoreDelay: { type: Number, default: 700 },
    size: { type: String, default: 'lg' },
  },
  setup(props) {
    const phase = ref('idle') // idle | wait | play
    const playSrc = ref('')
    let waitTimer = null
    let playTimer = null

    const stop = () => {
      clearTimeout(waitTimer)
      clearTimeout(playTimer)
    }

    watch(
      () => props.restoreIndex,
      (index) => {
        stop()
        if (index < 0) {
          phase.value = 'idle'
          return
        }
        phase.value = 'wait'
        preloadGif(RESTORE_GIF)
        waitTimer = setTimeout(async () => {
          const src = await freshGif(RESTORE_GIF)
          releaseGif(playSrc.value)
          playSrc.value = src
          phase.value = 'play'
          playTimer = setTimeout(() => (phase.value = 'idle'), RESTORE_MS)
        }, props.restoreDelay)
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      stop()
      releaseGif(playSrc.value)
    })

    const base = computed(() =>
      props.states
        ? props.states
        : Array.from({ length: props.count }, (_, i) => (i >= props.count - props.broken ? 'broken' : 'whole')),
    )

    const items = computed(() =>
      base.value.map((state, i) => {
        if (i !== props.restoreIndex) return state
        if (phase.value === 'wait') return 'broken'
        if (phase.value === 'play') return 'restoring'
        return state
      }),
    )

    const srcFor = (state) => {
      if (state === 'restoring') return playSrc.value
      return state === 'broken' ? '/images/mask-broken.png' : '/images/mask.png'
    }

    const ariaLabel = computed(
      () => `Целых масок: ${base.value.filter((s) => s === 'whole').length} из ${base.value.length}`,
    )

    return { items, srcFor, ariaLabel }
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
  width: calc(var(--px) * 190);
  height: auto;
}

.mask-row__item--broken {
  animation-duration: 4.4s;
}

.mask-row__item--broken .mask-row__img {
  filter: drop-shadow(0 0 calc(var(--px) * 8) rgba(161, 0, 255, 0.45));
}

.mask-row--sm {
  gap: calc(var(--px) * 10);
}

.mask-row--sm .mask-row__img {
  width: calc(var(--px) * 56);
}

.mask-row--sm .mask-row__item {
  animation: none;
}
</style>
