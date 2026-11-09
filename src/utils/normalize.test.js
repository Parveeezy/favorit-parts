import { describe, expect, it } from 'vitest'
import { groupOffers, isEmptyItem, parseGoods, uniqueBrands } from './normalize'

const EMPTY_ITEM = {
  brand: '',
  count: 0,
  goodsID: '00000000-0000-0000-0000-000000000000',
  name: '',
  number: '',
  price: 0,
  rate: 0,
  warehouses: [],
}

const warehouse = (id, price, stock, extra = {}) => ({
  code: `WH-${id}`,
  id,
  own: false,
  price,
  shipmentDate: '2026-11-10T14:30:00+03:00',
  stock,
  ...extra,
})

const item = (goodsID, brand, warehouses = [], extra = {}) => ({
  goodsID,
  brand,
  number: `N-${goodsID}`,
  name: `Деталь ${goodsID}`,
  count: warehouses.reduce((sum, wh) => sum + wh.stock, 0),
  price: 999999, // устаревшее поле, не должно использоваться
  warehouses,
  ...extra,
})

describe('isEmptyItem', () => {
  it('распознаёт пустой товар «ничего не найдено»', () => {
    expect(isEmptyItem(EMPTY_ITEM)).toBe(true)
  })

  it('не считает пустым обычный товар без складов', () => {
    expect(isEmptyItem(item('1', 'MEYLE'))).toBe(false)
  })
})

describe('parseGoods', () => {
  it('превращает ответ «не найдено» в пустой массив', () => {
    expect(parseGoods({ goods: [EMPTY_ITEM] })).toEqual([])
  })

  it('бросает ошибку с текстом из поля error', () => {
    expect(() => parseGoods({ error: 'Invalid key client!' })).toThrow('Invalid key client!')
  })

  it('бросает ошибку на ответ неожиданной формы', () => {
    expect(() => parseGoods(null)).toThrow()
    expect(() => parseGoods({ foo: 1 })).toThrow()
  })

  it('возвращает товары как есть', () => {
    const goods = [item('1', 'ZEN'), item('2', 'NGK/NTK')]
    expect(parseGoods({ goods })).toEqual(goods)
  })
})

describe('uniqueBrands', () => {
  it('оставляет по одному товару на производителя', () => {
    const goods = [item('1', 'ZEN'), item('2', 'NGK/NTK'), item('3', 'ZEN'), EMPTY_ITEM]
    expect(uniqueBrands(goods).map((g) => g.goodsID)).toEqual(['1', '2'])
  })
})

describe('groupOffers', () => {
  const goods = [
    item('orig', 'MEYLE', [warehouse('a', 2000, 3), warehouse('b', 1500, 1)], {
      analogues: [
        item('an1', 'BSG', [warehouse('c', 1000, 2, { notRefund: true })]),
        item('an2', 'CORTECO', [warehouse('d', 700, 5), warehouse('e', 500, 0)]),
        item('an3', 'EDGE', []),
        item('an4', 'KORWIN', [warehouse('f', 50, 0)]),
      ],
    }),
  ]

  it('исходная деталь отдельно и первой, даже если она дороже аналогов', () => {
    const { original, analogues } = groupOffers(goods)
    expect(original).toHaveLength(1)
    expect(original[0]).toMatchObject({ brand: 'MEYLE', isOriginal: true })
    expect(analogues.every((p) => !p.isOriginal)).toBe(true)
  })

  it('одна строка на деталь: минимальная цена со склада, сумма остатков, склады внутри', () => {
    const [orig] = groupOffers(goods).original
    expect(orig).toMatchObject({ price: 1500, hasPriceRange: true, stock: 4 })
    expect(orig.offers).toHaveLength(2)
    expect(orig.price).not.toBe(999999) // устаревшее item.price не используется
    expect(orig.offers.map((o) => o.price)).toEqual([1500, 2000])
  })

  it('склады детали: сначала в наличии, затем по цене', () => {
    const corteco = groupOffers(goods).analogues.find((p) => p.brand === 'CORTECO')
    expect(corteco.offers.map((o) => o.price)).toEqual([700, 500])
    expect(corteco).toMatchObject({ price: 500, stock: 5, hasPriceRange: true })
  })

  it('аналоги: сначала в наличии, затем по минимальной цене', () => {
    expect(groupOffers(goods).analogues.map((p) => p.brand)).toEqual([
      'CORTECO',
      'BSG',
      'KORWIN',
      'EDGE',
    ])
  })

  it('деталь без складов: нет цены, остаток 0, нет предложений', () => {
    const edge = groupOffers(goods).analogues.find((p) => p.brand === 'EDGE')
    expect(edge).toMatchObject({ price: null, stock: 0, hasPriceRange: false, notRefund: false })
    expect(edge.offers).toEqual([])
  })

  it('объединяет повторы одной детали (бренд + номер) в одну строку', () => {
    const dup = [
      item('orig', 'MEYLE', [], {
        analogues: [
          item('x', 'BSG', [warehouse('a', 300, 1)], { number: 'N1' }),
          item('y', 'BSG', [warehouse('b', 300, 2)], { number: 'N1' }),
        ],
      }),
    ]
    const { analogues } = groupOffers(dup)
    expect(analogues).toHaveLength(1)
    expect(analogues[0]).toMatchObject({ stock: 3, hasPriceRange: false })
    expect(new Set(analogues[0].offers.map((o) => o.key)).size).toBe(2)
  })

  it('невозвратная деталь — только если невозвратны все её предложения', () => {
    const mixed = [
      item('orig', 'MEYLE', [warehouse('a', 100, 1, { notRefund: true }), warehouse('b', 200, 1)], {
        analogues: [item('an', 'BSG', [warehouse('c', 100, 1, { notRefund: true })])],
      }),
    ]
    const { original, analogues } = groupOffers(mixed)
    expect(original[0].notRefund).toBe(false)
    expect(original[0].offers.map((o) => o.notRefund)).toEqual([true, false])
    expect(analogues[0].notRefund).toBe(true)
  })

  it('пустой ответ даёт пустые списки', () => {
    expect(groupOffers([])).toEqual({ original: [], analogues: [] })
    expect(groupOffers([EMPTY_ITEM])).toEqual({ original: [], analogues: [] })
  })
})
