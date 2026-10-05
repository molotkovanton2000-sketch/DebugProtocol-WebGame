<template>
  <div class="menu-screen" :class="`menu-screen--${lightning}`">
    <LightningFrame v-if="lightning !== 'none'" :variant="lightning" />

    <BossAvatar class="menu-screen__boss" :size="960" :mood="bossMood" />

    <AppHeader :back="back" :back-to="backTo" />

    <main class="menu-screen__content" :style="{ marginTop: `calc(var(--px) * ${offset})` }">
      <slot />
    </main>

    <div v-if="$slots.bottom" class="menu-screen__bottom">
      <slot name="bottom" />
    </div>

    <slot name="overlay" />
  </div>
</template>

<script>
import LightningFrame from './LightningFrame.vue'
import AppHeader from './AppHeader.vue'
import BossAvatar from '../battle/BossAvatar.vue'

/**
 * Каркас для экранов-меню (главное меню, сложность, о нас, туториал):
 * заголовок слева сверху, контент в левой колонке, босс справа,
 * ряд масок/звёзд снизу и молнии по краям.
 */
export default {
  name: 'MenuScreen',
  components: { LightningFrame, AppHeader, BossAvatar },
  props: {
    /** none | corners | medium | hard */
    lightning: { type: String, default: 'corners' },
    back: { type: Boolean, default: false },
    backTo: { type: String, default: '/' },
    /** сдвиг контента по вертикали, px макета */
    offset: { type: Number, default: 0 },
    bossMood: { type: String, default: 'idle' },
  },
}
</script>

<style>
.menu-screen {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.menu-screen .menu-screen__boss {
  position: absolute;
  left: calc(var(--px) * 830);
  top: calc(var(--px) * 225);
}

.menu-screen__content {
  position: absolute;
  z-index: 2;
  left: 0;
  width: calc(var(--px) * 1010);
  top: calc(var(--px) * 290);
  height: calc(var(--px) * 510);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.menu-screen__bottom {
  position: absolute;
  z-index: 2;
  left: 0;
  width: calc(var(--px) * 1020);
  top: calc(var(--px) * 860);
  height: calc(var(--px) * 140);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---------- Портрет (телефон): всё в одну колонку ---------- */
@media (orientation: portrait) {
  .menu-screen .menu-screen__boss {
    left: 50%;
    top: auto;
    bottom: calc(var(--px) * -120);
    transform: translateX(-50%);
    opacity: 0.55;
  }

  .menu-screen__content {
    left: 0;
    width: 100%;
    top: calc(var(--px) * 330);
    height: auto;
  }

  .menu-screen__bottom {
    left: 0;
    width: 100%;
    top: auto;
    bottom: calc(var(--px) * 90);
  }
}
</style>
