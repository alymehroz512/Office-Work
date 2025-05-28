import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ApplicationConfigurationPage from './ApplicationConfigurationPage';
import applicationConfigurationReducer, {
  fetchApplicationConfiguration,
  updateConfig,
} from '../features/applicationConfiguration/applicationConfigurationSlice';

// Mock Redux dispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('ApplicationConfigurationPage', () => {
  let store;
  const mockConfig = {
    amountOnGenes: 100,
    amountOnPGX: 200,
    amountOnBlood: 300,
    amountOnToxicology: 400,
    amountOnInfectious: 500,
    amountOnMedications: 600,
    blockchainUrlForBacked: 'test-url-backend',
    blockchainUrlForBridge: 'test-url-bridge',
    polkadotPublicKey: 'test-polkadot-key',
    mainAccountEth: 'test-eth-account',
    publicKeyEth: 'test-eth-key',
    stripeSecretKey: 'test-stripe-key',
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        applicationConfiguration: applicationConfigurationReducer,
      },
      preloadedState: {
        applicationConfiguration: {
          config: mockConfig,
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });
    mockDispatch.mockClear();
  });

  it('fetches configuration on mount', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it('displays loading state', async () => {
    store = configureStore({
      reducer: {
        applicationConfiguration: applicationConfigurationReducer,
      },
      preloadedState: {
        applicationConfiguration: {
          config: null,
          loading: true,
          error: null,
          successMessage: null,
        },
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('displays configuration values', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });

    expect(screen.getByLabelText('Reward Amount on Genes')).toHaveValue(100);
    expect(screen.getByLabelText('Reward Amount on PGX')).toHaveValue(200);
    expect(screen.getByLabelText('Blockchain URL for Backend')).toHaveValue('test-url-backend');
  });

  it('allows editing configuration values', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });

    // Find the pencil icon for Reward Amount on Genes
    const genesInput = screen.getByLabelText('Reward Amount on Genes');
    const genesEditIcon = genesInput.closest('.form-floating').querySelector('.fa-pencil');
    
    await act(async () => {
      fireEvent.click(genesEditIcon);
    });

    // Edit the value
    await act(async () => {
      fireEvent.change(genesInput, { target: { value: '150' } });
    });

    // Submit the form
    const submitButton = screen.getByText('Submit');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify that dispatch was called three times
    expect(mockDispatch).toHaveBeenCalledTimes(3); // Initial fetch + update + fetch after update
    
    // Get all dispatch calls that were made
    const dispatchCalls = mockDispatch.mock.calls;
    
    // All calls should be functions (thunks)
    dispatchCalls.forEach(call => {
      expect(typeof call[0]).toBe('function');
    });
  });

  it('displays success message', async () => {
    store = configureStore({
      reducer: {
        applicationConfiguration: applicationConfigurationReducer,
      },
      preloadedState: {
        applicationConfiguration: {
          config: mockConfig,
          loading: false,
          error: null,
          successMessage: 'Configuration updated successfully!',
        },
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });

    expect(screen.getByText('Configuration updated successfully!')).toBeInTheDocument();
  });

  it('displays error message', async () => {
    store = configureStore({
      reducer: {
        applicationConfiguration: applicationConfigurationReducer,
      },
      preloadedState: {
        applicationConfiguration: {
          config: mockConfig,
          loading: false,
          error: 'Failed to update configuration',
          successMessage: null,
        },
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });

    expect(screen.getByText('Failed to update configuration')).toBeInTheDocument();
  });

  it('handles input changes correctly', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });

    // Find the pencil icon for Reward Amount on PGX
    const pgxInput = screen.getByLabelText('Reward Amount on PGX');
    const pgxEditIcon = pgxInput.closest('.form-floating').querySelector('.fa-pencil');
    
    await act(async () => {
      fireEvent.click(pgxEditIcon);
    });

    // Edit the value
    await act(async () => {
      fireEvent.change(pgxInput, { target: { value: '250' } });
    });

    expect(pgxInput.value).toBe('250');
  });

  it('disables inputs when not in edit mode', async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ApplicationConfigurationPage />
        </Provider>
      );
    });

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });
});
