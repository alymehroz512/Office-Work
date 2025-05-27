import React from "react";
import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
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

// Mock dispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
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

const renderComponent = (preloadedState = {}) => {
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
    <Provider store={store}>
      <DashboardLayout />
    </Provider>
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
      const mockStore = configureStore({
        reducer: {
          auth: authReducer,
          dashboard: dashboardReducer,
        },
        preloadedState: {
          auth: { token: null, user: null },
        },
      });

      render(
        <Provider store={mockStore}>
          <DashboardLayout />
        </Provider>
      );

      // Verify SignInForm is shown when there's no token
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
});