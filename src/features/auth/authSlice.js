import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Updated thunk to return both user and token as payload
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://hivve.westus.cloudapp.azure.com/api/v1/auth/login', credentials);
      // Return the full response data (user + token)
      return response.data;
    } catch (err) {
      // Return error message string or generic fallback
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch');
    }
  }
);

const initialState = {
  user: null,
  token: null,      // added token state
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;   // user object
        state.token = action.payload.token; // token string
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
