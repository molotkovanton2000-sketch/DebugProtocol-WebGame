<template>
  <nav class="app-navigation" :aria-label="ariaLabel">
    <ul
      class="app-navigation__list"
      :style="{ gap: `calc(var(--px) * ${gap})`, fontSize: `calc(var(--px) * ${fontSize})` }"
      @mouseleave="onListLeave"
    >
      <li
        v-for="(item, i) in items"
        :key="item.id || item.label"
        class="app-navigation__item"
        @mouseenter="onHover(i)"
        @mouseleave="onLeave(i, $event)"
        @focusin="onHover(i)"
        @focusout="onLeave(i, $event)"
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
        <!-- стрелка — обычный элемент: есть только у активного пункта, поэтому не «залипает» -->
        <span v-if="i === activeIndex" class="app-navigation__arrow" aria-hidden="true">&gt;</span>
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
 * События: select(item), hover(item, index), leave() — когда курсор/фокус ушли с пункта
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
  emits: ['select', 'hover', 'leave'],
  setup(props, { emit }) {
    const activeIndex = ref(-1)
    const buttons = []

    const onHover = (i) => {
      activeIndex.value = i
      emit('hover', props.items[i], i)
    }

    // Стрелка «>» и подсветка не должны «залипать» после ухода курсора или фокуса
    const onLeave = (i, e) => {
      if (activeIndex.value !== i) return
      const li = e.currentTarget
      if (li.matches(':hover') || li.querySelector(':focus-visible')) return
      activeIndex.value = -1
      emit('leave')
    }

    // курсор ушёл со всего меню — гасим подсветку, если фокус не на пункте с клавиатуры
    const onListLeave = (e) => {
      if (activeIndex.value < 0) return
      const focused = e.currentTarget.querySelector(':focus-visible')
      if (focused) return
      activeIndex.value = -1
      emit('leave')
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

    return { activeIndex, buttons, onHover, onLeave, onListLeave, select }
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
  position: relative;
  display: flex;
  justify-content: center;
}

.app-navigation__arrow {
  position: absolute;
  right: 100%;
  top: 50%;
  margin-right: calc(var(--px) * 8);
  transform: translateY(-50%);
  line-height: 1;
  color: var(--color-violet-light);
  pointer-events: none;
  animation: blink 0.9s steps(1) infinite;
}
</style>
