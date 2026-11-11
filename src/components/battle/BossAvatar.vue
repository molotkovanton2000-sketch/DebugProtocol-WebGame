<template>
  <div class="boss-avatar" :class="[`boss-avatar--${mood}`, `boss-avatar--phase-${phase}`]" role="img" :aria-label="name || 'вирус'">
    <div class="boss-avatar__stage">
      <img
        v-if="withHands"
        class="boss-avatar__hand boss-avatar__hand--left pixelated"
        src="/images/anim/boss-hand.gif"
        alt=""
      />

      <div class="boss-avatar__body">
        <img v-if="sprite === 'p1'" class="boss-avatar__img boss-avatar__img--p1 pixelated" src="/images/anim/boss-p1.gif" alt="" />
        <!-- переход во 2 фазу: сначала босс 1 фазы исчезает... -->
        <img
          v-else-if="sprite === 'leaving'"
          class="boss-avatar__img boss-avatar__img--p1 boss-avatar__img--leaving pixelated"
          src="/images/anim/boss-p1.gif"
          alt=""
        />
        <!-- ...и только потом проигрывается появление 2 фазы (кадр 128×128, видимая часть вырезана рамкой) -->
        <div v-else-if="sprite === 'appear'" class="boss-avatar__appear">
          <img :key="appearSrc" class="pixelated" :src="appearSrc" alt="" />
        </div>
        <img v-else class="boss-avatar__img boss-avatar__img--p2 pixelated" src="/images/anim/boss-p2.gif" alt="" />
      </div>

      <img
        v-if="withHands"
        class="boss-avatar__hand boss-avatar__hand--right pixelated"
        src="/images/anim/boss-hand.gif"
        alt=""
      />
    </div>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { freshGif, preloadGif, releaseGif } from '../../utils/freshGif'

const APPEAR_GIF = '/images/anim/boss-p2-appear.gif'
const LEAVE_MS = 1200 // исчезновение босса 1 фазы
const APPEAR_MS = 2700 // 27 кадров по 100 мс

/**
 * Вирус (анимированные текстуры) + опционально руки.
 * phase: 1 | 2. При переходе 1 → 2 босс сначала исчезает, затем проигрывается «появление второй фазы».
 * Масштаб задаётся CSS-переменной --boss-scale (пикселей макета на 1 пиксель арта).
 * mood: idle | hurt | attack | defeated
 */
export default {
  name: 'BossAvatar',
  props: {
    mood: { type: String, default: 'idle' },
    phase: { type: Number, default: 1 },
    withHands: { type: Boolean, default: false },
    name: { type: String, default: '' },
  },
  setup(props) {
    // этап перехода во 2 фазу: leaving (исчезновение) → appear (появление) → p2
    const stage = ref('p2')
    const appearSrc = ref('')
    let leaveTimer = null
    let appearTimer = null

    onMounted(() => {
      if (props.withHands) preloadGif(APPEAR_GIF)
    })

    watch(
      () => props.phase,
      (now, before) => {
        if (now < 2 || before >= 2) return
        clearTimeout(leaveTimer)
        clearTimeout(appearTimer)
        stage.value = 'leaving'
        const nextSrc = freshGif(APPEAR_GIF) // готовим, пока идёт исчезновение
        leaveTimer = setTimeout(async () => {
          const src = await nextSrc
          releaseGif(appearSrc.value)
          appearSrc.value = src
          stage.value = 'appear'
          appearTimer = setTimeout(() => (stage.value = 'p2'), APPEAR_MS)
        }, LEAVE_MS)
      },
    )

    onBeforeUnmount(() => {
      clearTimeout(leaveTimer)
      clearTimeout(appearTimer)
      releaseGif(appearSrc.value)
    })

    const sprite = computed(() => (props.phase < 2 ? 'p1' : stage.value))
    return { sprite, appearSrc }
  },
}
</script>

<style>
/* 1 пиксель арта = --k пикселей макета */
.boss-avatar {
  --k: calc(var(--px) * var(--boss-scale, 10));
  position: relative;
  width: calc(var(--k) * 80);
  height: calc(var(--k) * 80);
  pointer-events: none;
}

.boss-avatar__stage {
  position: absolute;
  inset: 0;
}

.boss-avatar img {
  max-width: none;
}

.boss-avatar__body {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: breathe 4.5s ease-in-out infinite;
  /* низ тела растворяется, а не обрывается ровной линией */
  -webkit-mask-image: linear-gradient(to bottom, #000 68%, transparent 97%);
  mask-image: linear-gradient(to bottom, #000 68%, transparent 97%);
}

.boss-avatar__img--p1 {
  display: block;
  width: calc(var(--k) * 76);
  height: auto;
}

.boss-avatar__img--p2 {
  display: block;
  width: calc(var(--k) * 62);
  height: auto;
}

/* исчезновение босса 1 фазы: мерцает и гаснет */
.boss-avatar__img--leaving {
  animation: boss-leave 1.2s steps(10, end) forwards;
}

@keyframes boss-leave {
  0% { opacity: 1; filter: none; }
  15% { opacity: 0.35; filter: brightness(2.2) saturate(2); }
  25% { opacity: 1; filter: none; }
  40% { opacity: 0.25; filter: brightness(2.4) saturate(2); }
  55% { opacity: 0.8; filter: brightness(1.6); }
  100% { opacity: 0; filter: brightness(3) saturate(0); }
}

/* 2 фаза ниже ростом — поднимаем, чтобы голова была на уровне головы 1 фазы */
.boss-avatar__img--p2,
.boss-avatar__appear {
  margin-bottom: calc(var(--k) * 12);
}

.boss-avatar__appear {
  position: relative;
  width: calc(var(--k) * 62);
  height: calc(var(--k) * 62);
  overflow: hidden;
}

.boss-avatar__appear img {
  position: absolute;
  left: calc(var(--k) * -33);
  top: calc(var(--k) * -18);
  width: calc(var(--k) * 128);
  height: auto;
  max-width: none;
}

/* Руки (кадр 69×83). Пропорции как в прошлой версии: рука ≈ 0.55 ширины босса,
   висят по бокам на уровне головы и «летают» */
.boss-avatar__hand {
  position: absolute;
  top: calc(var(--k) * -2);
  width: calc(var(--k) * 42);
  height: auto;
  animation: float 3s ease-in-out infinite;
}

.boss-avatar__hand--left {
  left: calc(var(--k) * -38);
}

.boss-avatar__hand--right {
  left: calc(var(--k) * 76);
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

/* Атакует игрока: руки бьют вниз, к панелям */
.boss-avatar--attack .boss-avatar__hand--left {
  animation: hand-strike-left 450ms steps(5, end) 1;
}

.boss-avatar--attack .boss-avatar__hand--right {
  animation: hand-strike-right 450ms steps(5, end) 1;
}

@keyframes hand-strike-left {
  50% { transform: translate(calc(var(--px) * 60), calc(var(--px) * 130)) rotate(-10deg); }
}

@keyframes hand-strike-right {
  50% { transform: scaleX(-1) translate(calc(var(--px) * 60), calc(var(--px) * 130)) rotate(-10deg); }
}

.boss-avatar--defeated {
  opacity: 0.25;
  filter: grayscale(1);
  transition: opacity 1s steps(8), filter 1s steps(8);
}
</style>
