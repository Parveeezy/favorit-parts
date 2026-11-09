import { useDispatch, useSelector } from 'react-redux'
import { fetchBrands, fetchOffers } from '../store/searchSlice'
import ErrorAlert from './ErrorAlert'
import Loader from './Loader'

export default function BrandList() {
  const dispatch = useDispatch()
  const { brands, query } = useSelector((state) => state.search)

  if (brands.status === 'idle') {
    return <p className="text-body-secondary">Введите номер детали, чтобы найти производителей.</p>
  }
  if (brands.status === 'loading') return <Loader />
  if (brands.status === 'failed') {
    return <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(query))} />
  }
  if (brands.data.length === 0) {
    return <div className="alert alert-secondary">Производители не найдены</div>
  }

  return (
    <>
      <h2 className="h5 mb-3">Выберите производителя</h2>
      <div className="list-group">
        {brands.data.map((item) => (
          <button
            key={item.goodsID}
            type="button"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-start gap-3"
            onClick={() => dispatch(fetchOffers(item))}
          >
            <div>
              <div className="fw-semibold">
                {item.brand} <span className="text-body-secondary fw-normal">{item.number}</span>
              </div>
              <div className="small text-body-secondary">{item.name}</div>
            </div>
            {item.count > 0 ? (
              <span className="badge text-bg-success">в наличии: {item.count}</span>
            ) : (
              <span className="badge text-bg-light">нет в наличии</span>
            )}
          </button>
        ))}
      </div>
    </>
  )
}
