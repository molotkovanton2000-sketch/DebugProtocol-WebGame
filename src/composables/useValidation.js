/**
 * Проверка ответа игрока.
 *  - syntax / logic: сравниваем исправленную строку с эталоном без учёта пробелов
 *    (регистр не трогаем — в JS он важен);
 *  - write: запускаем код игрока на тестах из JSON (tests: [{ input, expected }]).
 */
export function normalizeCode(str = '') {
  return String(str).replace(/\s+/g, '')
}

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/** Запуск функции игрока на тестах. Имя функции берём из эталонного ответа. */
export function runTests(code, task) {
  const nameMatch = String(task.correctAnswer || '').match(/function\s+([A-Za-z_$][\w$]*)/)
  if (!nameMatch) return false
  const fnName = nameMatch[1]
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict";\n${code}\n;return typeof ${fnName} === 'function' ? ${fnName} : null;`)()
    if (!fn) return false
    return task.tests.every((t) => sameValue(fn(...t.input), t.expected))
  } catch {
    return false
  }
}

export function useValidation() {
  const isCorrect = (answer, task) => {
    if (!task || !String(answer).trim()) return false
    if (task.type === 'write' && Array.isArray(task.tests) && task.tests.length) {
      return runTests(answer, task)
    }
    const expected = [task.correctAnswer, ...(task.alternativeAnswers || [])]
    const given = normalizeCode(answer)
    return expected.some((e) => normalizeCode(e) === given)
  }
  return { isCorrect }
}
