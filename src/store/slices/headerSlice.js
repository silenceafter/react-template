import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
  hasMore: true,
  search: '',
  drawing: '',
  limit: 5,
  page: 1,
};

export const fetchData = createAsyncThunk(
  'header/fetchData',
  async ({ search, limit, page }, { rejectWithValue }) => {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseUrl}/ivc/ogt/executescripts/getdrawings.v0.php?search=${search}&&limit=${limit}&page=${page}`); /* http://192.168.15.72/ivc/ogt/executescripts/getdrawings.v0.php?search=${search}&&limit=${limit}&page=${page} */
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;      
    },
    setPage: (state, action) => {
       state.page = action.payload;
    },
    resetHeader: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.data.filter(newItem => 
          !state.items.some(existingItem => {
            return `${existingItem.externalCode}-${existingItem.internalCode}-${existingItem.name}` === 
                `${newItem.externalCode}-${newItem.internalCode}-${newItem.name}`;
            })
        );
        //
        state.items = [...state.items, ...newItems];//добавляем только новые данные к существующему списку        
        if (newItems.length < state.limit) {
          state.hasMore = false;//если меньше лимита, прекращаем подгрузку
        }
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.hasMore = false;
        state.error = action.payload;
      });
  },
});

//селекторы
export const selectSearch = (state) => state.header.search;
export const selectLimit = (state) => state.header.limit;
export const selectPage = (state) => state.header.page;

export const { setSearch, setLimit, setPage, resetHeader } = headerSlice.actions;
export default headerSlice.reducer;