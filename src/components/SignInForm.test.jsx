import React from "react";
import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/user-event";
import authReducer from "../features/auth/authSlice";
import SignInForm from "../components/SignInForm";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("SignInForm integration tests", () => {
  let store;
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    render(
      <Provider store={store}>
        <SignInForm />
      </Provider>
    );
  });

  afterEach(() => {
    mock.reset();
  });

  it("logs in successfully with correct credentials", async () => {
    const mockResponse = { user: { email: "test@example.com", token: "123" } };
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(200, mockResponse);

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

    // Match actual rendered error
    expect(
      await screen.findByTestId("server-error")
    ).toHaveTextContent("Login failed");
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
      expect(state.error).toBe("Failed to fetch");
    });

    expect(
      await screen.findByTestId("server-error")
    ).toHaveTextContent("Login failed");
  });
});
