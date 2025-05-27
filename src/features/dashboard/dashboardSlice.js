import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.get(
        'https://hivve.westus.cloudapp.azure.com/api/v1/admin/dashboard',
        {
          params: {
            selectedMonth: 'April 2025',
            selectedMonthForTransactions: 'April 2025',
            userType: 'patient',
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data.patients[0];
    } catch (err) {
      if (err.response?.data) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue(err.message || 'An unexpected error occurred');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.stats = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.stats = null;
      });
  },
});

export default dashboardSlice.reducer;
