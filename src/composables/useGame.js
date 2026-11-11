import { computed, reactive, ref } from 'vue'
import { useLevels } from './useLevels'
import { useValidation } from './useValidation'

const PLAYER_MAX_HP = 100
const MASKS = 3

/** «1 ошибка», «2 ошибки», «5 ошибок» */
const plural = (n, one, few, many) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

const pick = (arr) => (Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random() * arr.length)] : '')

/**
 * Основной игровой цикл: босс, HP игрока, текущее задание, лог боя.
 * Базовая версия для вёрстки — тимлид может расширять.
 */
export function useGame(difficulty = 'easy') {
  const { getLevel } = useLevels()
  const { isCorrect } = useValidation()

  const level = getLevel(difficulty)
  const phases = level.phases || []
  const tasks = level.tasks || []

  const boss = reactive({
    name: level.name,
    description: level.description,
    maxHp: phases[0]?.hp ?? 100,
    hp: phases[0]?.hp ?? 100,
    phaseIndex: 0,
    mood: 'idle',
  })

  const player = reactive({ hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP })

  const taskIndex = ref(0)
  const status = ref('playing') // playing | won | lost
  const speech = ref('')
  const log = ref([])
  const hintShown = ref(false)
  const stats = reactive({ correct: 0, mistakes: 0, hints: 0, startedAt: Date.now() })

  const phase = computed(() => phases[boss.phaseIndex] || phases[0] || {})
  const currentTask = computed(() => tasks[taskIndex.value] || null)
  // Сколько ошибок осталось до захвата: HP игрока / урон по игроку в текущей фазе
  const mistakesLeft = computed(() => Math.ceil(player.hp / (phase.value.damageToPlayer || 10)))
  const brokenMasks = computed(() => MASKS - Math.ceil((player.hp / player.maxHp) * MASKS))

  const say = (event) => {
    const lines = level.dialogue?.phases?.[boss.phaseIndex]?.dialogue?.[event]
    const line = pick(lines)
    if (line) speech.value = line
  }

  const addLog = (type, text) => {
    log.value.unshift({ id: Date.now() + Math.random(), type, text })
    if (log.value.length > 30) log.value.pop()
  }

  let moodTimer = null
  const setMood = (mood, ms = 600) => {
    boss.mood = mood
    clearTimeout(moodTimer)
    moodTimer = setTimeout(() => {
      if (status.value === 'playing') boss.mood = 'idle'
    }, ms)
  }

  const finish = (result) => {
    status.value = result
    boss.mood = result === 'won' ? 'defeated' : 'attack'
    say(result === 'won' ? 'onDefeat' : 'onPlayerDefeat')
  }

  const submit = (answer) => {
    if (status.value !== 'playing' || !currentTask.value) return null
    const task = currentTask.value

    if (isCorrect(answer, task)) {
      const isLastTask = taskIndex.value >= tasks.length - 1
      const damage = isLastTask ? boss.hp : phase.value.damageToBoss ?? 20
      boss.hp = Math.max(0, boss.hp - damage)
      stats.correct++
      addLog('success', `+ верно! урон вирусу: ${damage}`)
      if (task.explanation) addLog('info', task.explanation)
      setMood('hurt')

      if (boss.hp <= 0) {
        finish('won')
        return { correct: true, finished: true }
      }

      // Переход во вторую фазу
      const threshold = phases[0]?.phaseThreshold
      if (boss.phaseIndex === 0 && threshold != null && boss.hp <= threshold && phases[1]) {
        say('onPhaseChange')
        boss.phaseIndex = 1
        addLog('error', '! вирус перешёл во вторую фазу')
      } else {
        say('onDamage')
      }

      taskIndex.value++
      hintShown.value = false
      return { correct: true, finished: false }
    }

    const damage = phase.value.damageToPlayer ?? 10
    player.hp = Math.max(0, player.hp - damage)
    stats.mistakes++
    addLog('error', `- ошибка. вирус бьёт на ${damage}`)
    setMood('attack', 500)

    if (player.hp > 0) {
      const n = mistakesLeft.value
      const word = plural(n, 'ошибка', 'ошибки', 'ошибок')
      speech.value =
        n === 1
          ? pick(['последняя ошибка — и твой комп станет моим!', 'одна ошибка — и я захвачу твой комп!'])
          : pick([
              `у тебя осталось всего ${n} ${word}, и я полностью захвачу твой комп!`,
              `ещё ${n} ${word} — и твой комп мой!`,
              `осталось ${n} ${word}. потом я захвачу твой комп!`,
            ])
    }

    if (player.hp <= 0) {
      finish('lost')
      return { correct: false, finished: true }
    }
    return { correct: false, finished: false }
  }

  const showHint = () => {
    if (!currentTask.value || hintShown.value) return
    hintShown.value = true
    stats.hints++
    addLog('info', `подсказка: ${currentTask.value.hint}`)
  }

  // Старт боя
  say('start')
  addLog('info', `вирус «${level.name}» атакует систему`)

  return {
    level,
    boss,
    player,
    phase,
    tasks,
    taskIndex,
    currentTask,
    brokenMasks,
    mistakesLeft,
    masks: MASKS,
    status,
    speech,
    log,
    hintShown,
    stats,
    submit,
    showHint,
  }
}
