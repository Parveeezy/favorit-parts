import { parseGoods } from '../utils/normalize'

// Клиент ходит только в собственный прокси /api/price — ключ знает лишь сервер.
export async function fetchPrice({ number, brand, analogues }, signal) {
  const params = new URLSearchParams({ number })
  if (brand) params.set('brand', brand)
  if (analogues) params.set('analogues', 'on')

  let res
  try {
    res = await fetch(`/api/price?${params}`, { signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('Не удалось связаться с сервером. Проверьте подключение к интернету.', {
      cause: err,
    })
  }

  let data
  try {
    data = await res.json()
  } catch (err) {
    throw new Error(
      res.ok
        ? 'Сервер вернул некорректный ответ'
        : `Ошибка сервера (${res.status}). Попробуйте позже.`,
      { cause: err },
    )
  }

  // API отдаёт { error } в том числе с кодами 4xx — показываем его текст.
  if (data && data.error) throw new Error(data.error)
  if (!res.ok) throw new Error(`Ошибка сервера (${res.status}). Попробуйте позже.`)

  return parseGoods(data)
}
