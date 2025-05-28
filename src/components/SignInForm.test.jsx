import React from "react";
import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import authReducer from "../features/auth/authSlice";
import SignInForm from "../components/SignInForm";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Mock ParticleNetwork component
jest.mock('./ParticleNetwork', () => {
  return function DummyParticleNetwork() {
    return <div data-testid="particle-network">Particle Network Mock</div>;
  };
});

describe("SignInForm integration tests", () => {
  let store;
  let mock;
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.error and silence it
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mock = new MockAdapter(axios);
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignInForm />
        </BrowserRouter>
      </Provider>
    );
  });

  afterEach(() => {
    mock.reset();
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("renders all form elements correctly", () => {
    expect(screen.getByRole('heading', { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Admin" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Manager" })).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-button")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    const passwordInput = screen.getByTestId("password-input");
    const toggleButton = screen.getByTestId("toggle-password");

    expect(passwordInput.type).toBe("password");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("switches between admin and manager roles", () => {
    const adminButton = screen.getByRole('button', { name: "Admin" });
    const managerButton = screen.getByRole('button', { name: "Manager" });

    expect(adminButton).toHaveClass("active");
    expect(managerButton).not.toHaveClass("active");

    fireEvent.click(managerButton);
    expect(adminButton).not.toHaveClass("active");
    expect(managerButton).toHaveClass("active");
  });

  it("shows validation error for empty fields", async () => {
    fireEvent.click(screen.getByTestId("sign-in-button"));
    expect(await screen.findByTestId("form-error")).toHaveTextContent(
      "Please enter both email and password."
    );
  });

  it("logs in successfully with correct credentials", async () => {
    const mockResponse = { 
      user: { email: "test@example.com" },
      token: "123" 
    };
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(200, mockResponse);

    fireEvent.click(screen.getByRole('button', { name: "Manager" }));
    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByTestId("sign-in-button"));

    await waitFor(() => {
      const state = store.getState().auth;
      expect(state.user).toEqual(mockResponse.user);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  it("shows error on invalid login credentials", async () => {
    const errorMessage = "Invalid credentials";
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(401, { message: errorMessage });

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByTestId("sign-in-button"));

    await waitFor(() => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    expect(await screen.findByTestId("server-error")).toHaveTextContent(
      errorMessage
    );
  });

  it("handles network error gracefully", async () => {
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .networkError();

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByTestId("sign-in-button"));

    await waitFor(() => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.error).toBe("Login failed");
    });

    expect(await screen.findByTestId("server-error")).toHaveTextContent(
      "Login failed"
    );
  });

  it("shows loading state during authentication", async () => {
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(() => new Promise((resolve) => setTimeout(() => resolve([200, {}]), 100)));

    fireEvent.change(screen.getByTestId("email-input"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByTestId("password-input"), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByTestId("sign-in-button"));
    
    expect(screen.getByText("Signing In...")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-button")).toBeDisabled();
  });
});
