import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearSearch, fetchBrands, setInput } from '../store/searchSlice'
import { IconClose, IconSearch } from './Icons'

const DEBOUNCE_MS = 500
const EXAMPLES = ['7160500039S', '0189']

export default function SearchForm() {
  const dispatch = useDispatch()
  const input = useSelector((state) => state.search.input)
  const query = useSelector((state) => state.search.query)
  const inputRef = useRef(null)
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
    const number = input.trim()
    if (!number || number === query) return
    const timer = setTimeout(() => runSearch(number), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [input, query, runSearch])

  // Enter и кнопка ищут сразу (в том числе повторно).
  function handleSubmit(event) {
    event.preventDefault()
    const number = input.trim()
    if (number) runSearch(number)
  }

  function handleClear() {
    requestRef.current?.abort()
    dispatch(clearSearch())
    inputRef.current?.focus()
  }

  function handleExample(number) {
    dispatch(setInput(number))
    runSearch(number)
  }

  return (
    <form onSubmit={handleSubmit} role="search">
      <label htmlFor="part-number" className="form-label fw-semibold">
        Номер детали
      </label>
      <div className="d-flex flex-column flex-sm-row gap-2">
        <div className="search-field flex-grow-1">
          <IconSearch className="search-field-icon" />
          <input
            ref={inputRef}
            id="part-number"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            className="form-control form-control-lg"
            placeholder="Артикул, например 7160500039S"
            autoComplete="off"
            spellCheck="false"
            autoFocus
            aria-describedby={input ? undefined : 'search-hint'}
            value={input}
            onChange={(event) => dispatch(setInput(event.target.value))}
          />
          {input && (
            <button
              type="button"
              className="search-field-clear"
              aria-label="Очистить поиск"
              onClick={handleClear}
            >
              <IconClose size={18} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg px-4 search-submit"
          disabled={!input.trim()}
        >
          Найти
        </button>
      </div>
      {!input && (
        <div id="search-hint" className="form-text">
          Поиск начнётся сам после ввода. Например:{' '}
          {EXAMPLES.map((number, index) => (
            <span key={number}>
              {index > 0 && ', '}
              <button type="button" className="example-link" onClick={() => handleExample(number)}>
                {number}
              </button>
            </span>
          ))}
        </div>
      )}
    </form>
  )
}
