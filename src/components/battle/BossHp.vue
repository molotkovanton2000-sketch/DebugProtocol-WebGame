<template>
  <div class="boss-hp">
    <p class="boss-hp__name">{{ name }}</p>
    <p v-if="phaseCount > 1" class="boss-hp__phase">фаза {{ phase }}/{{ phaseCount }}</p>
    <HpBar :current="hp" :max="maxHp" variant="boss" />
  </div>
</template>

<script>
import HpBar from '../common/HpBar.vue'

/** HP босса с именем и фазой. */
export default {
  name: 'BossHp',
  components: { HpBar },
  props: {
    name: { type: String, default: '' },
    hp: { type: Number, required: true },
    maxHp: { type: Number, required: true },
    phase: { type: Number, default: 1 },
    phaseCount: { type: Number, default: 1 },
  },
}
</script>

<style>
.boss-hp__name {
  font-size: calc(var(--px) * 30);
  line-height: 1.2;
  text-transform: lowercase;
}

.boss-hp__phase {
  margin: calc(var(--px) * 10) 0 calc(var(--px) * 16);
  font-size: calc(var(--px) * 18);
  color: var(--color-violet-light);
}
</style>
