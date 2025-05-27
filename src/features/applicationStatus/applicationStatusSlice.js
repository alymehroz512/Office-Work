// src/features/applicationStatus/applicationStatusSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchApplicationStatus = createAsyncThunk(
  'applicationStatus/fetchApplicationStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token; 
      const response = await axios.get(
        'https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationStatus',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch application status'
      );
    }
  }
);

const applicationStatusSlice = createSlice({
  name: 'applicationStatus',
  initialState: {
    statusData: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statusData = action.payload;
      })
      .addCase(fetchApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default applicationStatusSlice.reducer;