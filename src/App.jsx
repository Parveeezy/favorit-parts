import { useSelector } from 'react-redux'
import BrandList from './components/BrandList'
import OffersTable from './components/OffersTable'
import SearchForm from './components/SearchForm'

export default function App() {
  const selectedBrand = useSelector((state) => state.search.selectedBrand)

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <h1 className="h3 mb-4">Поиск автозапчастей</h1>
      <SearchForm />
      {selectedBrand ? <OffersTable /> : <BrandList />}
    </div>
  )
}
