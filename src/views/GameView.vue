<template>
  <div class="game" :class="{ 'game--resizing': resizing }">
    <!-- ===== Верх: вирус, руки, реплика ===== -->
    <section class="game__arena" aria-label="Вирус">
      <BossAvatar class="game__boss" :size="672" with-hands :mood="boss.mood" :name="boss.name" />

      <p class="game__speech" aria-live="polite">
        <span>{{ typedSpeech }}</span><span class="game__caret" aria-hidden="true">_</span>
      </p>

      <div class="game__hud">
        <div class="game__hud-top">
          <AppButton variant="ghost" class="game__exit" to="/">&lt; меню</AppButton>
          <span class="game__difficulty">{{ difficultyLabel }}</span>
        </div>
        <BossHp
          :name="boss.name"
          :hp="boss.hp"
          :max-hp="boss.maxHp"
          :phase="boss.phaseIndex + 1"
          :phase-count="phaseCount"
        />
        <div class="game__player">
          <span class="game__player-label">твои маски</span>
          <MaskRow :count="masks" :broken="brokenMasks" size="sm" />
          <HpBar :current="player.hp" :max="player.maxHp" variant="player" :segments="3" />
        </div>
      </div>
    </section>

    <!-- ===== Низ: две панели с подвижной перегородкой ===== -->
    <section ref="panels" class="game__panels" :style="panelsStyle">
      <AppCard class="game__panel game__panel--input" glow>
        <template #header>
          <h2 class="app-card__title">ввод кода</h2>
        </template>
        <AnswerInput
          ref="answerInput"
          :state="answerState"
          :multiline="isWriteTask"
          :label="isWriteTask ? 'напиши код целиком (ctrl+enter):' : 'введи исправленную строку:'"
          :placeholder="isWriteTask ? 'function ...' : 'let x = ...'"
          :disabled="status !== 'playing'"
          @submit="onSubmit"
        >
          <template #actions>
            <AppButton variant="ghost" :disabled="hintShown || status !== 'playing'" @click="showHint">
              подсказка
            </AppButton>
          </template>
        </AnswerInput>
        <BattleLog :entries="log" />
      </AppCard>

      <div
        class="game__splitter"
        role="separator"
        tabindex="0"
        :aria-orientation="isPortrait ? 'horizontal' : 'vertical'"
        aria-label="Перегородка между окнами"
        :aria-valuenow="Math.round(split)"
        aria-valuemin="30"
        aria-valuemax="70"
        @pointerdown="startResize"
        @keydown="onSplitterKey"
        @dblclick="split = 50"
      >
        <span class="game__splitter-grip" />
      </div>

      <AppCard class="game__panel game__panel--task" glow>
        <template #header>
          <div class="game__task-head">
            <h2 class="app-card__title">задача {{ Math.min(taskIndex + 1, tasks.length) }}/{{ tasks.length }}</h2>
            <span v-if="currentTask" class="game__task-type">{{ typeLabel(currentTask.type) }}</span>
          </div>
        </template>
        <template v-if="currentTask">
          <p class="game__task-text">
            {{ isWriteTask ? 'напиши функцию по условию — её проверят тестами' : 'найди ошибку и введи исправленную строку целиком' }}
          </p>
          <CodeDisplay
            :code="currentTask.code"
            :highlight-line="hintShown ? currentTask.errorLine : 0"
            :shake="answerState === 'error'"
          />
        </template>
        <p v-else class="game__task-text">все задачи решены</p>
      </AppCard>
    </section>

    <!-- ===== Конец боя ===== -->
    <Transition name="screen-fade">
      <div v-if="status !== 'playing'" class="game__banner" :class="`game__banner--${status}`">
        {{ status === 'won' ? 'вирус уничтожен' : 'система заражена' }}
      </div>
    </Transition>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore, DIFFICULTIES } from '../stores/settings'
import { useGame } from '../composables/useGame'
import AppCard from '../components/common/AppCard.vue'
import AppButton from '../components/common/AppButton.vue'
import MaskRow from '../components/common/MaskRow.vue'
import HpBar from '../components/common/HpBar.vue'
import BossAvatar from '../components/battle/BossAvatar.vue'
import BossHp from '../components/battle/BossHp.vue'
import CodeDisplay from '../components/battle/CodeDisplay.vue'
import AnswerInput from '../components/battle/AnswerInput.vue'
import BattleLog from '../components/battle/BattleLog.vue'

const TYPE_LABELS = { syntax: 'синтаксис', logic: 'логика', write: 'написать код' }

