import { useDispatch, useSelector } from 'react-redux'
import { clearSearch, fetchBrands, fetchOffers } from '../store/searchSlice'
import EmptyState from './EmptyState'
import ErrorAlert from './ErrorAlert'
import { IconBox, IconSearch } from './Icons'
import { BrandsSkeleton } from './Skeletons'

function StockBadge({ count }) {
  return count > 0 ? (
    <span className="badge rounded-pill bg-success-subtle text-success-emphasis num">
      {count} шт
    </span>
  ) : (
    <span className="badge rounded-pill badge-subtle">нет в наличии</span>
  )
}

export default function BrandList() {
  const dispatch = useDispatch()
  const brands = useSelector((state) => state.search.brands)
  const query = useSelector((state) => state.search.query)

  if (brands.status === 'idle') {
    return (
      <EmptyState
        icon={<IconSearch size={24} />}
        title="Начните с номера детали"
        text="Покажем производителей с таким артикулом, а затем цены, остатки и аналоги."
      />
    )
  }
  if (brands.status === 'loading') return <BrandsSkeleton />
  if (brands.status === 'failed') {
    return <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(query))} />
  }
  if (brands.data.length === 0) {
    return (
      <EmptyState
        icon={<IconBox size={24} />}
        title="Производители не найдены"
        text={`По номеру «${query}» ничего нет. Проверьте номер или попробуйте другой.`}
        action={
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => dispatch(clearSearch())}
          >
            Очистить поиск
          </button>
        }
      />
    )
  }

  return (
    <section aria-labelledby="brands-title">
      <div className="mb-3">
        <h2 id="brands-title" className="section-title">
          Выберите производителя
        </h2>
        <div className="small text-body-secondary">Найдено: {brands.data.length}</div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        {brands.data.map((item) => (
          <div className="col" key={item.goodsID}>
            <button
              type="button"
              className="brand-card"
              onClick={() => dispatch(fetchOffers(item))}
            >
              <span className="d-flex justify-content-between align-items-start gap-2 w-100">
                <span className="fw-semibold fs-6">{item.brand}</span>
                <StockBadge count={item.count} />
              </span>
              <span className="brand-card-number">{item.number}</span>
              <span className="small text-body-secondary line-clamp-2">{item.name}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
