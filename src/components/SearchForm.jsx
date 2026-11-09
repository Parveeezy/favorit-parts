import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBrands } from '../store/searchSlice'

const DEBOUNCE_MS = 500

export default function SearchForm() {
  const dispatch = useDispatch()
  const query = useSelector((state) => state.search.query)
  const [value, setValue] = useState('')
  const requestRef = useRef(null)

  const runSearch = useCallback(
    (number) => {
      requestRef.current?.abort() // предыдущий запрос больше не нужен
      requestRef.current = dispatch(fetchBrands(number))
    },
    [dispatch],
  )

  // Поиск при вводе с задержкой; тот же номер повторно не запрашиваем.
  useEffect(() => {
    const number = value.trim()
    if (!number || number === query) return
    const timer = setTimeout(() => runSearch(number), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value, query, runSearch])

  // Enter и кнопка ищут сразу (в том числе повторно).
  function handleSubmit(event) {
    event.preventDefault()
    const number = value.trim()
    if (number) runSearch(number)
  }

  return (
    <form className="mb-4" onSubmit={handleSubmit} role="search">
      <label htmlFor="part-number" className="form-label">
        Номер детали
      </label>
      <div className="input-group input-group-lg">
        <input
          id="part-number"
          type="search"
          className="form-control"
          placeholder="Например, 7160500039S"
          autoComplete="off"
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
          Найти
        </button>
      </div>
    </form>
  )
}
