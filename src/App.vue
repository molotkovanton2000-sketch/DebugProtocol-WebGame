<template>
  <div class="stage">
    <div class="stage__screen">
      <RouterView v-slot="{ Component, route }">
        <Transition name="screen-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script>
import { RouterView } from 'vue-router'

export default {
  name: 'App',
  components: { RouterView },
}
</script>
