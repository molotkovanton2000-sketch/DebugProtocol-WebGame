import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/** Конфиг сложностей: подпись, звёзды и вариант молний в меню. */
export const DIFFICULTIES = {
  easy: { id: 'easy', label: 'легкая', stars: 1, lightning: 'corners' },
  medium: { id: 'medium', label: 'средняя', stars: 2, lightning: 'medium' },
  hard: { id: 'hard', label: 'сложная', stars: 3, lightning: 'hard' },
}

/** Порядок сложностей = порядок масок в главном меню (слева направо). */
export const DIFFICULTY_ORDER = ['easy', 'medium', 'hard']

const STORAGE_KEY = 'debug-protocol:cleared'

const loadCleared = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { easy: !!raw.easy, medium: !!raw.medium, hard: !!raw.hard }
  } catch {
    return { easy: false, medium: false, hard: false }
  }
}

const saveCleared = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* приватный режим — прогресс живёт до перезагрузки */
  }
}

/**
 * Настройки и прогресс игрока.
 * difficulty === null — сложность ещё не выбрана.
 * cleared — какие сложности пройдены: каждая победа чинит одну маску в меню.
 * pendingRestore — сложность, маска которой должна «собраться» при следующем показе меню.
 */
export const useSettingsStore = defineStore('settings', () => {
  const difficulty = ref(null)
  const lastResult = ref(null)
  const cleared = ref(loadCleared())
  const pendingRestore = ref(null)

  const difficultyConfig = computed(() => (difficulty.value ? DIFFICULTIES[difficulty.value] : null))

  function setDifficulty(id) {
    if (DIFFICULTIES[id]) difficulty.value = id
  }

  function setResult(result) {
    lastResult.value = result
  }

  /** Победа над вирусом сложности id. Анимация сборки — только при первой победе. */
  function markCleared(id) {
    if (!DIFFICULTIES[id] || cleared.value[id]) return
    cleared.value = { ...cleared.value, [id]: true }
    pendingRestore.value = id
    saveCleared(cleared.value)
  }

  /** Забрать отложенную анимацию (возвращает индекс маски или -1). */
  function consumePendingRestore() {
    const index = pendingRestore.value ? DIFFICULTY_ORDER.indexOf(pendingRestore.value) : -1
    pendingRestore.value = null
    return index
  }

  return {
    difficulty,
    difficultyConfig,
    lastResult,
    cleared,
    pendingRestore,
    setDifficulty,
    setResult,
    markCleared,
    consumePendingRestore,
  }
})
