<template>
  <section class="result-panel" :class="`result-panel--${tone}`">
    <h1 class="result-panel__title">{{ title }}</h1>
    <dl v-if="result" class="result-panel__stats">
      <div class="result-panel__row"><dt>вирус</dt><dd>{{ result.boss }}</dd></div>
      <div class="result-panel__row"><dt>исправлено</dt><dd>{{ result.correct }}</dd></div>
      <div class="result-panel__row"><dt>ошибок</dt><dd>{{ result.mistakes }}</dd></div>
      <div class="result-panel__row"><dt>подсказок</dt><dd>{{ result.hints }}</dd></div>
      <div class="result-panel__row"><dt>время</dt><dd>{{ formatTime(result.seconds) }}</dd></div>
    </dl>
    <div class="result-panel__actions">
      <AppButton variant="primary" @click="$emit('retry')">ещё раз</AppButton>
      <AppButton variant="ghost" to="/">в меню</AppButton>
    </div>
  </section>
</template>

<script>
import AppButton from '../common/AppButton.vue'

/** Итоги боя (для экранов победы/поражения). tone: success | danger */
export default {
  name: 'ResultPanel',
  components: { AppButton },
  props: {
    title: { type: String, required: true },
    tone: { type: String, default: 'success' },
    result: { type: Object, default: null },
  },
  emits: ['retry'],
  setup() {
    const formatTime = (s = 0) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
    return { formatTime }
  },
}
</script>

<style>
.result-panel {
  width: calc(var(--px) * 820);
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 40);
}

.result-panel__title {
  font-size: calc(var(--px) * 56);
  font-weight: 400;
  line-height: 1.3;
  text-transform: uppercase;
  animation: glitch 300ms var(--ease-glitch) 2;
}

.result-panel--success .result-panel__title {
  color: var(--color-success);
}

.result-panel--danger .result-panel__title {
  color: var(--color-danger);
}

.result-panel__stats {
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 16);
  font-size: calc(var(--px) * 24);
}

.result-panel__row {
  display: flex;
  justify-content: space-between;
  border-bottom: calc(var(--px) * 3) dashed #2a2235;
  padding-bottom: calc(var(--px) * 10);
}

.result-panel__row dt {
  color: var(--color-text-muted);
}

.result-panel__actions {
  display: flex;
  gap: calc(var(--px) * 24);
}

@media (orientation: portrait) {
  .result-panel {
    width: calc(var(--px) * 940);
  }
}
</style>
