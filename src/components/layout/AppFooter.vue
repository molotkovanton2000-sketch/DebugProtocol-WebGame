<template>
  <footer class="app-footer">
    <slot>© {{ year }} Debug Protocol team</slot>
  </footer>
</template>

<script>
/** Подвал с копирайтом. */
export default {
  name: 'AppFooter',
  setup() {
    return { year: new Date().getFullYear() }
  },
}
</script>

<style>
.app-footer {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  bottom: calc(var(--px) * 22);
  text-align: center;
  font-size: calc(var(--px) * 16);
  color: var(--color-text-muted);
  pointer-events: none;
}
</style>
