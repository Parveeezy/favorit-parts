// Заглушки на время загрузки повторяют размеры настоящего контента,
// чтобы страница не прыгала, когда придут данные.

function Loading() {
  return (
    <span className="visually-hidden" role="status">
      Загрузка…
    </span>
  )
}

export function BrandsSkeleton() {
  return (
    <>
      <Loading />
      <div className="placeholder-glow mb-3" aria-hidden="true">
        <span className="placeholder col-4 col-md-2 rounded" />
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3" aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => (
          <div className="col" key={i}>
            <div className="brand-card placeholder-glow">
              <span className="placeholder col-5 rounded" />
              <span className="placeholder col-4 rounded placeholder-sm" />
              <span className="placeholder col-9 rounded placeholder-sm" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function OffersSkeleton() {
  const rows = Array.from({ length: 6 }, (_, i) => i)
  return (
    <>
      <Loading />
      <div className="placeholder-glow mb-3" aria-hidden="true">
        <span className="placeholder col-6 col-md-3 rounded placeholder-sm" />
      </div>
      <div className="d-none d-md-block placeholder-glow" aria-hidden="true">
        <table className="table offers-table align-middle">
          <thead>
            <tr>
              <th className="col-toggle" />
              <th>Производитель</th>
              <th className="d-none d-lg-table-cell">Номер</th>
              <th>Наименование</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
              <th className="text-end">Складов</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i}>
                <td className="col-toggle">
                  <span className="placeholder w-50 rounded" />
                </td>
                <td><span className="placeholder col-8 rounded" /></td>
                <td className="d-none d-lg-table-cell"><span className="placeholder col-10 rounded" /></td>
                <td><span className="placeholder col-11 rounded" /></td>
                <td className="text-end"><span className="placeholder col-8 rounded" /></td>
                <td className="text-end"><span className="placeholder col-5 rounded" /></td>
                <td className="text-end"><span className="placeholder col-4 rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="offer-cards d-md-none placeholder-glow" aria-hidden="true">
        {rows.slice(0, 4).map((i) => (
          <li className="offer-card offer-card-main" key={i}>
            <span className="placeholder col-6 rounded d-block mb-2" />
            <span className="placeholder col-10 rounded placeholder-sm d-block mb-3" />
            <span className="d-flex justify-content-between">
              <span className="placeholder col-4 rounded" />
              <span className="placeholder col-3 rounded placeholder-sm" />
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
