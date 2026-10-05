<template>
  <Transition name="app-modal">
    <div v-if="modelValue" class="app-modal" @click.self="close" @keydown.esc="close">
      <div class="app-modal__window" role="dialog" aria-modal="true" :aria-label="title">
        <h2 v-if="title" class="app-modal__title">{{ title }}</h2>
        <div class="app-modal__content">
          <slot />
        </div>
        <div class="app-modal__actions">
          <slot name="actions">
            <AppButton ref="okButton" variant="primary" @click="close">ок</AppButton>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import AppButton from './AppButton.vue'

/** Модальное окно в стиле игры. Использование: v-model="isOpen". */
export default {
  name: 'AppModal',
  components: { AppButton },
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit }) {
    const close = () => {
      emit('update:modelValue', false)
      emit('close')
    }
    return { close }
  },
}
</script>

<style>
.app-modal {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.78);
}

.app-modal__window {
  width: min(calc(var(--px) * 1100), 92%);
  padding: calc(var(--px) * 50);
  border: var(--border-panel) solid var(--color-neon);
  border-radius: var(--radius-panel);
  background: #050008;
  box-shadow: 0 0 calc(var(--px) * 40) var(--color-neon-glow);
}

.app-modal__title {
  margin-bottom: calc(var(--px) * 30);
  font-size: calc(var(--px) * 40);
  font-weight: 400;
  color: var(--color-violet-light);
  text-transform: uppercase;
}

.app-modal__content {
  font-size: calc(var(--px) * 24);
  line-height: 1.8;
}

.app-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--px) * 24);
  margin-top: calc(var(--px) * 40);
}

.app-modal-enter-active,
.app-modal-leave-active {
  transition: opacity 160ms steps(4, end);
}

.app-modal-enter-from,
.app-modal-leave-to {
  opacity: 0;
}
</style>
