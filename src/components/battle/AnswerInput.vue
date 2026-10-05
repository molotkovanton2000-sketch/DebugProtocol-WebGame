<template>
  <form class="answer-input" :class="`answer-input--${state}`" @submit.prevent="submit">
    <label class="answer-input__label" :for="id">{{ label }}</label>
    <div class="answer-input__field-wrap">
      <span class="answer-input__prompt" aria-hidden="true">&gt;</span>
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
        :rows="multiline ? 5 : 3"
        @keydown.enter="onEnter"
      />
    </div>
    <div class="answer-input__actions">
      <slot name="actions" />
      <AppButton variant="primary" :disabled="disabled || !value.trim()" @click="submit">
        проверить
      </AppButton>
    </div>
  </form>
</template>

<script>
import { ref } from 'vue'
import AppButton from '../common/AppButton.vue'

let uid = 0

/**
 * Поле ввода кода + кнопка проверки.
 * Enter — отправить, Shift+Enter — перенос строки.
 * В режиме multiline: Enter — перенос, Ctrl/Cmd+Enter — отправить.
 * state: idle | success | error (подсветка рамки)
 */
export default {
  name: 'AnswerInput',
  components: { AppButton },
  props: {
    label: { type: String, default: 'введи исправленную строку:' },
    placeholder: { type: String, default: 'let x = ...' },
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

    const clear = () => {
      value.value = ''
    }
    const focus = () => field.value && field.value.focus()

    expose({ clear, focus })
    return { id, value, field, submit, onEnter }
  },
}
</script>

<style>
.answer-input {
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 18);
}

.answer-input__label {
  font-size: calc(var(--px) * 22);
  color: var(--color-text-muted);
  text-transform: lowercase;
}

.answer-input__field-wrap {
  display: flex;
  gap: calc(var(--px) * 14);
  padding: calc(var(--px) * 16);
  border: calc(var(--px) * 5) solid #fff;
  background: #07000c;
  transition: border-color 120ms steps(2);
}

.answer-input__prompt {
  font-size: calc(var(--px) * 22);
  line-height: 1.9;
  color: var(--color-neon);
  animation: blink 1s steps(1) infinite;
}

.answer-input__field {
  flex: 1;
  min-width: 0;
  resize: none;
  font-size: calc(var(--px) * 22);
  line-height: 1.9;
  color: #fff;
  caret-color: var(--color-neon);
  outline: none;
}

.answer-input__field::placeholder {
  color: #4a4458;
}

.answer-input--success .answer-input__field-wrap {
  border-color: var(--color-success);
}

.answer-input--error .answer-input__field-wrap {
  border-color: var(--color-danger);
  animation: shake 380ms steps(6, end) 1;
}

.answer-input__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: calc(var(--px) * 18);
}
</style>
