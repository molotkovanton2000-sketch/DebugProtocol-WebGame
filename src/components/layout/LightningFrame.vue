<template>
  <div class="lightning-frame" :class="`lightning-frame--${variant}`" aria-hidden="true">
    <img
      v-for="(bolt, i) in bolts"
      :key="variant + i"
      class="lightning-frame__bolt pixelated"
      src="/images/lightning.png"
      alt=""
      :style="boltStyle(bolt, i)"
    />
  </div>
</template>

<script>
import { computed } from 'vue'

/*
 * Молнии по краям экрана. Координаты — в пикселях макета 1920×1080:
 * [x, y, размер, поворот°, отражение по X]
 */
const LAYOUTS = {
  // main menu / easy — только углы
  corners: [
    [-20, -95, 330, 0],
    [1585, -70, 340, 90, -1],
    [-30, 795, 330, -90],
    [1600, 790, 330, 180, -1],
  ],
  // medium — молнии по всему периметру
  medium: [
    [-70, -90, 360, 0],
    [190, -150, 300, 35, -1],
    [640, -150, 300, 200],
    [1040, -170, 330, 160, -1],
    [1430, -120, 340, 90],
    [1690, 120, 300, 40, -1],
    [-185, 380, 300, -30],
    [-110, 740, 360, -90, -1],
    [560, 800, 320, 15],
    [1690, 600, 330, 180],
    [1420, 860, 320, 120, -1],
  ],
  // hard — экран буквально трещит
  hard: [
    [-60, -60, 400, 0],
    [170, -120, 330, 35, -1],
    [520, -150, 320, 200],
    [820, -100, 300, 140, -1],
    [1080, -160, 360, 160],
    [1390, -110, 360, 90, -1],
    [1700, 60, 330, 40],
    [1640, 320, 300, -60, -1],
    [-200, 300, 330, -30],
    [-190, 560, 280, 70, -1],
    [-120, 720, 380, -90],
    [200, 860, 300, 210, -1],
    [600, 760, 330, 15],
    [1700, 620, 340, 180],
    [1480, 850, 330, 120, -1],
    [1150, 930, 280, 260],
  ],
}

export default {
  name: 'LightningFrame',
  props: {
    /** corners | medium | hard */
    variant: { type: String, default: 'corners' },
  },
  setup(props) {
    const bolts = computed(() => LAYOUTS[props.variant] || LAYOUTS.corners)

    // Позиция — в процентах от сцены (работает и в портретной раскладке),
    // размер — в пикселях макета.
    const boltStyle = ([x, y, size, rotate, flip = 1], i) => ({
      left: `${(x / 1920) * 100}%`,
      top: `${(y / 1080) * 100}%`,
      width: `calc(var(--px) * ${size})`,
      transform: `rotate(${rotate}deg) scaleX(${flip})`,
      animationDelay: `${((i * 0.73) % 4).toFixed(2)}s`,
    })

    return { bolts, boltStyle }
  },
}
</script>

<style>
.lightning-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.lightning-frame__bolt {
  position: absolute;
  height: auto;
  transform-origin: center;
  animation: flicker 4s steps(1, end) infinite;
}

.lightning-frame--hard .lightning-frame__bolt {
  animation-duration: 2.3s;
  filter: drop-shadow(0 0 calc(var(--px) * 6) rgba(161, 0, 255, 0.5));
}
</style>
