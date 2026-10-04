<template>
  <ul class="battle-log" aria-live="polite">
    <li v-for="entry in entries" :key="entry.id" class="battle-log__entry" :class="`battle-log__entry--${entry.type}`">
      {{ entry.text }}
    </li>
  </ul>
</template>

<script>
/** Лог событий боя (новые сверху). entries: [{ id, type: success|error|info, text }] */
export default {
  name: 'BattleLog',
  props: {
    entries: { type: Array, default: () => [] },
  },
}
</script>

<style>
.battle-log {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 12);
  font-size: calc(var(--px) * 17);
  line-height: 1.7;
  scrollbar-width: thin;
  scrollbar-color: var(--color-neon) transparent;
}

.battle-log__entry {
  color: var(--color-text-muted);
  animation: fade-in 200ms steps(3) 1;
}

.battle-log__entry--success {
  color: var(--color-success);
}

.battle-log__entry--error {
  color: var(--color-danger);
}

.battle-log__entry:first-child {
  color: #fff;
}

.battle-log__entry--success:first-child {
  color: var(--color-success);
}

.battle-log__entry--error:first-child {
  color: var(--color-danger);
}
</style>
