<template>
  <MenuScreen lightning="corners" back :offset="90">
    <section class="rules" aria-labelledby="rules-title">
      <h1 id="rules-title" class="rules__title">туториал</h1>
      <ol class="rules__list">
        <li v-for="(rule, i) in rules" :key="i" class="rules__item">
          <span class="rules__num">{{ i + 1 }}</span>
          <span>{{ rule }}</span>
        </li>
      </ol>
      <AppButton variant="primary" class="rules__play" :to="playLink">понятно, играть</AppButton>
    </section>
  </MenuScreen>
</template>

<script>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import MenuScreen from '../components/layout/MenuScreen.vue'
import AppButton from '../components/common/AppButton.vue'
import { useSettingsStore } from '../stores/settings'

/** Туториал: правила игры. */
export default {
  name: 'RulesView',
  components: { MenuScreen, AppButton },
  setup() {
    const { difficulty } = storeToRefs(useSettingsStore())
    const playLink = computed(() =>
      difficulty.value ? '/game' : { path: '/difficulty', query: { next: 'game' } },
    )

    const rules = [
      'вирус деформировал твой код. справа — задача с ошибкой.',
      'найди строку с ошибкой и введи её исправленную версию слева.',
      'верный ответ ранит вирус. ошибка — вирус разбивает твою маску.',
      'разбиты все маски — система заражена. обнули hp вируса — победа.',
      'перегородку между окнами можно двигать мышью.',
    ]
    return { rules, playLink }
  },
}
</script>

<style>
.rules {
  width: calc(var(--px) * 820);
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 34);
}

.rules__title {
  font-size: calc(var(--px) * 58);
  font-weight: 400;
  text-transform: uppercase;
}

.rules__list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 22);
  font-size: calc(var(--px) * 20);
  line-height: 1.75;
}

.rules__item {
  display: flex;
  gap: calc(var(--px) * 22);
}

.rules__num {
  flex: none;
  color: var(--color-violet-light);
}

.rules__play {
  align-self: flex-start;
}

@media (orientation: portrait) {
  .rules {
    width: calc(var(--px) * 940);
  }

  .rules__list {
    font-size: calc(var(--px) * 30);
  }
}
</style>
