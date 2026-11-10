<template>
  <form class="answer-input" :class="`answer-input--${state}`" @submit.prevent="submit">
    <label class="visually-hidden" :for="id">{{ label }}</label>
    <div class="answer-input__editor">
      <!-- нумерация строк: синхронно прокручивается с полем -->
      <ol ref="gutter" class="answer-input__gutter" aria-hidden="true">
        <li v-for="n in lineCount" :key="n">{{ n }}</li>
      </ol>
      <textarea
        :id="id"
        ref="field"
        v-model="value"
        class="answer-input__field"
        :placeholder="placeholder"
        :disabled="disabled"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        wrap="off"
        @keydown.enter="onEnter"
        @scroll="syncScroll"
      />
    </div>
    <button
      type="submit"
      class="answer-input__send"
      :disabled="disabled || !value.trim()"
      aria-label="проверить"
      title="проверить"
    >
      &#9654;
    </button>
  </form>
</template>

<script>
import { computed, ref } from 'vue'

let uid = 0
const MIN_LINES = 14

/**
 * Окно ввода кода: нумерация строк, полоски между строками, ничего лишнего.
 * Enter — отправить, Shift+Enter — перенос строки.
 * В режиме multiline: Enter — перенос, Ctrl/Cmd+Enter — отправить.
 * state: idle | success | error (подсветка)
 */
export default {
  name: 'AnswerInput',
  props: {
    label: { type: String, default: 'код на javascript' },
    placeholder: { type: String, default: 'пиши код на js здесь' },
    disabled: { type: Boolean, default: false },
    state: { type: String, default: 'idle' },
    /** многострочный режим (задачи «напиши код»): Enter — перенос, Ctrl+Enter — отправка */
    multiline: { type: Boolean, default: false },
  },
  emits: ['submit'],
  setup(props, { emit, expose }) {
    const id = `answer-${++uid}`
    const value = ref('')
    const field = ref(null)
    const gutter = ref(null)

    const lineCount = computed(() => Math.max(MIN_LINES, value.value.split('\n').length))

    const submit = () => {
      if (props.disabled || !value.value.trim()) return
      emit('submit', value.value)
    }

    const onEnter = (e) => {
      const send = props.multiline ? e.ctrlKey || e.metaKey : !e.shiftKey
      if (!send) return
      e.preventDefault()
      submit()
    }

    const syncScroll = () => {
      if (gutter.value && field.value) gutter.value.scrollTop = field.value.scrollTop
    }

    const clear = () => {
      value.value = ''
    }
    const focus = () => field.value && field.value.focus()

    expose({ clear, focus })
    return { id, value, field, gutter, lineCount, submit, onEnter, syncScroll }
  },
}
</script>

<style>
.answer-input {
  --line: calc(var(--px) * 40);
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.answer-input__editor {
  flex: 1;
  min-width: 0;
  display: flex;
  border-radius: calc(var(--px) * 12);
  transition: box-shadow 120ms steps(2);
}

.answer-input__gutter {
  flex: none;
  width: calc(var(--px) * 64);
  overflow: hidden;
  padding: calc(var(--px) * 12) calc(var(--px) * 14) 0 0;
  border-right: calc(var(--px) * 4) solid rgba(161, 0, 255, 0.55);
  font-size: calc(var(--px) * 16);
  line-height: var(--line);
  text-align: right;
  color: var(--color-violet);
  user-select: none;
}

.answer-input__field {
  flex: 1;
  min-width: 0;
  resize: none;
  padding: calc(var(--px) * 12) calc(var(--px) * 18);
  white-space: pre;
  overflow: auto;
  font-size: calc(var(--px) * 22);
  line-height: var(--line);
  color: #fff;
  caret-color: var(--color-neon);
  outline: none;
  scrollbar-width: thin;
  scrollbar-color: var(--color-neon) transparent;
  /* полоски между строками, прокручиваются вместе с текстом */
  background: linear-gradient(
      to bottom,
      transparent calc(var(--line) - var(--px) * 2),
      rgba(161, 0, 255, 0.22) calc(var(--line) - var(--px) * 2)
    )
    0 calc(var(--px) * 12) / 100% var(--line) repeat-y local;
}

.answer-input__field::placeholder {
  font-size: calc(var(--px) * 17);
  color: #5a5370;
}

.answer-input--success .answer-input__editor {
  box-shadow: inset 0 0 0 calc(var(--px) * 3) var(--color-success);
}

.answer-input--error .answer-input__editor {
  box-shadow: inset 0 0 0 calc(var(--px) * 3) var(--color-danger);
  animation: shake 380ms steps(6, end) 1;
}

/* Маленькая кнопка «проверить» в углу окна — Enter работает и без неё */
.answer-input__send {
  position: absolute;
  right: calc(var(--px) * 14);
  bottom: calc(var(--px) * 40);
  width: calc(var(--px) * 56);
  height: calc(var(--px) * 56);
  display: grid;
  place-items: center;
  padding-left: calc(var(--px) * 4);
  border: calc(var(--px) * 4) solid #fff;
  border-radius: 50%;
  background: #000;
  font-size: calc(var(--px) * 18);
  color: #fff;
  transition: background var(--transition-fast) steps(2), border-color var(--transition-fast) steps(2);
}

.answer-input__send:hover:not(:disabled),
.answer-input__send:focus-visible {
  outline: none;
  border-color: var(--color-neon);
  background: var(--color-neon);
}

.answer-input__send:disabled {
  opacity: 0.35;
}
</style>
