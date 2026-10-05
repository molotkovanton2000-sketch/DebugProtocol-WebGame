<template>
  <header class="app-header">
    <RouterLink to="/" class="app-header__logo" aria-label="Debug protocol — на главную">
      Debug protocol
    </RouterLink>
    <div class="app-header__aside">
      <slot>
        <AppButton v-if="back" variant="ghost" class="app-header__back" @click="goBack">
          &lt; назад
        </AppButton>
      </slot>
    </div>
  </header>
</template>

<script>
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppButton from '../common/AppButton.vue'

/** Шапка: логотип «Debug protocol» + кнопка «назад» (и Esc). */
export default {
  name: 'AppHeader',
  components: { RouterLink, AppButton },
  props: {
    back: { type: Boolean, default: false },
    backTo: { type: String, default: '/' },
  },
  setup(props) {
    const router = useRouter()
    const goBack = () => router.push(props.backTo)

    const onKey = (e) => {
      if (props.back && e.key === 'Escape') goBack()
    }
    onMounted(() => window.addEventListener('keydown', onKey))
    onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

    return { goBack }
  },
}
</script>

<style>
.app-header {
  position: absolute;
  z-index: 3;
  top: calc(var(--px) * 95);
  left: calc(var(--px) * 100);
  right: calc(var(--px) * 90);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  pointer-events: none;
}

.app-header__logo {
  font-size: calc(var(--px) * 95);
  line-height: 1;
  letter-spacing: calc(var(--px) * 2);
  white-space: nowrap;
  pointer-events: auto;
}

.app-header__logo:hover,
.app-header__logo:focus-visible {
  outline: none;
  text-shadow: calc(var(--px) * 6) 0 0 var(--color-violet);
}

.app-header__aside {
  pointer-events: auto;
}

.app-header__back {
  margin-top: calc(var(--px) * 26);
  font-size: calc(var(--px) * 24);
}

@media (orientation: portrait) {
  .app-header {
    top: calc(var(--px) * 80);
    left: calc(var(--px) * 60);
    right: calc(var(--px) * 60);
    flex-direction: column;
    align-items: center;
    gap: calc(var(--px) * 30);
  }

  .app-header__logo {
    font-size: calc(var(--px) * 64);
  }

  .app-header__back {
    margin-top: 0;
    font-size: calc(var(--px) * 30);
  }
}
</style>
