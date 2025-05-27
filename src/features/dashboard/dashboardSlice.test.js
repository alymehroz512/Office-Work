import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer, { fetchDashboardData } from './dashboardSlice';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('dashboardSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: () => ({ token: 'test-token' }), // Mock auth reducer
        dashboard: dashboardReducer,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDashboardData', () => {
    const mockDashboardData = {
      totalUsers: 100,
      wallet_count: 75,
      medications_count: 50,
      genes_count: 25,
      not_have_wallet_counts: 25,
    };

    it('should fetch dashboard data successfully', async () => {
      // Mock successful API response
      axios.get.mockResolvedValueOnce({
        data: {
          data: {
            patients: [mockDashboardData],
          },
        },
      });

      // Dispatch the action
      const result = await store.dispatch(fetchDashboardData());

      // Check if the API was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        'https://hivve.westus.cloudapp.azure.com/api/v1/admin/dashboard',
        {
          params: {
            selectedMonth: 'April 2025',
            selectedMonthForTransactions: 'April 2025',
            userType: 'patient',
          },
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );

      // Check if the action was fulfilled
      expect(result.type).toBe(fetchDashboardData.fulfilled.type);
      expect(result.payload).toEqual(mockDashboardData);

      // Check if the state was updated correctly
      const state = store.getState().dashboard;
      expect(state.stats).toEqual(mockDashboardData);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle API error', async () => {
      const errorMessage = 'Failed to fetch dashboard data';
      
      // Mock API error
      axios.get.mockRejectedValueOnce({
        response: {
          data: errorMessage,
        },
      });

      // Dispatch the action
      const result = await store.dispatch(fetchDashboardData());

      // Check if the action was rejected
      expect(result.type).toBe(fetchDashboardData.rejected.type);
      expect(result.payload).toBe(errorMessage);

      // Check if the state was updated correctly
      const state = store.getState().dashboard;
      expect(state.stats).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle network error', async () => {
      const errorMessage = 'Network Error';
      
      // Mock network error
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      // Dispatch the action
      const result = await store.dispatch(fetchDashboardData());

      // Check if the action was rejected
      expect(result.type).toBe(fetchDashboardData.rejected.type);
      expect(result.payload).toBe(errorMessage);

      // Check if the state was updated correctly
      const state = store.getState().dashboard;
      expect(state.stats).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should set loading state while fetching', () => {
      // Dispatch the pending action
      store.dispatch(fetchDashboardData.pending());

      // Check if loading state is set correctly
      const state = store.getState().dashboard;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });
});