export default {
  name: 'GameView',
  components: { AppCard, AppButton, MaskRow, HpBar, BossAvatar, BossHp, CodeDisplay, AnswerInput, BattleLog },
  setup() {
    const router = useRouter()
    const settings = useSettingsStore()
    const difficulty = settings.difficulty || 'easy'
    if (!settings.difficulty) settings.setDifficulty(difficulty)

    const game = useGame(difficulty)
    const phaseCount = (game.level.phases || []).length || 1
    const difficultyLabel = `сложность: ${DIFFICULTIES[difficulty].label}`

    // ---------- Ответ ----------
    const answerInput = ref(null)
    const answerState = ref('idle')
    let stateTimer = null

    const onSubmit = (answer) => {
      const res = game.submit(answer)
      if (!res) return
      answerState.value = res.correct ? 'success' : 'error'
      clearTimeout(stateTimer)
      stateTimer = setTimeout(() => (answerState.value = 'idle'), 700)
      if (res.correct && answerInput.value) answerInput.value.clear()
    }

    // ---------- Реплика вируса с эффектом печати ----------
    const typedSpeech = ref('')
    let typeTimer = null
    watch(
      game.speech,
      (text) => {
        clearInterval(typeTimer)
        typedSpeech.value = ''
        let i = 0
        typeTimer = setInterval(() => {
          typedSpeech.value = text.slice(0, ++i)
          if (i >= text.length) clearInterval(typeTimer)
        }, 35)
      },
      { immediate: true },
    )

    // ---------- Конец боя ----------
    let endTimer = null
    watch(game.status, (s) => {
      if (s === 'playing') return
      settings.setResult({
        status: s,
        difficulty,
        boss: game.boss.name,
        correct: game.stats.correct,
        mistakes: game.stats.mistakes,
        hints: game.stats.hints,
        seconds: Math.round((Date.now() - game.stats.startedAt) / 1000),
      })
      endTimer = setTimeout(() => router.push(s === 'won' ? '/victory' : '/defeat'), 2200)
    })

    // ---------- Подвижная перегородка ----------
    const panels = ref(null)
    const split = ref(50) // % ширины (или высоты в портрете) левой панели
    const resizing = ref(false)
    const isPortrait = ref(false)
    const mq = window.matchMedia('(orientation: portrait)')
    const syncOrientation = () => (isPortrait.value = mq.matches)

    const clampSplit = (v) => Math.min(70, Math.max(30, v))

    const startResize = (e) => {
      if (e.button !== undefined && e.button !== 0) return
      e.preventDefault()
      resizing.value = true
      const el = e.currentTarget
      el.setPointerCapture && el.setPointerCapture(e.pointerId)

      const move = (ev) => {
        const rect = panels.value.getBoundingClientRect()
        split.value = clampSplit(
          isPortrait.value
            ? ((ev.clientY - rect.top) / rect.height) * 100
            : ((ev.clientX - rect.left) / rect.width) * 100,
        )
      }
      const up = () => {
        resizing.value = false
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', up)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
    }

    const onSplitterKey = (e) => {
      const step = e.shiftKey ? 10 : 3
      if (['ArrowLeft', 'ArrowUp'].includes(e.key)) split.value = clampSplit(split.value - step)
      else if (['ArrowRight', 'ArrowDown'].includes(e.key)) split.value = clampSplit(split.value + step)
      else return
      e.preventDefault()
    }

    const isWriteTask = computed(() => game.currentTask.value?.type === 'write')

    const panelsStyle = computed(() => ({ '--split': split.value }))

    const onKey = (e) => {
      if (e.key === 'Escape') router.push('/')
    }

    onMounted(() => {
      syncOrientation()
      mq.addEventListener('change', syncOrientation)
      window.addEventListener('keydown', onKey)
      answerInput.value && answerInput.value.focus()
    })

    onBeforeUnmount(() => {
      mq.removeEventListener('change', syncOrientation)
      window.removeEventListener('keydown', onKey)
      clearInterval(typeTimer)
      clearTimeout(stateTimer)
      clearTimeout(endTimer)
    })

    return {
      ...game,
      phaseCount,
      difficultyLabel,
      answerInput,
      answerState,
      onSubmit,
      typedSpeech,
      panels,
      split,
      resizing,
      isPortrait,
      startResize,
      onSplitterKey,
      panelsStyle,
      isWriteTask,
      typeLabel: (t) => TYPE_LABELS[t] || t,
    }
  },
}
</script>

<style>
.game {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.game--resizing {
  cursor: col-resize;
  user-select: none;
}

/* ---------- Арена ---------- */
.game__arena {
  position: absolute;
  inset: 0 0 auto 0;
  height: calc(var(--px) * 540);
}

.game .game__boss {
  position: absolute;
  left: calc(var(--px) * 624);
  top: calc(var(--px) * -32);
}

.game__speech {
  position: absolute;
  z-index: 2;
  left: calc(var(--px) * 70);
  top: calc(var(--px) * 64);
  width: calc(var(--px) * 520);
  font-size: calc(var(--px) * 34);
  line-height: 1.55;
  text-transform: lowercase;
  text-shadow:
    calc(var(--px) * 4) calc(var(--px) * 4) 0 #000,
    calc(var(--px) * -4) calc(var(--px) * -4) 0 #000;
}

.game__caret {
  animation: blink 0.8s steps(1) infinite;
  color: var(--color-violet-light);
}

/* HUD справа от руки вируса */
.game__hud {
  position: absolute;
  z-index: 2;
  right: calc(var(--px) * 36);
  top: calc(var(--px) * 36);
  width: calc(var(--px) * 300);
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 26);
}

.game__hud-top {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--px) * 10);
}

