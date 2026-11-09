import { useSelector } from 'react-redux'
import BrandList from './components/BrandList'
import { AppLogo } from './components/Icons'
import OffersView from './components/OffersView'
import SearchForm from './components/SearchForm'

export default function App() {
  const selectedBrand = useSelector((state) => state.search.selectedBrand)

  return (
    <>
      <header className="app-header">
        <div className="container app-container d-flex align-items-center gap-3 py-3">
          <AppLogo />
          <div>
            <h1 className="app-title mb-0">Поиск автозапчастей</h1>
            <div className="app-subtitle">Цены, остатки и аналоги по прайсу Favorit Parts</div>
          </div>
        </div>
      </header>
      <main className="container app-container py-3 py-md-4">
        <div className="app-card">
          <SearchForm />
          <hr className="app-divider" />
          {selectedBrand ? <OffersView /> : <BrandList />}
        </div>
      </main>
    </>
  )
}
