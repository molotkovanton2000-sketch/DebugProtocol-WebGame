<template>
  <MenuScreen lightning="none" boss-mood="defeated">
    <ResultPanel
      title="система очищена"
      tone="success"
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

/** Экран победы. */
export default {
  name: 'VictoryView',
  components: { MenuScreen, ResultPanel },
  setup() {
    const router = useRouter()
    const { lastResult } = storeToRefs(useSettingsStore())
    return { result: lastResult, retry: () => router.push('/game') }
  },
}
</script>
