import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper to map UI filters to API filters
const mapFilter = (filter) => {
  switch (filter.toLowerCase()) {
    case 'new':
      return 'UnApproved';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'all':
    default:
      return 'all';
  }
};

// Fetch Test Results
export const fetchTestResults = createAsyncThunk(
  'testResult/fetchTestResults',
  async ({ type = 'PGX', filter = 'all', page = 1, pageSize = 10 }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const apiFilter = mapFilter(filter);

      // Validate page number
      if (page < 1 || !Number.isInteger(page)) {
        throw new Error('Invalid page number');
      }

      const response = await axios.get(
        `https://hivve.westus.cloudapp.azure.com/api/v1/admin/getTests?type=${type}&filter=${apiFilter}&page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Validate response data
      if (!response.data || typeof response.data.totalRecords !== 'number' || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from server');
      }

      return {
        data: response.data.data,
        totalRecords: response.data.totalRecords,
        type,
        filter,
        page,
      };
    } catch (error) {
      // Extract meaningful error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch test results';
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Test Details
export const fetchTestDetail = createAsyncThunk(
  'testResult/fetchTestDetail',
  async ({ id, type }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.get(
        `https://hivve.westus.cloudapp.azure.com/api/v1/admin/getTest/${id}?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch test detail';
      return rejectWithValue(errorMessage);
    }
  }
);

const testResultSlice = createSlice({
  name: 'testResult',
  initialState: {
    results: [],
    totalRecords: 0,
    loading: false,
    error: null,
    currentType: 'PGX',
    currentFilter: 'all',
    currentPage: 1,
    testDetail: null,
    detailLoading: false,
    detailError: null,
    statusUpdates: {},
  },
  reducers: {
    setType: (state, action) => {
      state.currentType = action.payload;
      state.currentPage = 1; // Reset page when type changes
    },
    setFilter: (state, action) => {
      state.currentFilter = action.payload;
      state.currentPage = 1; // Reset page when filter changes
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearTestDetail: (state) => {
      state.testDetail = null;
      state.detailError = null;
    },
    updateStatus: (state, action) => {
      const { id, status } = action.payload;
      state.statusUpdates[id] = {
        status,
        updatedAt: new Date().toISOString(),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchTestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.totalRecords = action.payload.totalRecords;
        state.currentType = action.payload.type;
        state.currentFilter = action.payload.filter;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchTestResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.results = []; // Clear results on error
        state.totalRecords = 0; // Reset total records
      })
      // Fetch details
      .addCase(fetchTestDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchTestDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.testDetail = action.payload;
      })
      .addCase(fetchTestDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export const { setType, setFilter, setPage, clearTestDetail, updateStatus } = testResultSlice.actions;
export default testResultSlice.reducer;