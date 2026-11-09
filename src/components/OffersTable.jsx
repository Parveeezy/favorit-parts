import { Fragment } from 'react'
import { formatDate, formatPartPrice, formatPrice } from '../utils/format'
import { IconChevron } from './Icons'
import { NotRefundBadge, OriginalBadge } from './OfferBadges'

const COLUMNS = 7

function WarehousesRow({ part }) {
  return (
    <tr className="warehouses-row">
      <td colSpan={COLUMNS} className="warehouses-cell" id={`wh-${part.key}`}>
        <table className="table table-sm warehouse-table">
          <thead>
            <tr>
              <th scope="col">Склад</th>
              <th scope="col">Дата отгрузки</th>
              <th scope="col" className="text-end">Цена</th>
              <th scope="col" className="text-end">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {part.offers.map((offer) => (
              <tr key={offer.key}>
                <td className="text-nowrap">
                  {offer.warehouse}
                  {offer.notRefund && <NotRefundBadge />}
                </td>
                <td className="text-nowrap">{formatDate(offer.shipmentDate)}</td>
                <td className="num">{formatPrice(offer.price)}</td>
                <td className="num">{offer.stock} шт</td>
              </tr>
            ))}
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function PartRow({ part, open, onToggle }) {
  const expandable = part.offers.length > 0
  const className = [
    'part-row',
    part.isOriginal && 'is-original',
    expandable && 'is-expandable',
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <tr className={className} onClick={expandable ? onToggle : undefined}>
      <td className="col-toggle text-center">
        {expandable && (
          <button
            type="button"
            className="chevron-btn"
            aria-expanded={open}
            aria-controls={open ? `wh-${part.key}` : undefined}
            aria-label={`Склады: ${part.brand} ${part.number}`}
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
          >
            <IconChevron className="chevron" />
          </button>
        )}
      </td>
      <td>
        <span className="fw-semibold me-2">{part.brand}</span>
        {part.isOriginal && <OriginalBadge />}
        {/* На планшетах номер под брендом, с lg — отдельный столбец */}
        <div className="small text-body-secondary d-lg-none">{part.number}</div>
      </td>
      <td className="text-nowrap d-none d-lg-table-cell">{part.number}</td>
      <td className="break-anywhere">
        {part.name}
        {part.notRefund && <NotRefundBadge />}
      </td>
      <td className="num price">{formatPartPrice(part)}</td>
      {part.stock > 0 ? (
        <td className="num">{part.stock}</td>
      ) : (
        <td className="text-end small text-body-secondary">нет в наличии</td>
      )}
      <td className={`num${part.offers.length ? '' : ' text-body-secondary'}`}>
        {part.offers.length || '—'}
      </td>
    </tr>
  )
}

// Таблица для md и шире.
export default function OffersTable({ parts, expanded, onToggle }) {
  return (
    <table className="table offers-table align-middle">
      <thead>
        <tr>
          <th scope="col" className="col-toggle">
            <span className="visually-hidden">Склады</span>
          </th>
          <th scope="col">Производитель</th>
          <th scope="col" className="d-none d-lg-table-cell">
            Номер
          </th>
          <th scope="col">Наименование</th>
          <th scope="col" className="text-end">Цена</th>
          <th scope="col" className="text-end">Остаток</th>
          <th scope="col" className="text-end">Складов</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((part) => (
          <Fragment key={part.key}>
            <PartRow part={part} open={expanded.has(part.key)} onToggle={() => onToggle(part.key)} />
            {expanded.has(part.key) && <WarehousesRow part={part} />}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}
