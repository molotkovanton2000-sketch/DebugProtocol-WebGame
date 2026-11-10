/**
 * Перезапуск GIF-анимаций с первого кадра.
 *
 * Браузер держит одну анимацию на один адрес картинки, поэтому повторно показанная
 * гифка продолжает играть «с середины». Здесь файл скачивается один раз, а для
 * каждого показа выдаётся новый blob:-адрес — анимация всегда стартует с нуля
 * и без сетевого запроса.
 */
const blobs = new Map()

export function preloadGif(url) {
  if (!blobs.has(url)) {
    blobs.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.blob() : null))
        .catch(() => null),
    )
  }
  return blobs.get(url)
}

/** Новый адрес для проигрывания с начала. Старый адрес нужно отдать в releaseGif. */
export async function freshGif(url) {
  const blob = await preloadGif(url)
  return blob ? URL.createObjectURL(blob) : `${url}?r=${Date.now()}`
}

export function releaseGif(src) {
  if (src && src.startsWith('blob:')) URL.revokeObjectURL(src)
}
