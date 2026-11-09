import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchPrice } from '../api/favoritApi'
import { groupOffers, uniqueBrands } from '../utils/normalize'

const initialRequest = { status: 'idle', data: null, error: null, requestId: null }

const initialState = {
  query: '',
  brands: initialRequest,
  offers: initialRequest,
  selectedBrand: null,
}

export const fetchBrands = createAsyncThunk(
  'search/fetchBrands',
  async (number, { signal }) => uniqueBrands(await fetchPrice({ number }, signal)),
)

// Номер и бренд берём из выбранного товара шага 1: API нормализует номер.
export const fetchOffers = createAsyncThunk(
  'search/fetchOffers',
  async (item, { signal }) =>
    groupOffers(
      await fetchPrice({ number: item.number, brand: item.brand, analogues: true }, signal),
    ),
)

// Общие обработчики запроса. Ответ принимается, только если это последний
// отправленный запрос, — устаревший медленный ответ не перезапишет новый.
function addRequestCases(builder, thunk, field, onPending) {
  builder
    .addCase(thunk.pending, (state, action) => {
      onPending(state, action)
      state[field] = { ...initialRequest, status: 'loading', requestId: action.meta.requestId }
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state[field].requestId !== action.meta.requestId) return
      state[field].status = 'succeeded'
      state[field].data = action.payload
    })
    .addCase(thunk.rejected, (state, action) => {
      if (state[field].requestId !== action.meta.requestId || action.meta.aborted) return
      state[field].status = 'failed'
      state[field].error = action.error.message || 'Неизвестная ошибка'
    })
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    backToBrands(state) {
      state.selectedBrand = null
      state.offers = initialRequest
    },
  },
  extraReducers: (builder) => {
    // Новый поиск сбрасывает шаг 2.
    addRequestCases(builder, fetchBrands, 'brands', (state, action) => {
      state.query = action.meta.arg
      state.selectedBrand = null
      state.offers = initialRequest
    })
    addRequestCases(builder, fetchOffers, 'offers', (state, action) => {
      state.selectedBrand = action.meta.arg
    })
  },
})

export const { backToBrands } = searchSlice.actions
export default searchSlice.reducer
