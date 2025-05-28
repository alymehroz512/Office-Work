import { configureStore } from '@reduxjs/toolkit';
import applicationConfigurationReducer, {
  fetchApplicationConfiguration,
  updateConfig,
  clearMessages
} from './applicationConfigurationSlice';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('applicationConfigurationSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        applicationConfiguration: applicationConfigurationReducer,
        auth: (state = { token: 'test-token' }) => state,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchApplicationConfiguration', () => {
    const mockConfigData = {
      amountOnGenes: 100,
      amountOnPGX: 200,
      blockchainUrlForBacked: 'test-url',
    };

    it('should fetch configuration successfully', async () => {
      axios.get.mockResolvedValueOnce({ data: { data: mockConfigData } });

      await store.dispatch(fetchApplicationConfiguration());
      const state = store.getState().applicationConfiguration;

      expect(state.loading).toBe(false);
      expect(state.config).toEqual(mockConfigData);
      expect(state.error).toBe(null);
      expect(axios.get).toHaveBeenCalledWith(
        'https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationConfigurations',
        {
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );
    });

    it('should handle fetch configuration error', async () => {
      const errorMessage = 'Failed to fetch';
      axios.get.mockRejectedValueOnce({ response: { data: errorMessage } });

      await store.dispatch(fetchApplicationConfiguration());
      const state = store.getState().applicationConfiguration;

      expect(state.loading).toBe(false);
      expect(state.config).toBe(null);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateConfig', () => {
    const mockConfig = {
      amountOnGenes: 150,
      amountOnPGX: 250,
    };

    const mockResponse = {
      data: {
        data: mockConfig,
        message: 'Configuration updated successfully!',
      },
    };

    it('should update configuration successfully', async () => {
      axios.patch.mockResolvedValueOnce(mockResponse);

      await store.dispatch(updateConfig({ config: mockConfig }));
      const state = store.getState().applicationConfiguration;

      expect(state.loading).toBe(false);
      expect(state.config).toEqual(mockConfig);
      expect(state.successMessage).toBe('Configuration updated successfully!');
      expect(state.error).toBe(null);
      expect(axios.patch).toHaveBeenCalledWith(
        'https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationConfigurations',
        mockConfig,
        {
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );
    });

    it('should handle update configuration error', async () => {
      const errorMessage = 'Update failed';
      axios.patch.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

      await store.dispatch(updateConfig({ config: mockConfig }));
      const state = store.getState().applicationConfiguration;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.successMessage).toBe(null);
    });
  });

  describe('clearMessages', () => {
    it('should clear error and success messages', () => {
      // Set initial state with messages
      store = configureStore({
        reducer: {
          applicationConfiguration: applicationConfigurationReducer,
        },
        preloadedState: {
          applicationConfiguration: {
            error: 'Test error',
            successMessage: 'Test success',
            config: null,
            loading: false,
          },
        },
      });

      store.dispatch(clearMessages());
      const state = store.getState().applicationConfiguration;

      expect(state.error).toBe(null);
      expect(state.successMessage).toBe(null);
    });
  });

  // Test initial state
  it('should have correct initial state', () => {
    const initialState = store.getState().applicationConfiguration;
    expect(initialState).toEqual({
      config: null,
      loading: false,
      error: null,
      successMessage: null,
    });
  });
});
