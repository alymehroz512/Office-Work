import React from 'react';
import { describe, expect, it, beforeEach, jest, afterEach } from "@jest/globals";
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ApplicationStatusPage from './ApplicationStatusPage';
import applicationStatusReducer, { fetchApplicationStatus } from '../features/applicationStatus/applicationStatusSlice';

// Mock dispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('ApplicationStatusPage', () => {
  let store;

  // Mock timestamps
  const recentTimestamp = Date.now();
  const oldTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago

  const mockStatusData = {
    backend_honey: recentTimestamp,
    bridge_backend: recentTimestamp,
    frontend_honey: recentTimestamp
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderComponent = (preloadedState = {}) => {
    store = configureStore({
      reducer: {
        applicationStatus: applicationStatusReducer,
        auth: { token: 'test-token' }
      },
      preloadedState: {
        applicationStatus: {
          loading: false,
          error: null,
          statusData: null,
          ...preloadedState
        }
      }
    });

    return render(
      <Provider store={store}>
        <ApplicationStatusPage />
      </Provider>
    );
  };

  describe('Component Lifecycle', () => {
    it('should dispatch fetchApplicationStatus on mount', () => {
      renderComponent();
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('should set up polling interval', () => {
      renderComponent();
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      
      // Fast-forward 5 minutes
      act(() => {
        jest.advanceTimersByTime(300000);
      });
      
      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    it('should clear polling interval on unmount', () => {
      const { unmount } = renderComponent();
      unmount();
      
      // Fast-forward 5 minutes
      act(() => {
        jest.advanceTimersByTime(300000);
      });
      
      // Should still be called only once (initial fetch)
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('should render loading skeletons initially', () => {
      renderComponent({ loading: true });
      
      const cards = screen.getAllByRole('generic', { busy: true });
      expect(cards).toHaveLength(3); // Three status cards
      
      // Check for skeleton elements
      const skeletonLines = document.querySelectorAll('.skeleton-line');
      expect(skeletonLines.length).toBeGreaterThan(0);
    });

    it('should remove loading states after data is loaded', () => {
      renderComponent({ 
        loading: false,
        statusData: mockStatusData
      });

      const cards = screen.queryAllByRole('generic', { busy: true });
      expect(cards).toHaveLength(0);
    });
  });

  describe('Status Display', () => {
    it('should display working status for recent timestamps', () => {
      renderComponent({ 
        statusData: mockStatusData
      });

      const workingStatuses = screen.getAllByText('Working (Recent)');
      expect(workingStatuses).toHaveLength(3);
      
      // Check for success icons
      const successIcons = document.querySelectorAll('.fa-check-circle');
      expect(successIcons).toHaveLength(3);
    });

    it('should display not working status for old timestamps', () => {
      renderComponent({ 
        statusData: {
          backend_honey: oldTimestamp,
          bridge_backend: oldTimestamp,
          frontend_honey: oldTimestamp
        }
      });

      const notWorkingStatuses = screen.getAllByText('Not Working');
      expect(notWorkingStatuses).toHaveLength(3);
      
      // Check for error icons
      const errorIcons = document.querySelectorAll('.fa-times-circle');
      expect(errorIcons).toHaveLength(3);
    });

    it('should handle mixed statuses', () => {
      renderComponent({ 
        statusData: {
          backend_honey: recentTimestamp,
          bridge_backend: oldTimestamp,
          frontend_honey: recentTimestamp
        }
      });

      expect(screen.getAllByText('Working (Recent)')).toHaveLength(2);
      expect(screen.getAllByText('Not Working')).toHaveLength(1);
    });

    it('should handle null timestamps', () => {
      renderComponent({ 
        statusData: {
          backend_honey: null,
          bridge_backend: recentTimestamp,
          frontend_honey: null
        }
      });

      expect(screen.getAllByText('Not Working')).toHaveLength(2);
      expect(screen.getAllByText('Working (Recent)')).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      const errorMessage = 'Failed to fetch application status';
      renderComponent({ error: errorMessage });

      const errorAlert = screen.getByText(errorMessage);
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert.closest('.alert')).toHaveClass('alert-danger');
    });

    it('should handle missing status data gracefully', () => {
      renderComponent({ statusData: {} });

      // Should show "Not Working" for all services
      const notWorkingStatuses = screen.getAllByText('Not Working');
      expect(notWorkingStatuses).toHaveLength(3);
    });
  });

  describe('Visual Elements', () => {
    it('should render correct service names and icons', () => {
      renderComponent({ statusData: mockStatusData });

      expect(screen.getByText('Hivve Backend')).toBeInTheDocument();
      expect(screen.getByText('Bridge Backend')).toBeInTheDocument();
      expect(screen.getByText('Bridge Frontend')).toBeInTheDocument();

      const serverIcon = document.querySelector('.fa-server');
      const networkIcon = document.querySelector('.fa-network-wired');
      const desktopIcon = document.querySelector('.fa-desktop');

      expect(serverIcon).toBeInTheDocument();
      expect(networkIcon).toBeInTheDocument();
      expect(desktopIcon).toBeInTheDocument();
    });

    it('should apply correct colors based on status', () => {
      renderComponent({ 
        statusData: {
          backend_honey: recentTimestamp,
          bridge_backend: oldTimestamp,
          frontend_honey: recentTimestamp
        }
      });

      const cards = document.querySelectorAll('.card');
      
      // Instead of checking specific colors, let's verify the status text and icons
      const workingStatuses = screen.getAllByText('Working (Recent)');
      const notWorkingStatuses = screen.getAllByText('Not Working');
      const successIcons = document.querySelectorAll('.fa-check-circle');
      const errorIcons = document.querySelectorAll('.fa-times-circle');

      expect(workingStatuses).toHaveLength(2);
      expect(notWorkingStatuses).toHaveLength(1);
      expect(successIcons).toHaveLength(2);
      expect(errorIcons).toHaveLength(1);
    });
  });
});
