import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch Polkadot Transactions
export const fetchPolkadotTransactions = createAsyncThunk(
  'bridge/fetchPolkadotTransactions',
  async ({ page, pageSize, search }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(
        `https://hivve.westus.cloudapp.azure.com/api/v1/admin/PolkadotTransactions?page=${page}&pageSize=${pageSize}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Ethereum Transactions
export const fetchEthereumAddress = createAsyncThunk(
  'bridge/fetchEthereumAddress',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(
        'https://hivve.westus.cloudapp.azure.com/api/v1/admin/EthTransactions',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch a single (or related) Polkadot Transaction(s)
export const fetchSinglePolkadotTransaction = createAsyncThunk(
  'bridge/fetchSinglePolkadotTransaction',
  async (transactionId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(
        `https://hivve.westus.cloudapp.azure.com/api/v1/admin/getSingleTrasaction/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data; // this is an array
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// Slice
const bridgeSlice = createSlice({
  name: 'bridge',
  initialState: {
    polkadot: {
      transactions: [],
      singleTransaction: null,
      totalRecords: 0,
      balance: 0,
      address: '',
      loading: false,
      error: null,
    },
    ethereum: {
      balance: 0,
      address: '',
      loading: false,
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Polkadot Transactions
      .addCase(fetchPolkadotTransactions.pending, (state) => {
        state.polkadot.loading = true;
        state.polkadot.error = null;
      })
      .addCase(fetchPolkadotTransactions.fulfilled, (state, action) => {
        state.polkadot.loading = false;
        state.polkadot.transactions = action.payload.transactions;
        state.polkadot.totalRecords = action.payload.totalRecords;
        state.polkadot.balance = action.payload.balance;
        state.polkadot.address = action.payload.address;
      })
      .addCase(fetchPolkadotTransactions.rejected, (state, action) => {
        state.polkadot.loading = false;
        state.polkadot.error = action.payload;
      })

      // Fetch Single Polkadot Transaction
      .addCase(fetchSinglePolkadotTransaction.pending, (state) => {
        state.polkadot.loading = true;
        state.polkadot.error = null;
        state.polkadot.singleTransaction = null;
      })
      .addCase(fetchSinglePolkadotTransaction.fulfilled, (state, action) => {
        state.polkadot.loading = false;
        state.polkadot.singleTransaction = action.payload;
        state.singleTransaction = action.payload;
      })
      .addCase(fetchSinglePolkadotTransaction.rejected, (state, action) => {
        state.polkadot.loading = false;
        state.polkadot.error = action.payload;
      })

      // Ethereum
      .addCase(fetchEthereumAddress.pending, (state) => {
        state.ethereum.loading = true;
        state.ethereum.error = null;
      })
      .addCase(fetchEthereumAddress.fulfilled, (state, action) => {
        state.ethereum.loading = false;
        state.ethereum.balance = action.payload.balance;
        state.ethereum.address = action.payload.address;
      })
      .addCase(fetchEthereumAddress.rejected, (state, action) => {
        state.ethereum.loading = false;
        state.ethereum.error = action.payload;
      });
  },
});

export default bridgeSlice.reducer;
