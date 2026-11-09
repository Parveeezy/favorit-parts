// Прокси к прайс-API Favorit Parts.
// Используется и как Vercel Serverless Function, и как dev-middleware в Vite
// (см. vite.config.js), поэтому работает только с нативными req/res из Node.

const API_URL = 'http://api.favorit-parts.ru/hs/hsprice/'
const TIMEOUT_MS = 10000

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return send(res, 405, { error: 'Метод не поддерживается' })
  }

  const query = new URL(req.url, 'http://localhost').searchParams
  const number = (query.get('number') || '').trim()
  const brand = (query.get('brand') || '').trim()

  if (!number) {
    return send(res, 400, { error: 'Не указан номер детали' })
  }

  const key = process.env.FAVORIT_API_KEY
  if (!key) {
    return send(res, 500, { error: 'На сервере не задан FAVORIT_API_KEY' })
  }

  const params = new URLSearchParams({ key, number, info: 'on' })
  if (brand) {
    params.set('brand', brand)
    if (query.get('analogues') === 'on') params.set('analogues', 'on')
  }

  try {
    const upstream = await fetch(`${API_URL}?${params}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const text = await upstream.text()
    return send(res, upstream.status, text)
  } catch (err) {
    console.error('Favorit API request failed:', err)
    const message =
      err.name === 'TimeoutError'
        ? 'Сервис прайса не ответил вовремя'
        : 'Сервис прайса недоступен'
    return send(res, 502, { error: message })
  }
}
