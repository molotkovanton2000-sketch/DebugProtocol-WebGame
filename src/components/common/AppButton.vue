<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    class="app-button"
    :class="[
      `app-button--${variant}`,
      { 'app-button--active': active, 'app-button--disabled': disabled },
    ]"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
  >
    <span class="app-button__label"><slot /></span>
    <span class="app-button__glitch" aria-hidden="true"><slot /></span>
  </component>
</template>

<script>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

/**
 * Универсальная пиксельная кнопка.
 * variant: menu (крупный пункт меню), primary, ghost, danger
 * to — ссылка роутера, href — внешняя ссылка, иначе <button>.
 */
export default {
  name: 'AppButton',
  props: {
    variant: { type: String, default: 'primary' },
    to: { type: [String, Object], default: null },
    href: { type: String, default: null },
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const tag = computed(() => {
      if (props.to) return RouterLink
      if (props.href) return 'a'
      return 'button'
    })

    const linkAttrs = computed(() => {
      if (props.to) return { to: props.to }
      if (props.href) return { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
      return { type: 'button' }
    })

    return { tag, linkAttrs }
  },
}
</script>

<style>
.app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-pixel);
  color: var(--color-text);
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
  outline: none;
  transition: color var(--transition-fast) steps(2), transform var(--transition-fast) steps(2);
}

.app-button__label {
  position: relative;
  display: inline-block;
}

/* Глитч-слой: копия текста, появляется при наведении */
.app-button__glitch {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: inherit;
  color: var(--color-violet-light);
  opacity: 0;
  pointer-events: none;
  mix-blend-mode: screen;
}

.app-button:hover .app-button__glitch,
.app-button:focus-visible .app-button__glitch,
.app-button--active .app-button__glitch {
  opacity: 0.85;
  animation: glitch 260ms var(--ease-glitch) infinite;
}

/* ---------- menu: крупный пункт главного меню ---------- */
.app-button--menu {
  font-size: calc(var(--px) * 78);
  padding: calc(var(--px) * 10) calc(var(--px) * 6);
}

.app-button--menu::before {
  content: '>';
  position: absolute;
  left: calc(var(--px) * -82);
  color: var(--color-violet-light);
  opacity: 0;
  animation: blink 0.9s steps(1) infinite;
}

.app-button--menu:hover,
.app-button--menu:focus-visible,
.app-button--menu.app-button--active {
  color: #f1e3ff;
  text-shadow:
    calc(var(--px) * 5) 0 0 var(--color-violet),
    calc(var(--px) * -3) 0 0 rgba(0, 220, 255, 0.35);
}

.app-button--menu:hover::before,
.app-button--menu:focus-visible::before,
.app-button--menu.app-button--active::before {
  opacity: 1;
}

/* ---------- primary: кнопка в рамке ---------- */
.app-button--primary,
.app-button--danger,
.app-button--ghost {
  font-size: calc(var(--px) * 26);
  padding: calc(var(--px) * 20) calc(var(--px) * 30);
  border: calc(var(--px) * 6) solid var(--color-neon);
  background: #0b0010;
  box-shadow: 0 0 calc(var(--px) * 18) var(--color-neon-glow);
}

.app-button--primary:hover,
.app-button--primary:focus-visible {
  background: var(--color-neon);
}

.app-button--primary:active,
.app-button--danger:active,
.app-button--ghost:active {
  transform: translateY(calc(var(--px) * 4));
}

.app-button--danger {
  border-color: var(--color-danger);
  box-shadow: 0 0 calc(var(--px) * 18) rgba(255, 60, 110, 0.4);
}

.app-button--danger:hover,
.app-button--danger:focus-visible {
  background: var(--color-danger);
}

.app-button--ghost {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  color: var(--color-text-muted);
}

.app-button--ghost:hover,
.app-button--ghost:focus-visible {
  color: var(--color-text);
  border-color: var(--color-violet);
}

.app-button--disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
