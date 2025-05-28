import React from "react";
import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import DashboardLayout from "./DashboardLayout";
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

// Mock child components used in DashboardLayout
jest.mock("./SignInForm.jsx", () => () => <div data-testid="sign-in-form">Mock SignInForm</div>);
jest.mock("../pages/DashboardPage.jsx", () => () => <div data-testid="dashboard-page">Mock DashboardPage</div>);
jest.mock("../pages/ApplicationConfigurationPage", () => () => <div data-testid="app-config">Mock AppConfig</div>);
jest.mock("../pages/ApplicationStatusPage", () => () => <div data-testid="app-status">Mock AppStatus</div>);
jest.mock("../pages/Bridge", () => () => <div data-testid="bridge-page">Mock Bridge</div>);
jest.mock("../pages/TestResult", () => () => <div data-testid="test-result">Mock TestResult</div>);
jest.mock("../pages/User", () => () => <div data-testid="user-page">Mock User</div>);

// Mock dispatch and fetchDashboardData
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('../features/dashboard/dashboardSlice', () => ({
  fetchDashboardData: jest.fn(() => ({ type: 'dashboard/fetchDashboardData' }))
}));

// Setup window resize mock
const originalInnerWidth = window.innerWidth;
const mockResizeWindow = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  window.dispatchEvent(new Event('resize'));
};

const renderComponent = (preloadedState = {}, initialRoute = '/') => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      dashboard: dashboardReducer,
    },
    preloadedState: {
      auth: { token: 'test-token', user: { id: 1, name: 'Test User' } },
      ...preloadedState,
    },
  });

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Provider store={store}>
        <Routes>
          <Route path="/*" element={<DashboardLayout />}>
            <Route index element={<div data-testid="dashboard-page">Mock DashboardPage</div>} />
            <Route path="app-config" element={<div data-testid="app-config">Mock AppConfig</div>} />
            <Route path="app-status" element={<div data-testid="app-status">Mock AppStatus</div>} />
            <Route path="bridge" element={<div data-testid="bridge-page">Mock Bridge</div>} />
            <Route path="test-results" element={<div data-testid="test-result">Mock TestResult</div>} />
            <Route path="users" element={<div data-testid="user-page">Mock User</div>} />
            <Route path="login" element={<div data-testid="sign-in-form">Mock SignInForm</div>} />
          </Route>
        </Routes>
      </Provider>
    </MemoryRouter>
  );
};

