// Чистые функции для разбора ответа прайс-API.

const EMPTY_GOODS_ID = '00000000-0000-0000-0000-000000000000'

// «Ничего не найдено»: API возвращает один пустой товар с нулевым GUID.
export function isEmptyItem(item) {
  return !item || item.goodsID === EMPTY_GOODS_ID || !item.brand
}

// Разбирает тело ответа: бросает ошибку из поля error, отбрасывает пустые товары.
export function parseGoods(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Сервер вернул некорректный ответ')
  }
  if (data.error) throw new Error(data.error)
  if (!Array.isArray(data.goods)) {
    throw new Error('Сервер вернул некорректный ответ')
  }
  return data.goods.filter((item) => !isEmptyItem(item))
}

// Один товар на каждого производителя.
export function uniqueBrands(goods) {
  const seen = new Set()
  return goods.filter((item) => {
    if (isEmptyItem(item) || seen.has(item.brand)) return false
    seen.add(item.brand)
    return true
  })
}

// Сначала в наличии, затем по возрастанию цены (без цены — в конце).
function byStockThenPrice(a, b) {
  if (a.stock > 0 !== b.stock > 0) return a.stock > 0 ? -1 : 1
  return (a.price ?? Infinity) - (b.price ?? Infinity)
}

function toOffer(wh, item, index) {
  return {
    key: `${wh.id}-${index}`,
    warehouse: wh.code || wh.id,
    price: wh.price,
    stock: wh.stock || 0,
    shipmentDate: wh.shipmentDate || null,
    notRefund: Boolean(wh.notRefund ?? item.notRefund),
  }
}

// Собирает деталь из товара и его складов; цена — минимальная по складам.
function finishPart(part) {
  const { offers } = part
  offers.sort(byStockThenPrice)
  const prices = offers.map((o) => o.price).filter((p) => p != null)
  return {
    ...part,
    price: prices.length ? Math.min(...prices) : null,
    hasPriceRange: new Set(prices).size > 1,
    stock: offers.reduce((sum, o) => sum + o.stock, 0),
    notRefund: offers.length > 0 && offers.every((o) => o.notRefund),
  }
}

// Группирует ответ шага 2 по деталям (бренд + номер).
// Возвращает { original: [...], analogues: [...] }: исходная деталь отдельно,
// аналоги отсортированы — сначала в наличии, затем по минимальной цене.
export function groupOffers(goods) {
  const parts = new Map()

  function add(item, isOriginal) {
    if (isEmptyItem(item)) return
    const key = `${item.brand}|${item.number}`
    if (!parts.has(key)) {
      parts.set(key, {
        key,
        brand: item.brand,
        number: item.number,
        name: item.name,
        isOriginal,
        offers: [],
      })
    }
    const offers = parts.get(key).offers
    ;(item.warehouses || []).forEach((wh) => offers.push(toOffer(wh, item, offers.length)))
  }

  for (const item of goods) {
    add(item, true)
    for (const analogue of item.analogues || []) add(analogue, false)
  }

  const all = [...parts.values()].map(finishPart)
  return {
    original: all.filter((p) => p.isOriginal),
    analogues: all.filter((p) => !p.isOriginal).sort(byStockThenPrice),
  }
}

