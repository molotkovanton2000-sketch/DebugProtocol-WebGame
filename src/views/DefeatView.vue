<template>
  <MenuScreen lightning="medium" boss-mood="idle">
    <ResultPanel
      title="система заражена"
      tone="danger"
      :result="result"
      @retry="retry"
    />
  </MenuScreen>
</template>

<script>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import MenuScreen from '../components/layout/MenuScreen.vue'
import ResultPanel from '../components/layout/ResultPanel.vue'
import { useSettingsStore } from '../stores/settings'

/** Экран поражения. */
export default {
  name: 'DefeatView',
  components: { MenuScreen, ResultPanel },
  setup() {
    const router = useRouter()
    const { lastResult } = storeToRefs(useSettingsStore())
    return { result: lastResult, retry: () => router.push('/game') }
  },
}
</script>
