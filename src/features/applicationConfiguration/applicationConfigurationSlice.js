import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch Config
export const fetchApplicationConfiguration = createAsyncThunk(
  'applicationConfiguration/fetchApplicationConfiguration',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(
        'https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationConfigurations',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update Config
export const updateConfig = createAsyncThunk(
  'applicationConfiguration/updateConfig',
  async ({ config }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.patch(
        `https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationConfigurations`,
        config,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { data: response.data.data, message: 'Configuration updated successfully!' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const applicationConfigurationSlice = createSlice({
  name: 'applicationConfiguration',
  initialState: {
    config: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationConfiguration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationConfiguration.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchApplicationConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload.data;
        state.successMessage = action.payload.message;
        // Don't reset the config unless required:
        state.config = action.payload.config || state.config;
      })
      .addCase(updateConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = applicationConfigurationSlice.actions;
export default applicationConfigurationSlice.reducer;
