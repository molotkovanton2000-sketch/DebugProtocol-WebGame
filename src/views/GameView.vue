<template>
  <div class="game" :class="{ 'game--resizing': resizing }">
    <!-- ===== Верх: HP вируса, руки, босс, реплика ===== -->
    <section class="game__arena" aria-label="Вирус">
      <div
        class="game__hp"
        role="progressbar"
        aria-label="HP вируса"
        :aria-valuenow="boss.hp"
        aria-valuemin="0"
        :aria-valuemax="boss.maxHp"
      >
        <div class="game__hp-fill" :style="{ width: hpPercent + '%' }" />
      </div>

      <div class="game__info">
        <AppButton variant="ghost" class="game__exit" to="/">&lt; меню</AppButton>
        <span class="game__boss-name">{{ boss.name }}</span>
        <span class="game__info-line">фаза {{ boss.phaseIndex + 1 }}/{{ phaseCount }}</span>
        <span class="game__info-line">задача {{ Math.min(taskIndex + 1, tasks.length) }}/{{ tasks.length }}</span>
      </div>

      <BossAvatar class="game__boss" with-hands :mood="boss.mood" :phase="boss.phaseIndex + 1" :name="boss.name" />

      <p class="game__speech" aria-live="polite">
        <span>{{ typedSpeech }}</span><span class="game__caret" aria-hidden="true">_</span>
      </p>

      <div class="game__hud">
        <MaskRow :count="masks" :broken="brokenMasks" size="sm" />
        <span class="game__lives" :class="{ 'game__lives--low': mistakesLeft <= 2 }">
          ошибок: {{ mistakesLeft }}
        </span>
        <span class="game__difficulty">{{ difficultyLabel }}</span>
      </div>
    </section>

    <!-- ===== Низ: два окна с подвижной перегородкой ===== -->
    <section ref="panels" class="game__panels" :style="panelsStyle">
      <div class="game__panel game__panel--input">
        <AnswerInput
          ref="answerInput"
          :state="answerState"
          :multiline="isWriteTask"
          :placeholder="inputPlaceholder"
          :disabled="status !== 'playing'"
          @submit="onSubmit"
        />
      </div>

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

      <div class="game__panel game__panel--task">
        <button
          type="button"
          class="game__hint"
          :disabled="hintShown || status !== 'playing' || !currentTask"
          aria-label="подсказка"
          title="подсказка"
          @click="showHint"
        >
          !
        </button>

        <template v-if="currentTask">
          <p class="game__task-text">
            <span class="game__task-type">[{{ typeLabel(currentTask.type) }}]</span>
            {{ currentTask.description }}
          </p>
          <CodeDisplay
            :code="currentTask.code"
            :highlight-line="hintShown ? currentTask.errorLine : 0"
            :shake="answerState === 'error'"
          />
        </template>
        <p v-else class="game__task-text">все задачи решены</p>

        <BattleLog class="game__log" :entries="log" />
      </div>
    </section>

    <!-- Трещины от босса при ошибке -->
    <img v-if="cracksSrc" :key="cracksSrc" class="game__cracks pixelated" :src="cracksSrc" alt="" />

    <!-- ===== Конец боя ===== -->
    <Transition name="screen-fade">
      <div v-if="status !== 'playing'" class="game__banner" :class="`game__banner--${status}`">
        <img v-if="status === 'lost'" class="game__rift pixelated" src="/images/anim/rift-full.gif" alt="" />
        <span class="game__banner-text">{{ status === 'won' ? 'вирус уничтожен' : 'система заражена' }}</span>
      </div>
    </Transition>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore, DIFFICULTIES } from '../stores/settings'
import { useGame } from '../composables/useGame'
import AppButton from '../components/common/AppButton.vue'
import MaskRow from '../components/common/MaskRow.vue'
import BossAvatar from '../components/battle/BossAvatar.vue'
import CodeDisplay from '../components/battle/CodeDisplay.vue'
import AnswerInput from '../components/battle/AnswerInput.vue'
import BattleLog from '../components/battle/BattleLog.vue'
import { freshGif, preloadGif, releaseGif } from '../utils/freshGif'

const TYPE_LABELS = { syntax: 'синтаксис', logic: 'логика', write: 'написать код' }
const PRELOAD = ['boss-p2', 'boss-p2-appear', 'cracks', 'rift-full']

