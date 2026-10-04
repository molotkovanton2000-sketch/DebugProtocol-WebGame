<template>
  <nav class="app-navigation" :aria-label="ariaLabel">
    <ul class="app-navigation__list" :style="{ gap: `calc(var(--px) * ${gap})` }">
      <li
        v-for="(item, i) in items"
        :key="item.id || item.label"
        class="app-navigation__item"
        @mouseenter="onHover(i)"
        @focusin="onHover(i)"
      >
        <AppButton
          :ref="(el) => (buttons[i] = el)"
          variant="menu"
          :to="item.to"
          :href="item.href"
          :active="i === activeIndex"
          :style="{ fontSize: `calc(var(--px) * ${fontSize})` }"
          @click="select(item, i)"
        >
          {{ item.label }}
        </AppButton>
      </li>
    </ul>
  </nav>
</template>

<script>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppButton from '../common/AppButton.vue'

/**
 * Вертикальное меню. Управление мышью и клавиатурой (↑ ↓ Enter).
 * items: [{ label, to?, href?, id? }]
 * События: select(item), hover(item, index)
 */
export default {
  name: 'AppNavigation',
  components: { AppButton },
  props: {
    items: { type: Array, required: true },
    fontSize: { type: Number, default: 78 },
    gap: { type: Number, default: 14 },
    ariaLabel: { type: String, default: 'Меню' },
  },
  emits: ['select', 'hover'],
  setup(props, { emit }) {
    const activeIndex = ref(-1)
    const buttons = []

    const onHover = (i) => {
      activeIndex.value = i
      emit('hover', props.items[i], i)
    }

    const select = (item, i) => {
      activeIndex.value = i
      emit('select', item, i)
    }

    const focusItem = (i) => {
      const comp = buttons[i]
      const el = comp && (comp.$el || comp)
      if (el && el.focus) el.focus()
      onHover(i)
    }

    const onKey = (e) => {
      const tag = document.activeElement && document.activeElement.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const n = props.items.length
      if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault()
        focusItem((activeIndex.value + 1 + n) % n)
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault()
        focusItem((activeIndex.value - 1 + n) % n)
      }
    }

    onMounted(() => window.addEventListener('keydown', onKey))
    onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

    return { activeIndex, buttons, onHover, select }
  },
}
</script>

<style>
.app-navigation__list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-navigation__item {
  display: flex;
  justify-content: center;
}
</style>
