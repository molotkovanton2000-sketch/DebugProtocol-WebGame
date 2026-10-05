<template>
  <section class="app-card" :class="{ 'app-card--glow': glow }">
    <header v-if="title || $slots.header" class="app-card__header">
      <slot name="header">
        <h2 class="app-card__title">{{ title }}</h2>
      </slot>
    </header>
    <div class="app-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="app-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script>
/** Панель с неоновой рамкой (как нижние окна на экране игры). */
export default {
  name: 'AppCard',
  props: {
    title: { type: String, default: '' },
    glow: { type: Boolean, default: false },
  },
}
</script>

<style>
.app-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: calc(var(--px) * 26) calc(var(--px) * 28);
  border: var(--border-panel) solid var(--color-neon);
  border-radius: var(--radius-panel);
  background: #000;
  overflow: hidden;
}

.app-card--glow {
  box-shadow:
    0 0 calc(var(--px) * 22) var(--color-neon-glow),
    inset 0 0 calc(var(--px) * 18) rgba(161, 0, 255, 0.25);
}

.app-card__header {
  flex: none;
  margin-bottom: calc(var(--px) * 22);
}

.app-card__title {
  font-size: calc(var(--px) * 30);
  font-weight: 400;
  line-height: 1.3;
  text-transform: lowercase;
}

.app-card__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 18);
}

.app-card__footer {
  flex: none;
  margin-top: calc(var(--px) * 18);
}
</style>