export default {
  name: 'GameView',
  components: { AppButton, MaskRow, BossAvatar, CodeDisplay, AnswerInput, BattleLog },
  setup() {
    const router = useRouter()
    const settings = useSettingsStore()
    const difficulty = settings.difficulty || 'easy'
    if (!settings.difficulty) settings.setDifficulty(difficulty)

    const game = useGame(difficulty)
    const phaseCount = (game.level.phases || []).length || 1
    const difficultyLabel = `сложность: ${DIFFICULTIES[difficulty].label}`
    const hpPercent = computed(() => Math.max(0, Math.min(100, (game.boss.hp / game.boss.maxHp) * 100)))

    // ---------- Ответ ----------
    const answerInput = ref(null)
    const answerState = ref('idle')
    const cracksSrc = ref('')
    let stateTimer = null
    let cracksTimer = null

    // трещины от босса при ошибке — каждый раз с первого кадра
    const showCracks = async () => {
      const src = await freshGif('/images/anim/cracks.gif')
      releaseGif(cracksSrc.value)
      cracksSrc.value = src
      clearTimeout(cracksTimer)
      cracksTimer = setTimeout(() => {
        releaseGif(cracksSrc.value)
        cracksSrc.value = ''
      }, 1000)
    }

    const onSubmit = (answer) => {
      const res = game.submit(answer)
      if (!res) return
      answerState.value = res.correct ? 'success' : 'error'
      clearTimeout(stateTimer)
      stateTimer = setTimeout(() => (answerState.value = 'idle'), 700)
      if (res.correct && answerInput.value) answerInput.value.clear()
      if (!res.correct) showCracks()
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
        }, 30)
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
      // победа чинит одну маску в меню (анимация — при возврате в меню)
      if (s === 'won') settings.markCleared(difficulty)
      endTimer = setTimeout(() => router.push(s === 'won' ? '/victory' : '/defeat'), s === 'won' ? 2200 : 2800)
    })

    // ---------- Подвижная перегородка ----------
    const panels = ref(null)
    const split = ref(50) // % ширины (или высоты в портрете) левого окна
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
    const inputPlaceholder = computed(() =>
      isWriteTask.value
        ? 'пиши код на js здесь\nctrl+enter — проверить'
        : 'пиши код на js здесь\nenter — проверить',
    )

    const panelsStyle = computed(() => ({ '--split': split.value }))

    const onKey = (e) => {
      if (e.key === 'Escape') router.push('/')
    }

    onMounted(() => {
      syncOrientation()
      mq.addEventListener('change', syncOrientation)
      window.addEventListener('keydown', onKey)
      answerInput.value && answerInput.value.focus()
      // прогреваем гифки 2-й фазы и эффектов, чтобы они стартовали без задержки
      PRELOAD.forEach((name) => {
        new Image().src = `/images/anim/${name}.gif`
      })
      preloadGif('/images/anim/cracks.gif')
    })

    onBeforeUnmount(() => {
      mq.removeEventListener('change', syncOrientation)
      window.removeEventListener('keydown', onKey)
      clearInterval(typeTimer)
      clearTimeout(stateTimer)
      clearTimeout(cracksTimer)
      releaseGif(cracksSrc.value)
      clearTimeout(endTimer)
    })

    return {
      ...game,
      phaseCount,
      difficultyLabel,
      hpPercent,
      answerInput,
      answerState,
      cracksSrc,
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
      inputPlaceholder,
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

/* ---------- Арена (макет Frame 2: 1920×1080, окна с y = 628) ---------- */
.game__arena {
  position: absolute;
  inset: 0 0 auto 0;
  height: calc(var(--px) * 628);
}

/* HP вируса — длинная полоса сверху */
.game__hp {
  position: absolute;
  z-index: 3;
  left: calc(var(--px) * 115);
  right: calc(var(--px) * 115);
  top: calc(var(--px) * 21);
  height: calc(var(--px) * 24);
  border-radius: calc(var(--px) * 12);
  background: #12001c;
  overflow: hidden;
}

.game__hp-fill {
  height: 100%;
  border-radius: calc(var(--px) * 12);
  background: #8800ff;
  box-shadow: 0 0 calc(var(--px) * 16) var(--color-neon-glow);
  transition: width 500ms steps(10, end);
}

.game .game__boss {
  --boss-scale: 7;
  position: absolute;
  z-index: 1;
  left: calc(50% - var(--px) * 280);
  /* низ тела прячется за рамкой окон */
  top: calc(var(--px) * 118);
}

/* Левая колонка: выход и сведения о бое */
.game__info {
  position: absolute;
  z-index: 3;
  left: calc(var(--px) * 60);
  top: calc(var(--px) * 80);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--px) * 12);
}

