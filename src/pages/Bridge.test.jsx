import React from 'react';
import { describe, expect, it, beforeEach, jest, afterEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Bridge from './Bridge';
import bridgeReducer from '../features/bridge/bridgeSlice';

const mockInitialState = {
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
  }
};

// Mock the bridge slice actions
jest.mock('../features/bridge/bridgeSlice', () => {
  const mockReducer = (state = mockInitialState, action) => {
    switch (action.type) {
      case 'bridge/fetchPolkadotTransactions/fulfilled':
        return {
          ...state,
          polkadot: {
            ...state.polkadot,
            ...action.payload.polkadot,
          },
        };
      case 'bridge/fetchEthereumAddress/fulfilled':
        return {
          ...state,
          ethereum: {
            ...state.ethereum,
            ...action.payload.ethereum,
          },
        };
      case 'bridge/fetchSinglePolkadotTransaction/fulfilled':
        return {
          ...state,
          polkadot: {
            ...state.polkadot,
            ...action.payload.polkadot,
          },
        };
      default:
        return state;
    }
  };

  return {
    __esModule: true,
    default: mockReducer,
    fetchPolkadotTransactions: jest.fn(() => async (dispatch) => {
      dispatch({
        type: 'bridge/fetchPolkadotTransaction/fulfilled',
        payload: {
          polkadot: {
            transactions: [{
              _id: 1,
              senderKey: 'sender1',
              receiverKey: 'receiver1',
              amount: 100,
              date: '2024-01-01',
              transactionType: 'ETH',
            }],
            totalRecords: 1,
            loading: false,
          },
        },
      });
    }),
    fetchEthereumAddress: jest.fn(() => async (dispatch) => {
      dispatch({
        type: 'bridge/fetchEthereumAddress/fulfilled',
        payload: {
          ethereum: {
            balance: 0,
            address: 'ethereum123',
            loading: false,
          },
        },
      });
    }),
    fetchSinglePolkadotTransaction: jest.fn(() => async (dispatch) => {
      // Simulate a delay to allow skeleton to render
      await new Promise((resolve) => setTimeout(resolve, 100));
      dispatch({
        type: 'bridge/fetchSinglePolkadotTransaction/fulfilled',
        payload: {
          polkadot: {
            singleTransaction: {
              _id: 1,
              senderKey: 'sender1',
              receiverKey: 'receiver1',
              amount: 100,
              date: '2024-01-01',
              transactionType: 'ETH',
              network: 'Ethereum',
              sender: 'sender1',
              receiver: 'receiver1',
              blockNumber: '12345',
              blockHash: 'blockhash123',
              txHash: 'txhash123',
              status: 'success',
            },
            loading: false,
          },
        },
      });
    }),
  };
});

