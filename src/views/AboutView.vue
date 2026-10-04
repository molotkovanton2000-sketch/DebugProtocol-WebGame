<template>
  <MenuScreen lightning="corners" back :offset="-20">
    <AppNavigation :items="links" :font-size="88" :gap="52" aria-label="Мы в сети" />

    <template #bottom>
      <StarRow :count="3" :lit="3" />
    </template>

    <template #overlay>
      <AppFooter>© {{ year }} Debug Protocol · тимлид, Андрей, Артём, Лёха</AppFooter>
    </template>
  </MenuScreen>
</template>

<script>
import MenuScreen from '../components/layout/MenuScreen.vue'
import AppNavigation from '../components/layout/AppNavigation.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import StarRow from '../components/common/StarRow.vue'

// TODO: заменить ссылки Telegram и VK на реальные, когда появятся
const LINKS = [
  { id: 'github', label: 'github', href: 'https://github.com/molotkovanton2000-sketch/DebugProtocol-WebGame' },
  { id: 'telegram', label: 'telegram', href: 'https://t.me/' },
  { id: 'vk', label: 'vk', href: 'https://vk.com/' },
]

/** Экран «О нас»: ссылки на GitHub, Telegram, VK. */
export default {
  name: 'AboutView',
  components: { MenuScreen, AppNavigation, AppFooter, StarRow },
  setup() {
    return { links: LINKS, year: new Date().getFullYear() }
  },
}
</script>