.game__exit {
  padding: calc(var(--px) * 8) calc(var(--px) * 12);
  font-size: calc(var(--px) * 16);
  border-width: calc(var(--px) * 4);
}

.game__boss-name {
  font-size: calc(var(--px) * 16);
  line-height: 1.5;
  max-width: calc(var(--px) * 190);
}

.game__info-line {
  font-size: calc(var(--px) * 13);
  color: var(--color-text-muted);
}

/* Реплика вируса — внизу слева, под рукой */
.game__speech {
  position: absolute;
  z-index: 2;
  left: calc(var(--px) * 60);
  bottom: calc(var(--px) * 18);
  width: calc(var(--px) * 400);
  font-size: calc(var(--px) * 20);
  line-height: 1.55;
  text-transform: lowercase;
  text-shadow:
    calc(var(--px) * 3) calc(var(--px) * 3) 0 #000,
    calc(var(--px) * -3) calc(var(--px) * -3) 0 #000;
}

.game__caret {
  animation: blink 0.8s steps(1) infinite;
  color: var(--color-violet-light);
}

/* Маски, счётчик ошибок — справа сверху */
.game__hud {
  position: absolute;
  z-index: 3;
  right: calc(var(--px) * 60);
  top: calc(var(--px) * 80);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--px) * 14);
}

.game__lives {
  font-size: calc(var(--px) * 18);
  text-transform: lowercase;
}

.game__lives--low {
  color: var(--color-danger);
  animation: flicker 1.6s steps(1) infinite;
}

.game__difficulty {
  font-size: calc(var(--px) * 13);
  color: var(--color-text-muted);
}

/* ---------- Окна: фиолетовая рамка с перегородкой ---------- */
.game__panels {
  --split: 50;
  --gap: calc(var(--px) * 10);
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  top: calc(var(--px) * 628);
  bottom: 0;
  display: grid;
  grid-template-columns: calc((100% - var(--gap)) * var(--split) / 100) var(--gap) 1fr;
  padding: var(--gap) var(--gap) 0;
  border-radius: calc(var(--px) * 40) calc(var(--px) * 40) 0 0;
  background: var(--color-neon);
  box-shadow: 0 0 calc(var(--px) * 24) var(--color-neon-glow);
}

.game__panel {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--px) * 16);
  padding: calc(var(--px) * 18) calc(var(--px) * 20) 0;
  border-radius: calc(var(--px) * 30) calc(var(--px) * 30) 0 0;
  background: #000;
  overflow: hidden;
}

.game__panel--input {
  padding: calc(var(--px) * 18) calc(var(--px) * 12) 0 calc(var(--px) * 12);
}

.game__panel--task {
  padding-right: calc(var(--px) * 76);
}

/* «!» — подсказка */
.game__hint {
  position: absolute;
  z-index: 2;
  top: calc(var(--px) * 14);
  right: calc(var(--px) * 16);
  width: calc(var(--px) * 40);
  height: calc(var(--px) * 40);
  display: grid;
  place-items: center;
  padding: calc(var(--px) * 2) 0 0 calc(var(--px) * 2);
  border: calc(var(--px) * 4) solid #fff;
  border-radius: 50%;
  font-size: calc(var(--px) * 20);
  color: #fff;
  transition: background var(--transition-fast) steps(2), border-color var(--transition-fast) steps(2);
}

.game__hint:hover:not(:disabled),
.game__hint:focus-visible {
  outline: none;
  border-color: var(--color-neon);
  background: var(--color-neon);
}

.game__hint:disabled {
  opacity: 0.35;
}

.game__task-text {
  flex: none;
  font-size: calc(var(--px) * 16);
  line-height: 1.7;
  color: var(--color-text-muted);
}

.game__task-type {
  color: var(--color-violet-light);
}

.game__panel--task .code-display {
  flex: 0 1 auto;
  max-height: 55%;
  border-top-width: calc(var(--px) * 3);
  border-bottom-width: calc(var(--px) * 3);
  padding: calc(var(--px) * 10) 0;
}

.game__panel--task .code-display__lines {
  font-size: calc(var(--px) * 18);
}

/* Комментарии внизу: занимают всё оставшееся место окна */
.game__log {
  flex: 1 1 0;
  min-height: calc(var(--px) * 170);
  padding-bottom: calc(var(--px) * 14);
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
  width: calc(var(--px) * 4);
  height: calc(var(--px) * 90);
  transform: translate(-50%, -50%);
  background: repeating-linear-gradient(
    to bottom,
    #fff 0 calc(var(--px) * 10),
    transparent calc(var(--px) * 10) calc(var(--px) * 18)
  );
  opacity: 0.35;
  transition: opacity 120ms steps(2);
}

