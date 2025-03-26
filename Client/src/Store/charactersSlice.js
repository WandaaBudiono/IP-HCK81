// Store/charactersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:3000/fav";

// State awal untuk slice karakter
const initialState = {
  characters: [],
  loading: false,
  error: null,
  searchQuery: "",
  houseFilter: "",
  pagination: {
    currentPage: 1,
    totalPages: 1,
  },
};

// Thunk untuk fetch data karakter
export const fetchCharacters = createAsyncThunk(
  "characters/fetchCharacters",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Ambil state dari slice 'characters'
      const state = getState().characters;
      const { searchQuery, houseFilter, pagination } = state;

      const params = {
        pageNumber: pagination.currentPage,
      };
      if (searchQuery) params.q = searchQuery;
      if (houseFilter) params.house = houseFilter;

      const { data } = await axios.get(baseURL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params,
      });

      // data di-return agar bisa ditangani di fulfilled
      return data;
    } catch (error) {
      return rejectWithValue("Failed to fetch characters");
    }
  }
);

const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      // Reset pagination jika perlu
      state.pagination.currentPage = 1;
      state.pagination.totalPages = 1;
    },
    setHouseFilter: (state, action) => {
      state.houseFilter = action.payload;
      // Reset pagination jika perlu
      state.pagination.currentPage = 1;
      state.pagination.totalPages = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(fetchCharacters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fulfilled
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload.data;
        // Update pagination
        state.pagination.currentPage = action.payload.currentPage || 1;
        state.pagination.totalPages = action.payload.totalPages || 1;
      })
      // Rejected
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions untuk digunakan di komponen
export const { setSearchQuery, setHouseFilter, setCurrentPage } =
  charactersSlice.actions;

// Export reducer untuk digabungkan di store
export default charactersSlice.reducer;
