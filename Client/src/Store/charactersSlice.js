import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:3000/fav";

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

export const fetchCharacters = createAsyncThunk(
  "characters/fetchCharacters",
  async (_, { getState, rejectWithValue }) => {
    try {
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
      state.pagination.currentPage = 1;
      state.pagination.totalPages = 1;
    },
    setHouseFilter: (state, action) => {
      state.houseFilter = action.payload;
      state.pagination.currentPage = 1;
      state.pagination.totalPages = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.loading = false;
        state.characters = action.payload.data;
        state.pagination.currentPage = action.payload.currentPage || 1;
        state.pagination.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, setHouseFilter, setCurrentPage } =
  charactersSlice.actions;

export default charactersSlice.reducer;
