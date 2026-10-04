<template>
  <div class="code-display" :class="{ 'code-display--shake': shake }">
    <ol class="code-display__lines">
      <li
        v-for="(line, i) in lines"
        :key="i"
        class="code-display__line"
        :class="{ 'code-display__line--marked': highlightLine === i + 1 }"
      >
        <span class="code-display__num">{{ i + 1 }}</span>
        <code class="code-display__code">{{ line || ' ' }}</code>
      </li>
    </ol>
  </div>
</template>

<script>
import { computed } from 'vue'

/** Блок кода с номерами строк. highlightLine — подсветка строки (после подсказки). */
export default {
  name: 'CodeDisplay',
  props: {
    code: { type: String, default: '' },
    highlightLine: { type: Number, default: 0 },
    shake: { type: Boolean, default: false },
  },
  setup(props) {
    const lines = computed(() => props.code.split('\n'))
    return { lines }
  },
}
</script>

<style>
.code-display {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: calc(var(--px) * 18) 0;
  border-top: calc(var(--px) * 4) dashed rgba(161, 0, 255, 0.5);
  border-bottom: calc(var(--px) * 4) dashed rgba(161, 0, 255, 0.5);
  scrollbar-width: thin;
  scrollbar-color: var(--color-neon) transparent;
}

.code-display__lines {
  font-size: calc(var(--px) * 20);
  line-height: 2;
}

.code-display__line {
  display: flex;
  gap: calc(var(--px) * 22);
  padding: 0 calc(var(--px) * 8);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.code-display__num {
  flex: none;
  width: calc(var(--px) * 40);
  text-align: right;
  color: var(--color-violet);
  user-select: none;
}

.code-display__code {
  font-family: inherit;
  color: #e9e3ff;
}

.code-display__line--marked {
  background: rgba(161, 0, 255, 0.28);
  box-shadow: inset calc(var(--px) * 6) 0 0 var(--color-neon);
}

.code-display--shake {
  animation: shake 380ms steps(6, end) 1;
}
</style>
