const priceFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
})

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPrice(value) {
  return value == null ? '—' : priceFormat.format(value)
}

// Цена детали: «от …», если на складах цены разные.
export function formatPartPrice(part) {
  if (part.price == null) return '—'
  return `${part.hasPriceRange ? 'от ' : ''}${formatPrice(part.price)}`
}

// plural(7, ['склад', 'склада', 'складов']) → 'складов'
export function plural(n, [one, few, many]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date)
}
