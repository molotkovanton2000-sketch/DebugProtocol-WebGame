import easy from '../data/levels-easy.json'
import medium from '../data/levels-medium.json'
import hard from '../data/levels-hard.json'
import bosses from '../data/bosses.json'

const LEVELS = { easy, medium, hard }

/** Загрузка уровня и реплик босса по сложности. */
export function useLevels() {
  const getLevel = (difficulty = 'easy') => {
    const level = LEVELS[difficulty] || LEVELS.easy
    const dialogue = bosses[level.difficulty] || bosses.easy
    return { ...level.boss, difficulty: level.difficulty, dialogue }
  }
  return { getLevel }
}
