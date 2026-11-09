import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { backToBrands, fetchOffers } from '../store/searchSlice'
import EmptyState from './EmptyState'
import ErrorAlert from './ErrorAlert'
import { IconArrowLeft, IconBox } from './Icons'
import OffersCards from './OffersCards'
import OffersTable from './OffersTable'
import { OffersSkeleton } from './Skeletons'

// У популярных деталей бывают сотни аналогов — показываем порциями.
const PAGE_SIZE = 100

function OffersContent({ offers, onRetry, onBack }) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [expanded, setExpanded] = useState(() => new Set())

  if (offers.status === 'loading') return <OffersSkeleton />
  if (offers.status === 'failed') return <ErrorAlert message={offers.error} onRetry={onRetry} />

  const { original, analogues } = offers.data
  if (original.length + analogues.length === 0) {
    return (
      <EmptyState
        icon={<IconBox size={24} />}
        title="Предложения не найдены"
        text="Для этой детали сейчас нет ни предложений, ни аналогов."
        action={
          <button type="button" className="btn btn-outline-primary" onClick={onBack}>
            К производителям
          </button>
        }
      />
    )
  }

  const offersCount = [...original, ...analogues].reduce((sum, p) => sum + p.offers.length, 0)
  const shownAnalogues = analogues.slice(0, visible)
  const parts = [...original, ...shownAnalogues]

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
      <p className="small text-body-secondary mb-3">
        Аналогов: {analogues.length}, предложений: {offersCount}
      </p>
      {/* Один источник данных, два представления: таблица на md+, карточки на мобильных. */}
      <div className="d-none d-md-block">
        <OffersTable parts={parts} expanded={expanded} onToggle={toggle} />
      </div>
      <div className="d-md-none">
        <OffersCards parts={parts} expanded={expanded} onToggle={toggle} />
      </div>
      {shownAnalogues.length < analogues.length && (
        <div className="d-grid d-md-flex justify-content-md-center mt-3">
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

export default function OffersView() {
  const dispatch = useDispatch()
  const offers = useSelector((state) => state.search.offers)
  const selectedBrand = useSelector((state) => state.search.selectedBrand)
  const goBack = () => dispatch(backToBrands())

  return (
    <section aria-labelledby="offers-title">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-2">
        <div className="min-w-0">
          <h2 id="offers-title" className="section-title text-break">
            {selectedBrand.brand} {selectedBrand.number}
          </h2>
          <div className="small text-body-secondary">{selectedBrand.name}</div>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2 flex-shrink-0"
          onClick={goBack}
        >
          <IconArrowLeft size={18} />
          Назад к производителям
        </button>
      </div>
      <OffersContent
        key={offers.requestId}
        offers={offers}
        onRetry={() => dispatch(fetchOffers(selectedBrand))}
        onBack={goBack}
      />
    </section>
  )
}