.game__splitter:hover .game__splitter-grip,
.game__splitter:focus-visible .game__splitter-grip,
.game--resizing .game__splitter-grip {
  opacity: 1;
}

/* ---------- Трещины от босса ---------- */
.game__cracks {
  position: absolute;
  z-index: 5;
  left: calc(50% - var(--px) * 200);
  top: calc(var(--px) * 470);
  width: calc(var(--px) * 400);
  height: auto;
  opacity: 0.9;
  pointer-events: none;
  animation: fade-in 120ms steps(2) 1;
}

/* ---------- Баннер окончания ---------- */
.game__banner {
  position: absolute;
  z-index: 40;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.72);
  text-transform: uppercase;
  text-align: center;
}

.game__banner-text {
  position: relative;
  font-size: calc(var(--px) * 76);
  animation: glitch 300ms var(--ease-glitch) 3;
}

.game__banner--won {
  color: var(--color-success);
}

.game__banner--lost {
  color: var(--color-danger);
}

/* разлом расползается по экрану */
.game__rift {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--px) * 1920);
  height: auto;
  opacity: 0.8;
  transform: translate(-50%, -50%) scale(0.05);
  animation: rift-grow 1.6s steps(12, end) forwards;
}

@keyframes rift-grow {
  to { transform: translate(-50%, -50%) scale(1.3); }
}

/* ---------- Портрет: окна друг под другом ---------- */
@media (orientation: portrait) {
  .game__arena {
    height: calc(var(--px) * 780);
  }

  .game__hp {
    left: calc(var(--px) * 60);
    right: calc(var(--px) * 60);
  }

  /* босс стоит на рамке окон: низ тела прячется за ней */
  .game .game__boss {
    --boss-scale: 5.5;
    left: calc(50% - var(--px) * 220);
    top: calc(var(--px) * 380);
  }

  .game__info {
    left: calc(var(--px) * 40);
    top: calc(var(--px) * 80);
  }

  .game__hud {
    right: calc(var(--px) * 40);
    top: calc(var(--px) * 80);
  }

  /* реплика — под шапкой, над боссом */
  .game__speech {
    left: calc(var(--px) * 50);
    top: calc(var(--px) * 250);
    bottom: auto;
    width: calc(var(--px) * 980);
    font-size: calc(var(--px) * 26);
  }

  .game__panels {
    top: calc(var(--px) * 780);
    grid-template-columns: 1fr;
    grid-template-rows: calc((100% - var(--gap) - var(--px) * 10) * var(--split) / 100) var(--gap) 1fr;
  }

  .game__panel--input {
    padding: calc(var(--px) * 14) calc(var(--px) * 10) 0;
  }

  .game__panel--task {
    padding-right: calc(var(--px) * 90);
  }

  .game__hint {
    width: calc(var(--px) * 56);
    height: calc(var(--px) * 56);
    font-size: calc(var(--px) * 28);
  }

  .game__task-text {
    font-size: calc(var(--px) * 22);
  }

  .game__panel--task .code-display__lines {
    font-size: calc(var(--px) * 24);
  }

  .game__log {
    min-height: calc(var(--px) * 220);
  }

  .battle-log {
    font-size: calc(var(--px) * 22);
  }

  .answer-input {
    --line: calc(var(--px) * 52);
  }

  .answer-input__field {
    font-size: calc(var(--px) * 28);
  }

  .answer-input__gutter {
    width: calc(var(--px) * 80);
    font-size: calc(var(--px) * 22);
  }

  .answer-input__field::placeholder {
    font-size: calc(var(--px) * 22);
  }

  .game__splitter {
    cursor: row-resize;
  }

  .game__splitter-grip {
    width: calc(var(--px) * 120);
    height: calc(var(--px) * 4);
    background: repeating-linear-gradient(
      to right,
      #fff 0 calc(var(--px) * 10),
      transparent calc(var(--px) * 10) calc(var(--px) * 18)
    );
  }

  .game--resizing {
    cursor: row-resize;
  }

  .game__cracks {
    left: calc(50% - var(--px) * 260);
    top: calc(var(--px) * 560);
    width: calc(var(--px) * 520);
  }

  .game__rift {
    width: calc(var(--px) * 1500);
  }
}
</style>