.game__player .hp-bar__track {
  height: calc(var(--px) * 18);
  border-width: calc(var(--px) * 4);
}

.game__difficulty {
  font-size: calc(var(--px) * 14);
  line-height: 1.6;
  color: var(--color-text-muted);
}

.game__exit {
  padding: calc(var(--px) * 10) calc(var(--px) * 14);
  font-size: calc(var(--px) * 18);
}

.game__player {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--px) * 14);
}

.game__hud .boss-hp__name {
  font-size: calc(var(--px) * 22);
}

.game__player-label {
  font-size: calc(var(--px) * 18);
  text-transform: uppercase;
}

/* ---------- Панели ---------- */
.game__panels {
  --split: 50;
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--px) * 540);
  bottom: 0;
  display: grid;
  grid-template-columns:
    calc((100% - var(--px) * 14) * var(--split) / 100)
    calc(var(--px) * 14)
    1fr;
}

.game__panel {
  min-width: 0;
}

.game__panel--input .app-card__body {
  gap: calc(var(--px) * 24);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-neon) transparent;
}

.game__panel--input .battle-log {
  min-height: calc(var(--px) * 60);
}

.game__splitter {
  position: relative;
  cursor: col-resize;
  touch-action: none;
  outline: none;
}

.game__splitter-grip {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--px) * 8);
  height: calc(var(--px) * 90);
  transform: translate(-50%, -50%);
  background: repeating-linear-gradient(
    to bottom,
    var(--color-neon) 0 calc(var(--px) * 10),
    transparent calc(var(--px) * 10) calc(var(--px) * 18)
  );
  opacity: 0.45;
  transition: opacity 120ms steps(2);
}

.game__splitter:hover .game__splitter-grip,
.game__splitter:focus-visible .game__splitter-grip,
.game--resizing .game__splitter-grip {
  opacity: 1;
  box-shadow: 0 0 calc(var(--px) * 14) var(--color-neon);
}

.game__task-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: calc(var(--px) * 16);
}

.game__task-type {
  padding: calc(var(--px) * 8) calc(var(--px) * 12);
  border: calc(var(--px) * 3) solid var(--color-violet);
  font-size: calc(var(--px) * 15);
  color: var(--color-violet-light);
}

.game__task-text {
  flex: none;
  font-size: calc(var(--px) * 20);
  line-height: 1.7;
  color: var(--color-text-muted);
}

/* ---------- Баннер окончания ---------- */
.game__banner {
  position: absolute;
  z-index: 40;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.72);
  font-size: calc(var(--px) * 76);
  text-transform: uppercase;
  text-align: center;
  animation: glitch 300ms var(--ease-glitch) 3;
}

.game__banner--won {
  color: var(--color-success);
}

.game__banner--lost {
  color: var(--color-danger);
}

/* ---------- Портрет: окна друг под другом ---------- */
@media (orientation: portrait) {
  .game__arena {
    height: calc(var(--px) * 760);
  }

  .game .game__boss {
    left: calc(var(--px) * 330);
    top: calc(var(--px) * 300);
    --boss-size: 420 !important;
  }

  .game__speech {
    left: calc(var(--px) * 50);
    top: calc(var(--px) * 40);
    width: calc(var(--px) * 520);
    font-size: calc(var(--px) * 30);
  }

  .game__hud {
    right: calc(var(--px) * 40);
    top: calc(var(--px) * 40);
    width: calc(var(--px) * 420);
  }

  .game__panels {
    top: calc(var(--px) * 760);
    grid-template-columns: 1fr;
    grid-template-rows:
      calc((100% - var(--px) * 24) * var(--split) / 100)
      calc(var(--px) * 24)
      1fr;
  }

  .game__splitter {
    cursor: row-resize;
  }

  .game__splitter-grip {
    width: calc(var(--px) * 120);
    height: calc(var(--px) * 8);
    background: repeating-linear-gradient(
      to right,
      var(--color-neon) 0 calc(var(--px) * 10),
      transparent calc(var(--px) * 10) calc(var(--px) * 18)
    );
  }

  .game--resizing {
    cursor: row-resize;
  }
}
</style>
