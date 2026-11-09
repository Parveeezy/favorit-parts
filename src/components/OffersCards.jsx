import { formatDate, formatPartPrice, formatPrice, plural } from '../utils/format'
import { IconChevron } from './Icons'
import { NotRefundBadge, OriginalBadge } from './OfferBadges'

function CardBody({ part, expandable }) {
  const warehouses = part.offers.length
  return (
    <>
      <span className="d-flex align-items-center gap-2 flex-wrap">
        <span className="fw-semibold">{part.brand}</span>
        <span className="text-body-secondary">{part.number}</span>
        {part.isOriginal && <OriginalBadge />}
        {expandable && <IconChevron className="chevron ms-auto text-body-secondary" />}
      </span>
      <span className="d-block small mt-1 line-clamp-2">
        {part.name}
        {part.notRefund && <NotRefundBadge />}
      </span>
      <span className="d-flex justify-content-between align-items-baseline gap-2 mt-2">
        <span className="offer-card-price">{formatPartPrice(part)}</span>
        {part.stock > 0 ? (
          <span className="small num">
            {part.stock} шт · {warehouses} {plural(warehouses, ['склад', 'склада', 'складов'])}
          </span>
        ) : (
          <span className="small text-body-secondary">нет в наличии</span>
        )}
      </span>
    </>
  )
}

// Список карточек для экранов уже md.
export default function OffersCards({ parts, expanded, onToggle }) {
  return (
    <ul className="offer-cards">
      {parts.map((part) => {
        const expandable = part.offers.length > 0
        const open = expanded.has(part.key)
        return (
          <li key={part.key} className={`offer-card${part.isOriginal ? ' is-original' : ''}`}>
            {expandable ? (
              <button
                type="button"
                className="offer-card-main"
                aria-expanded={open}
                onClick={() => onToggle(part.key)}
              >
                <CardBody part={part} expandable />
              </button>
            ) : (
              <div className="offer-card-main">
                <CardBody part={part} expandable={false} />
              </div>
            )}
            {open && (
              <ul className="warehouse-list" aria-label={`Склады: ${part.brand} ${part.number}`}>
                {part.offers.map((offer) => (
                  <li key={offer.key}>
                    <div className="d-flex justify-content-between gap-2">
                      <span>
                        {offer.warehouse}
                        {offer.notRefund && <NotRefundBadge />}
                      </span>
                      <span className="fw-semibold num">{formatPrice(offer.price)}</span>
                    </div>
                    <div className="d-flex justify-content-between gap-2 small text-body-secondary">
                      <span>Отгрузка {formatDate(offer.shipmentDate)}</span>
                      <span className="num">{offer.stock} шт</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}