// Mock the images
jest.mock('../images/polkadot.png', () => 'polkadot-image-mock');
jest.mock('../images/ethereum.png', () => 'ethereum-image-mock');

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('Bridge Component', () => {
  let store;

  const createStore = (initialState = {}) => {
    const store = configureStore({
      reducer: {
        bridge: bridgeReducer,
        auth: (state = { token: 'test-token' }) => state,
      },
      preloadedState: {
        bridge: {
          ...mockInitialState,
          ...initialState,
        },
        auth: {
          token: 'test-token',
        },
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
      }),
    });

    // Mock dispatch
    store.dispatch = jest.fn(store.dispatch);
    return store;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    store = createStore();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderComponent = (initialState = {}) => {
    store = createStore(initialState);
    return render(
      <Provider store={store}>
        <Bridge />
      </Provider>
    );
  };

  describe('Initial Render', () => {
    it('should show loading skeletons initially', async () => {
      renderComponent({
        polkadot: {
          loading: true,
          transactions: [],
          totalRecords: 0,
        }
      });

      await waitFor(() => {
        const skeletons = screen.getAllByTestId('skeleton-line');
        expect(skeletons.length).toBeGreaterThan(0);
      });
    });

    it('should dispatch initial data fetching actions', async () => {
      renderComponent();

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(store.dispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Address Display and Copy', () => {
    it('should display formatted addresses', async () => {
      renderComponent({
        polkadot: { address: 'polkadot123' },
        ethereum: { address: 'ethereum123' },
      });

      await waitFor(() => {
        expect(screen.getByText('polkadot123...polkadot123')).toBeInTheDocument();
        expect(screen.getByText('ethereum123...ethereum123')).toBeInTheDocument();
      });
    });

    it('should copy address to clipboard when clicked', async () => {
      renderComponent({
        polkadot: { address: 'polkadot123' },
      });

      const copyButton = await screen.findByRole('button', { name: /copy polkadot address/i });
      await act(async () => {
        fireEvent.click(copyButton);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('polkadot123');
    });
  });

  describe('Transaction Table', () => {
    it('should render transaction data correctly with CreatedAt field', async () => {
      renderComponent({
        polkadot: {
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            CreatedAt: '2024-01-01T00:00:00.000Z',
            transactionType: 'ETH',
          }],
          loading: false,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('01-01-2024')).toBeInTheDocument();
        expect(screen.getByText('sender1...sender1')).toBeInTheDocument();
        expect(screen.getByText('receiver1...receiver1')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // Amount is Math.floor(100 / 1e10)
        expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
      });
    });

    it('should render transaction data correctly with date field', async () => {
      renderComponent({
        polkadot: {
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            date: '2024-01-01',
            transactionType: 'ETH',
          }],
          loading: false,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('01-01-2024')).toBeInTheDocument();
        expect(screen.getByText('sender1...sender1')).toBeInTheDocument();
        expect(screen.getByText('receiver1...receiver1')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
      });
    });

    it('should handle missing date fields gracefully', async () => {
      // Override mock to ensure no date is provided
      const { fetchPolkadotTransactions } = require('../features/bridge/bridgeSlice');
      fetchPolkadotTransactions.mockImplementationOnce(() => async (dispatch) => {
        dispatch({
          type: 'bridge/fetchPolkadotTransactions/fulfilled',
          payload: {
            polkadot: {
              transactions: [{
                _id: 1,
                senderKey: 'sender1',
                receiverKey: 'receiver1',
                amount: 100,
                transactionType: 'ETH',
              }],
              totalRecords: 1,
              loading: false,
            },
          },
        });
      });

      renderComponent({
        polkadot: {
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            transactionType: 'ETH',
          }],
          loading: false,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
        expect(screen.getByText('sender1...sender1')).toBeInTheDocument();
        expect(screen.getByText('receiver1...receiver1')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
      });
    });

    it('should handle pagination changes', async () => {
      renderComponent({
        polkadot: {
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            date: '2024-01-01',
            transactionType: 'ETH',
          }],
          totalRecords: 20,
          loading: false,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      const nextPageButton = await screen.findByRole('button', { name: 'Next page' });
      await act(async () => {
        fireEvent.click(nextPageButton);
      });

      await waitFor(() => {
        expect(store.dispatch).toHaveBeenCalled();
      });
    });

    it('should handle search input', async () => {
      renderComponent({
        polkadot: {
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            date: '2024-01-01',
            transactionType: 'ETH',
          }],
          loading: false,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      const searchInput = await screen.findByPlaceholderText(/search by sender key/i);
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'test' } });
      });

      await waitFor(() => {
        expect(store.dispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Detail View', () => {
    it('should show transaction details when clicking detail button', async () => {
      renderComponent({
        polkadot: {
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            date: '2024-01-01',
            transactionType: 'ETH',
          }],
          loading: false,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('sender1...sender1')).toBeInTheDocument();
        expect(screen.getByText('receiver1...receiver1')).toBeInTheDocument();
        expect(screen.getByText('01-01-2024')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });

      const detailButton = await screen.findByRole('button', { name: 'Details' });
      await act(async () => {
        fireEvent.click(detailButton);
      });

      // Check for skeleton during loading
      await waitFor(() => {
        expect(screen.getAllByTestId('skeleton-line').length).toBeGreaterThan(0);
      }, { timeout: 200 });

      await act(async () => {
        jest.runAllTimers();
      });

      // Check for final transaction details
      await waitFor(() => {
        expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
        expect(screen.getByText('Transaction Details of Ethereum to Ethereum')).toBeInTheDocument();
      });
    }, 15000);

    it('should return to list view when clicking back button', async () => {
      renderComponent({
        polkadot: {
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            date: '2024-01-01',
            transactionType: 'ETH',
          }],
          loading: false,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('sender1...sender1')).toBeInTheDocument();
        expect(screen.getByText('receiver1...receiver1')).toBeInTheDocument();
        expect(screen.getByText('01-01-2024')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });

      const detailButton = await screen.findByRole('button', { name: 'Details' });
      await act(async () => {
        fireEvent.click(detailButton);
      });

      const backButton = await screen.findByRole('button', { name: 'Back to transactions' });
      await act(async () => {
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Transactions')).toBeInTheDocument();
      });
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Failed to fetch data';
      renderComponent({
        polkadot: {
          error: errorMessage,
          loading: false,
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            date: '2024-01-01',
            transactionType: 'ETH',
          }],
          totalRecords: 0,
          address: '',
          balance: 0,
          singleTransaction: null,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('sender1...sender1')).toBeInTheDocument();
        expect(screen.getByText('receiver1...receiver1')).toBeInTheDocument();
        expect(screen.getByText('01-01-2024')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });

      const detailButton = await screen.findByRole('button', { name: 'Details' });
      await act(async () => {
        fireEvent.click(detailButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(`Error: ${errorMessage}`);
      }, { timeout: 10000 });
    }, 15000);
  });

  describe('Loading States', () => {
    it('should show loading skeletons for table', async () => {
      renderComponent({
        polkadot: {
          loading: true,
          transactions: [],
          totalRecords: 0,
          address: '',
          balance: 0,
          error: null,
        },
      });

      await waitFor(() => {
        const skeletons = screen.getAllByTestId('skeleton-line');
        expect(skeletons.length).toBeGreaterThan(0);
      });
    }, 15000);

    it('should show loading skeletons for detail view', async () => {
      // Override mock to keep loading state
      const { fetchSinglePolkadotTransaction } = require('../features/bridge/bridgeSlice');
      fetchSinglePolkadotTransaction.mockImplementationOnce(() => async (dispatch) => {
        // Do not dispatch to keep isDetailLoading true
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      renderComponent({
        polkadot: {
          loading: false,
          singleTransaction: null,
          transactions: [{
            _id: 1,
            senderKey: 'sender1',
            receiverKey: 'receiver1',
            amount: 100,
            CreatedAt: '2024-01-01T00:00:00.000Z',
            transactionType: 'ETH',
          }],
          totalRecords: 0,
          address: '',
          balance: 0,
          error: null,
        },
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText('sender1...sender1')).toBeInTheDocument();
        expect(screen.getByText('receiver1...receiver1')).toBeInTheDocument();
        expect(screen.getByText('01-01-2024')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });

      const detailButton = await screen.findByRole('button', { name: 'Details' });
      await act(async () => {
        fireEvent.click(detailButton);
      });

      await waitFor(() => {
        const skeletons = screen.getAllByTestId('skeleton-line');
        expect(skeletons.length).toBeGreaterThan(0);
      }, { timeout: 200 });
    }, 15000);
  });
});