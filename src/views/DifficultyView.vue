<template>
  <MenuScreen :lightning="previewLightning" back :offset="-40">
    <AppNavigation
      :items="items"
      :font-size="84"
      :gap="56"
      aria-label="Выбор сложности"
      @hover="onHover"
      @select="onSelect"
    />

    <template #bottom>
      <StarRow :count="3" :lit="litStars" />
    </template>
  </MenuScreen>
</template>

<script>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import MenuScreen from '../components/layout/MenuScreen.vue'
import AppNavigation from '../components/layout/AppNavigation.vue'
import StarRow from '../components/common/StarRow.vue'
import { DIFFICULTIES, useSettingsStore } from '../stores/settings'

/**
 * Выбор сложности. При наведении на пункт подсвечиваются звёзды (1/2/3)
 * и молнии по краям показывают, как будет выглядеть меню.
 */
export default {
  name: 'DifficultyView',
  components: { MenuScreen, AppNavigation, StarRow },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const settings = useSettingsStore()
    const { difficultyConfig } = storeToRefs(settings)

    const hovered = ref(null)
    const items = Object.values(DIFFICULTIES).map((d) => ({ id: d.id, label: d.label }))

    const current = computed(() => (hovered.value ? DIFFICULTIES[hovered.value] : difficultyConfig.value))
    const litStars = computed(() => (current.value ? current.value.stars : 3))
    const previewLightning = computed(() => (current.value ? current.value.lightning : 'corners'))

    const onHover = (item) => {
      hovered.value = item.id
    }

    const onSelect = (item) => {
      settings.setDifficulty(item.id)
      router.push(route.query.next === 'game' ? '/game' : '/')
    }

    return { items, litStars, previewLightning, onHover, onSelect }
  },
}
</script>