describe("DashboardLayout", () => {
  beforeEach(() => {
    // Reset window size to desktop
    mockResizeWindow(1200);
    mockDispatch.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
  });

  describe("Initial Render", () => {
    it("displays the default Dashboard page on initial load", () => {
      renderComponent();
      expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
      expect(screen.getByTestId("nav-dashboard")).toHaveClass("active");
    });

    it("should show all navigation items", () => {
      renderComponent();
      expect(screen.getByTestId("nav-app-config")).toBeInTheDocument();
      expect(screen.getByTestId("nav-app-status")).toBeInTheDocument();
      expect(screen.getByTestId("nav-bridge")).toBeInTheDocument();
      expect(screen.getByTestId("nav-test-results")).toBeInTheDocument();
      expect(screen.getByTestId("nav-users")).toBeInTheDocument();
      expect(screen.getByTestId("nav-logout")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("renders Application Configuration page when nav item is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("nav-app-config"));
      expect(screen.getByTestId("app-config")).toBeInTheDocument();
    });

    it("renders Application Status page when nav item is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("nav-app-status"));
      expect(screen.getByTestId("app-status")).toBeInTheDocument();
    });

    it("renders Bridge page when nav item is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("nav-bridge"));
      expect(screen.getByTestId("bridge-page")).toBeInTheDocument();
    });

    it("renders Test Result page when nav item is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("nav-test-results"));
      expect(screen.getByTestId("test-result")).toBeInTheDocument();
    });

    it("renders User page when nav item is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("nav-users"));
      expect(screen.getByTestId("user-page")).toBeInTheDocument();
    });

    it("should maintain active state of selected navigation item", () => {
      renderComponent();
      const userNavItem = screen.getByTestId("nav-users");
      fireEvent.click(userNavItem);
      expect(userNavItem).toHaveClass("active");
    });
  });

  describe("Logout Flow", () => {
    it("displays logout confirmation modal when Logout is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("nav-logout"));
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to log out?")).toBeInTheDocument();
    });

    it("shows SignInForm component after confirming Logout", async () => {
      renderComponent();
      
      // Click logout button
      fireEvent.click(screen.getByTestId("nav-logout"));
      
      // Confirm logout
      fireEvent.click(screen.getByTestId("confirm-logout-btn"));
      
      // Should redirect to login
      expect(screen.getByTestId("sign-in-form")).toBeInTheDocument();
    });

    it("closes logout modal when cancel is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("nav-logout")); // open modal
      fireEvent.click(screen.getByTestId("cancel-logout-btn"));
      expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
    });
  });

  describe("Mobile Responsiveness", () => {
    it("should handle orientation changes", async () => {
      renderComponent();

      // Switch to portrait (mobile)
      await act(async () => {
        mockResizeWindow(500);
      });
      expect(screen.getByTestId("nav-dashboard").closest(".bg-light")).toHaveClass("d-none");

      // Switch to landscape (tablet)
      await act(async () => {
        mockResizeWindow(800);
      });
      expect(screen.getByTestId("nav-dashboard").closest(".bg-light")).toHaveClass("d-none");

      // Switch back to desktop
      await act(async () => {
        mockResizeWindow(1200);
      });
      expect(screen.getByTestId("nav-dashboard").closest(".bg-light")).not.toHaveClass("d-none");
    });

    it("should close sidebar after navigation on mobile", async () => {
      renderComponent();

      await act(async () => {
        mockResizeWindow(500);
      });

      // Open sidebar
      fireEvent.click(screen.getAllByTestId("mobile-menu-btn")[0]);
      expect(screen.getByTestId("nav-dashboard").closest(".bg-light")).not.toHaveClass("d-none");

      // Navigate to Users
      fireEvent.click(screen.getByTestId("nav-users"));
      expect(screen.getByTestId("nav-dashboard").closest(".bg-light")).toHaveClass("d-none");
    });

    it("should handle rapid window resizing", async () => {
      renderComponent();

      await act(async () => {
        // Rapid resize events
        mockResizeWindow(500);
        mockResizeWindow(1200);
        mockResizeWindow(800);
        mockResizeWindow(1200);
      });

      // Should end up in correct state
      expect(screen.getByTestId("nav-dashboard").closest(".bg-light")).not.toHaveClass("d-none");
    });
  });

  describe("Header Behavior", () => {
    it("updates header title based on current route", () => {
      renderComponent();
      
      // Initial route should be dashboard
      expect(screen.getByRole('heading')).toHaveTextContent("Dashboard");
      
      // Navigate to different pages and check title updates
      fireEvent.click(screen.getByTestId("nav-app-config"));
      expect(screen.getByRole('heading')).toHaveTextContent("Configuration Page");
      
      fireEvent.click(screen.getByTestId("nav-users"));
      expect(screen.getByRole('heading')).toHaveTextContent("Users");
    });

    it("handles unknown routes gracefully", () => {
      renderComponent({}, '/unknown-route');
      expect(screen.getByRole('heading')).toHaveTextContent("Dashboard");
    });
  });

  describe("Dashboard Data Fetching", () => {
    it("fetches dashboard data on initial load", () => {
      const { fetchDashboardData } = require('../features/dashboard/dashboardSlice');
      renderComponent();
      expect(mockDispatch).toHaveBeenCalledWith(fetchDashboardData());
    });

    it("doesn't fetch dashboard data without token", () => {
      renderComponent({ auth: { token: null } });
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe("Mobile Overlay", () => {
    beforeEach(async () => {
      await act(async () => {
        mockResizeWindow(500);
      });
    });

    it("shows overlay when sidebar is open on mobile", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("mobile-menu-btn"));
      const overlay = screen.getByTestId("mobile-overlay");
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass("bg-dark", "bg-opacity-50");
    });

    it("closes sidebar when overlay is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByTestId("mobile-menu-btn")); // Open sidebar
      const overlay = screen.getByTestId("mobile-overlay");
      fireEvent.click(overlay);
      expect(screen.getByTestId("nav-dashboard").closest(".bg-light")).toHaveClass("d-none");
    });
  });

  describe("Keyboard Navigation", () => {
    it("allows navigation through sidebar items with keyboard", () => {
      renderComponent();
      const sidebarItems = screen.getAllByRole('button').filter(
        item => item.getAttribute('data-testid')?.startsWith('nav-')
      );
      
      // Focus first nav item
      sidebarItems[0].focus();
      expect(document.activeElement).toBe(sidebarItems[0]);
      
      // Simulate tab navigation
      sidebarItems[0].blur();
      sidebarItems[1].focus();
      expect(document.activeElement).toBe(sidebarItems[1]);
    });

    it("handles Enter key on navigation items", () => {
      renderComponent();
      const userNavItem = screen.getByTestId("nav-users");
      
      userNavItem.focus();
      fireEvent.keyDown(userNavItem, { key: 'Enter' });
      expect(screen.getByTestId("user-page")).toBeInTheDocument();
    });

    it("handles Escape key to close modals", () => {
      renderComponent();
      
      // Open logout modal
      fireEvent.click(screen.getByTestId("nav-logout"));
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
    });
  });
});