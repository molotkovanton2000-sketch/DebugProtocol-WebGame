<template>
  <MenuScreen :lightning="lightning">
    <AppNavigation :items="items" aria-label="Главное меню" @select="onSelect" />

    <template #bottom>
      <MaskRow :count="3" :broken="difficulty ? 0 : 3" />
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
import { useSettingsStore } from '../stores/settings'

/**
 * Главное меню. 4 состояния:
 *  - сложность не выбрана → сломанные маски + молнии по углам;
 *  - easy / medium / hard → целые маски, молний тем больше, чем сложнее.
 */
export default {
  name: 'HomeView',
  components: { MenuScreen, AppNavigation, MaskRow },
  setup() {
    const router = useRouter()
    const settings = useSettingsStore()
    const { difficulty, difficultyConfig } = storeToRefs(settings)

    const lightning = computed(() => (difficultyConfig.value ? difficultyConfig.value.lightning : 'corners'))

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

    return { items, lightning, difficulty, onSelect }
  },
}
</script>
