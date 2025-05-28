import React from 'react';
import { describe, expect, it, beforeEach, jest, afterEach } from "@jest/globals";
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from './DashboardPage';
import dashboardReducer, { fetchDashboardData } from '../features/dashboard/dashboardSlice';
import authReducer from '../features/auth/authSlice';
import { act } from 'react';
import renderer from 'react-test-renderer';

// Mock dispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('DashboardPage', () => {
  let store;

  const mockStats = {
    totalUsers: 100,
    wallet_count: 75,
    medications_count: 50,
    genes_count: 25,
    not_have_wallet_counts: 25,
  };

  beforeEach(() => {
    mockDispatch.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (preloadedState = {}) => {
    store = configureStore({
      reducer: {
        dashboard: dashboardReducer,
        auth: authReducer,
      },
      preloadedState: {
        auth: { token: 'test-token' },
        ...preloadedState,
      },
    });

    return render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );
  };

  describe('Component Lifecycle', () => {
    it('should dispatch fetchDashboardData on mount', () => {
      renderComponent();
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should cleanup properly on unmount', () => {
      const { unmount } = renderComponent();
      unmount();
      // Add specific cleanup checks if needed
    });
  });

  describe('Loading States', () => {
    it('should render loading state initially', () => {
      renderComponent({
        dashboard: { loading: true, stats: null, error: null },
      });

      // Check if loading spinners are displayed
      const cards = screen.getAllByTestId('dashboard-card');
      cards.forEach(card => {
        expect(card).toHaveAttribute('aria-busy', 'true');
        const spinner = card.querySelector('.spinner-border');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('role', 'status');
      });

      // Check if skeleton lines are displayed
      cards.forEach(card => {
        const skeletonLine = card.querySelector('.skeleton-line');
        expect(skeletonLine).toBeInTheDocument();
      });

      // Verify card titles are not visible during loading
      expect(screen.queryAllByTestId('card-title')).toHaveLength(0);
    });

    it('should remove loading states after data is loaded', async () => {
      store.dispatch(fetchDashboardData.fulfilled(mockStats, ''));
      renderComponent();

      await waitFor(() => {
        const spinners = screen.queryAllByRole('status');
        expect(spinners).toHaveLength(0);
      });
    });
  });

  describe('Data Display', () => {
    it('should render dashboard data when loaded successfully', () => {
      renderComponent({
        dashboard: { loading: false, stats: mockStats, error: null },
      });

      // Check each card's value
      expect(screen.getByLabelText('Total Users: 100')).toBeInTheDocument();
      expect(screen.getByLabelText('Wallet Count: 75')).toBeInTheDocument();
      expect(screen.getByLabelText('Medications Count: 50')).toBeInTheDocument();
      expect(screen.getByLabelText('Genes Count: 25')).toBeInTheDocument();
      expect(screen.getByLabelText('Users Without Wallet: 25')).toBeInTheDocument();
    });

    it('should handle empty or null values gracefully', () => {
      const emptyStats = {
        totalUsers: 0,
        wallet_count: null,
        medications_count: undefined,
        genes_count: 0,
        not_have_wallet_counts: 0,
      };

      renderComponent({
        dashboard: { loading: false, stats: emptyStats, error: null },
      });

      // All null/undefined values should be displayed as '0'
      expect(screen.getByLabelText('Total Users: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Wallet Count: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Medications Count: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Genes Count: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Users Without Wallet: 0')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render error message when loading fails', () => {
      const errorMessage = 'Failed to load dashboard data';
      
      renderComponent({
        dashboard: { loading: false, stats: null, error: errorMessage },
      });

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveClass('alert', 'alert-danger');
      expect(errorAlert).toHaveTextContent(errorMessage);
    });

    it('should handle network errors appropriately', () => {
      const networkError = new Error('Network error');
      
      renderComponent({
        dashboard: { loading: false, stats: null, error: networkError },
      });

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Network error');
    });

    it('should handle API errors with error object', () => {
      const apiError = { message: 'API error occurred' };
      
      renderComponent({
        dashboard: { loading: false, stats: null, error: apiError },
      });

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('API error occurred');
    });
  });

  describe('Error States', () => {
    it('should handle malformed response data', () => {
      const malformedStats = {
        totalUsers: 'invalid',
        wallet_count: null,
        medications_count: undefined,
        genes_count: NaN,
        not_have_wallet_counts: '25',
      };

      renderComponent({
        dashboard: { loading: false, stats: malformedStats, error: null },
      });

      // All invalid values should be displayed as '0'
      expect(screen.getByLabelText('Total Users: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Wallet Count: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Medications Count: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Genes Count: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Users Without Wallet: 25')).toBeInTheDocument();
    });
  });

  describe('UI/UX', () => {
    let originalInnerWidth;

    beforeEach(() => {
      // Store original window.innerWidth
      originalInnerWidth = window.innerWidth;
      // Define innerWidth on window object
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
    });

    afterEach(() => {
      // Restore original window.innerWidth
      window.innerWidth = originalInnerWidth;
    });

    it('should render cards with correct styling', () => {
      renderComponent();

      // Check if cards have correct styling classes
      const cards = screen.getAllByTestId('dashboard-card');
      cards.forEach(card => {
        expect(card).toHaveClass('card', 'text-center', 'shadow-sm', 'p-4');
      });

      // Check if card titles have correct styling
      const cardTitles = screen.getAllByTestId('card-title');
      cardTitles.forEach(title => {
        expect(title).toHaveClass('card-title', 'text-primary');
      });
    });

    it('should have responsive layout classes', () => {
      renderComponent();

      const cardContainers = screen.getAllByTestId('card-container');
      cardContainers.forEach(container => {
        expect(container).toHaveClass('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
      });
    });

    it('should maintain layout on window resize', () => {
      renderComponent();
      
      // Simulate window resize
      window.innerWidth = 768;
      fireEvent(window, new Event('resize'));
      
      const cardContainers = screen.getAllByTestId('card-container');
      cardContainers.forEach(container => {
        expect(container).toHaveClass('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
      });
    });
  });

  it('should not fetch data if no token is present', () => {
    renderComponent({
      auth: {
        token: null
      }
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should fetch data when token is present', () => {
    renderComponent({
      auth: {
        token: 'test-token',
      },
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('should show loading state initially', () => {
    renderComponent({
      auth: { token: 'test-token' },
      dashboard: { loading: true, stats: null, error: null },
    });

    // Check for loading spinners
    const spinners = screen.getAllByRole('status');
    expect(spinners).toHaveLength(5);

    // Check for loading placeholders
    const cards = screen.getAllByTestId('dashboard-card');
    cards.forEach(card => {
      expect(card).toHaveAttribute('aria-busy', 'true');
    });

    // Check for loading labels
    spinners.forEach((spinner) => {
      expect(spinner).toHaveAttribute('aria-label', expect.stringContaining('Loading'));
    });
  });

  it('should display dashboard data when loaded', () => {
    renderComponent({
      auth: { token: 'test-token' },
      dashboard: { loading: false, stats: mockStats, error: null },
    });

    // Check if all stats are displayed
    const cards = screen.getAllByTestId('dashboard-card');
    expect(cards).toHaveLength(5);

    // Check Total Users card
    const totalUsersValue = screen.getByLabelText('Total Users: 100');
    expect(totalUsersValue).toHaveTextContent('100');

    // Check Wallet Count card
    const walletCountValue = screen.getByLabelText('Wallet Count: 75');
    expect(walletCountValue).toHaveTextContent('75');

    // Check Medications Count card
    const medicationsValue = screen.getByLabelText('Medications Count: 50');
    expect(medicationsValue).toHaveTextContent('50');

    // Check Genes Count card
    const genesValue = screen.getByLabelText('Genes Count: 25');
    expect(genesValue).toHaveTextContent('25');

    // Check Users Without Wallet card
    const noWalletValue = screen.getByLabelText('Users Without Wallet: 25');
    expect(noWalletValue).toHaveTextContent('25');
  });

  it('should handle null or undefined values in stats', () => {
    const statsWithNulls = {
      totalUsers: null,
      wallet_count: undefined,
      medications_count: 50,
      genes_count: null,
      not_have_wallet_counts: undefined,
    };

    renderComponent({
      auth: { token: 'test-token' },
      dashboard: { loading: false, stats: statsWithNulls, error: null },
    });

    // Check if null/undefined values are displayed as '0'
    expect(screen.getByLabelText('Total Users: 0')).toHaveTextContent('0');
    expect(screen.getByLabelText('Wallet Count: 0')).toHaveTextContent('0');
    expect(screen.getByLabelText('Medications Count: 50')).toHaveTextContent('50');
    expect(screen.getByLabelText('Genes Count: 0')).toHaveTextContent('0');
    expect(screen.getByLabelText('Users Without Wallet: 0')).toHaveTextContent('0');
  });

  it('should display error message when there is an error', () => {
    const errorMessage = 'Failed to fetch dashboard data';
    
    renderComponent({
      auth: { token: 'test-token' },
      dashboard: { loading: false, stats: null, error: errorMessage },
    });

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(errorMessage);
  });

  it('should handle network errors appropriately', () => {
    const networkError = new Error('Network error');
    
    renderComponent({
      auth: { token: 'test-token' },
      dashboard: { loading: false, stats: null, error: networkError },
    });

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Network error');
  });

  it('should handle API errors with error object', () => {
    const apiError = { message: 'API error occurred' };
    
    renderComponent({
      auth: { token: 'test-token' },
      dashboard: { loading: false, stats: null, error: apiError },
    });

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('API error occurred');
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all cards', () => {
      renderComponent({
        auth: { token: 'test-token' },
        dashboard: { loading: false, stats: mockStats, error: null },
      });

      expect(screen.getByLabelText('Total Users: 100')).toBeInTheDocument();
      expect(screen.getByLabelText('Wallet Count: 75')).toBeInTheDocument();
      expect(screen.getByLabelText('Medications Count: 50')).toBeInTheDocument();
      expect(screen.getByLabelText('Genes Count: 25')).toBeInTheDocument();
      expect(screen.getByLabelText('Users Without Wallet: 25')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for loading states', () => {
      renderComponent({
        auth: { token: 'test-token' },
        dashboard: { loading: true, stats: null, error: null },
      });

      const loadingSpinners = screen.getAllByRole('status');
      loadingSpinners.forEach(spinner => {
        expect(spinner).toHaveAttribute('aria-label', expect.stringContaining('Loading'));
      });
    });

    it('should announce error messages to screen readers', () => {
      const errorMessage = 'Failed to load dashboard data';
      renderComponent({
        auth: { token: 'test-token' },
        dashboard: { loading: false, stats: null, error: errorMessage },
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(errorMessage);
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error States', () => {
    it('should handle network timeout errors', () => {
      const timeoutError = new Error('Request timed out');
      renderComponent({
        auth: { token: 'test-token' },
        dashboard: { loading: false, stats: null, error: timeoutError },
      });

      expect(screen.getByRole('alert')).toHaveTextContent('Request timed out');
    });

    it('should handle server errors with details', () => {
      const serverError = {
        message: 'Internal Server Error',
        details: 'Database connection failed'
      };
      renderComponent({
        auth: { token: 'test-token' },
        dashboard: { loading: false, stats: null, error: serverError },
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Internal Server Error');
    });
  });

  it('renders correctly in different states', async () => {
    // Test loading state
    const loadingStore = configureStore({
      reducer: {
        dashboard: dashboardReducer,
        auth: authReducer,
      },
      preloadedState: {
        dashboard: { loading: true, stats: null, error: null },
        auth: { token: 'test-token' },
      },
    });

    render(
      <Provider store={loadingStore}>
        <DashboardPage />
      </Provider>
    );

    // Loading state assertions
    const spinners = screen.getAllByRole('status');
    expect(spinners).toHaveLength(5); // 5 loading spinners
    spinners.forEach(spinner => {
      expect(spinner).toHaveClass('spinner-border');
      expect(spinner).toHaveClass('text-primary');
    });
    expect(screen.getAllByTestId('dashboard-card')).toHaveLength(5); // 5 cards
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    cleanup();

    // Test loaded state with data
    const loadedStore = configureStore({
      reducer: {
        dashboard: dashboardReducer,
        auth: authReducer,
      },
      preloadedState: {
        dashboard: { loading: false, stats: mockStats, error: null },
        auth: { token: 'test-token' },
      },
    });

    render(
      <Provider store={loadedStore}>
        <DashboardPage />
      </Provider>
    );

    // Loaded state assertions
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // No loading spinners
    const cards = screen.getAllByTestId('dashboard-card');
    expect(cards).toHaveLength(5); // 5 cards

    // Check card titles and values
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByLabelText(`Total Users: ${mockStats.totalUsers}`)).toHaveTextContent(mockStats.totalUsers.toString());

    expect(screen.getByText('Wallet Count')).toBeInTheDocument();
    expect(screen.getByLabelText(`Wallet Count: ${mockStats.wallet_count}`)).toHaveTextContent(mockStats.wallet_count.toString());

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    cleanup();

    // Test error state
    const errorStore = configureStore({
      reducer: {
        dashboard: dashboardReducer,
        auth: authReducer,
      },
      preloadedState: {
        dashboard: { loading: false, stats: null, error: 'Error loading dashboard' },
        auth: { token: 'test-token' },
      },
    });

    render(
      <Provider store={errorStore}>
        <DashboardPage />
      </Provider>
    );

    // Error state assertions
    expect(screen.queryByRole('status')).not.toBeInTheDocument(); // No loading spinners
    expect(screen.queryByTestId('dashboard-card')).not.toBeInTheDocument(); // No cards
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveClass('alert', 'alert-danger', 'text-center');
    expect(errorAlert).toHaveTextContent('Error loading dashboard');
  });
});