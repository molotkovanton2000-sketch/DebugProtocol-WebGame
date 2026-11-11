<template>
  <MenuScreen :lightning="lightning">
    <AppNavigation :items="items" aria-label="Главное меню" @select="onSelect" />

    <template #bottom>
      <MaskRow :states="maskStates" :restore-index="restoreIndex" />
    </template>
  </MenuScreen>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import MenuScreen from '../components/layout/MenuScreen.vue'
import AppNavigation from '../components/layout/AppNavigation.vue'
import MaskRow from '../components/common/MaskRow.vue'
import { DIFFICULTY_ORDER, useSettingsStore } from '../stores/settings'

/**
 * Главное меню. Молнии зависят от выбранной сложности (по умолчанию — по углам).
 * Три маски — по одной на сложность: целой становится только после победы
 * над вирусом этой сложности (с анимацией «маска соединяется»).
 */
export default {
  name: 'HomeView',
  components: { MenuScreen, AppNavigation, MaskRow },
  setup() {
    const router = useRouter()
    const settings = useSettingsStore()
    const { difficulty, difficultyConfig, cleared } = storeToRefs(settings)

    const lightning = computed(() => (difficultyConfig.value ? difficultyConfig.value.lightning : 'corners'))

    const maskStates = computed(() => DIFFICULTY_ORDER.map((id) => (cleared.value[id] ? 'whole' : 'broken')))
    // индекс маски, которая только что починена (-1 — анимации нет)
    const restoreIndex = settings.consumePendingRestore()

    const items = [
      { id: 'play', label: 'играть' },
      { id: 'difficulty', label: 'сложность', to: '/difficulty' },
      { id: 'tutorial', label: 'туториал', to: '/tutorial' },
      { id: 'about', label: 'о нас', to: '/about' },
    ]

    const onSelect = (item) => {
      if (item.id !== 'play') return
      // Без выбранной сложности сначала отправляем её выбрать
      if (difficulty.value) router.push('/game')
      else router.push({ path: '/difficulty', query: { next: 'game' } })
    }

    return { items, lightning, difficulty, maskStates, restoreIndex, onSelect }
  },
}
</script>
