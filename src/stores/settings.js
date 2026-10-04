import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/** Конфиг сложностей: подпись, звёзды и вариант молний в меню. */
export const DIFFICULTIES = {
  easy: { id: 'easy', label: 'легкая', stars: 1, lightning: 'corners' },
  medium: { id: 'medium', label: 'средняя', stars: 2, lightning: 'medium' },
  hard: { id: 'hard', label: 'сложная', stars: 3, lightning: 'hard' },
}

/**
 * Настройки игрока.
 * difficulty === null — сложность ещё не выбрана (главное меню со сломанными масками).
 */
export const useSettingsStore = defineStore('settings', () => {
  const difficulty = ref(null)
  const lastResult = ref(null)

  const difficultyConfig = computed(() => (difficulty.value ? DIFFICULTIES[difficulty.value] : null))

  function setDifficulty(id) {
    if (DIFFICULTIES[id]) difficulty.value = id
  }

  function setResult(result) {
    lastResult.value = result
  }

  return { difficulty, difficultyConfig, lastResult, setDifficulty, setResult }
})
