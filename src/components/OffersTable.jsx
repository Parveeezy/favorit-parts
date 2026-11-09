import { Fragment, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { backToBrands, fetchOffers } from '../store/searchSlice'
import { formatDate, formatPrice } from '../utils/format'
import ErrorAlert from './ErrorAlert'
import Loader from './Loader'

// У популярных деталей бывают сотни аналогов — показываем порциями.
const PAGE_SIZE = 100
const COLUMNS = 7

function NotRefundBadge() {
  return (
    <span className="badge rounded-pill border text-body-secondary fw-normal ms-2">
      невозвратный
    </span>
  )
}

function WarehouseRows({ offers }) {
  return (
    <tr>
      <td colSpan={COLUMNS} className="bg-body-tertiary p-0">
        <table className="table table-sm mb-0">
          <thead>
            <tr className="small">
              <th className="ps-5 text-body-secondary">Склад</th>
              <th className="text-end text-body-secondary">Цена</th>
              <th className="text-end text-body-secondary">Остаток</th>
              <th className="text-body-secondary">Дата отгрузки</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.key} className="small">
                <td className="ps-5 text-nowrap">
                  {offer.warehouse}
                  {offer.notRefund && <NotRefundBadge />}
                </td>
                <td className="text-end text-nowrap">{formatPrice(offer.price)}</td>
                <td className="text-end">{offer.stock}</td>
                <td className="text-nowrap">{formatDate(offer.shipmentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function PartRow({ part, expanded, onToggle }) {
  const expandable = part.offers.length > 0

  return (
    <tr
      className={part.isOriginal ? 'table-primary' : undefined}
      onClick={expandable ? onToggle : undefined}
      style={expandable ? { cursor: 'pointer' } : undefined}
    >
      <td className="text-center" style={{ width: 40 }}>
        {expandable && (
          <button
            type="button"
            className="btn btn-sm btn-link p-0 text-decoration-none"
            aria-expanded={expanded}
            aria-label={expanded ? 'Свернуть склады' : 'Показать склады'}
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        )}
      </td>
      <td className="fw-semibold text-nowrap">
        {part.brand}
        {part.isOriginal && <span className="badge text-bg-primary ms-2">Оригинал</span>}
      </td>
      <td className="text-nowrap">{part.number}</td>
      <td>
        {part.name}
        {part.notRefund && <NotRefundBadge />}
      </td>
      <td className="text-end text-nowrap">
        {part.price == null ? '—' : `${part.hasPriceRange ? 'от ' : ''}${formatPrice(part.price)}`}
      </td>
      <td className="text-end text-nowrap">
        {part.stock > 0 ? part.stock : <span className="text-body-secondary">нет в наличии</span>}
      </td>
      <td className="text-end">{part.offers.length || '—'}</td>
    </tr>
  )
}

function OffersContent({ offers, onRetry }) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [expanded, setExpanded] = useState(() => new Set())

  if (offers.status === 'loading') return <Loader />
  if (offers.status === 'failed') return <ErrorAlert message={offers.error} onRetry={onRetry} />

  const { original, analogues } = offers.data
  if (original.length + analogues.length === 0) {
    return <div className="alert alert-secondary">Предложения не найдены</div>
  }

  const offersCount = [...original, ...analogues].reduce((sum, p) => sum + p.offers.length, 0)
  const shownAnalogues = analogues.slice(0, visible)

  function toggle(key) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <>
      <p className="small text-body-secondary">
        Аналогов: {analogues.length}, предложений: {offersCount}
      </p>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th />
              <th>Производитель</th>
              <th>Номер</th>
              <th>Наименование</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
              <th className="text-end">Складов</th>
            </tr>
          </thead>
          <tbody>
            {[...original, ...shownAnalogues].map((part) => (
              <Fragment key={part.key}>
                <PartRow
                  part={part}
                  expanded={expanded.has(part.key)}
                  onToggle={() => toggle(part.key)}
                />
                {expanded.has(part.key) && <WarehouseRows offers={part.offers} />}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {shownAnalogues.length < analogues.length && (
        <div className="text-center">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
          >
            Показать ещё (показано {shownAnalogues.length} из {analogues.length})
          </button>
        </div>
      )}
    </>
  )
}

export default function OffersTable() {
  const dispatch = useDispatch()
  const { offers, selectedBrand } = useSelector((state) => state.search)

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="h5 mb-1">
            {selectedBrand.brand} {selectedBrand.number}
          </h2>
          <div className="small text-body-secondary">
            {selectedBrand.name} — предложения и аналоги
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => dispatch(backToBrands())}
        >
          ← Назад к производителям
        </button>
      </div>
      <OffersContent
        key={offers.requestId}
        offers={offers}
        onRetry={() => dispatch(fetchOffers(selectedBrand))}
      />
    </>
  )
}
