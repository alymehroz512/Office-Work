import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { loginUser } from "./authSlice";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

describe("loginUser thunk async tests", () => {
  let mock;
  let store;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    // Clear all mocks before each test
    jest.clearAllMocks();

    store = configureStore({
      reducer: { auth: authReducer },
    });
  });

  afterEach(() => {
    mock.reset();
  });

  it("dispatches loginUser.fulfilled and sets cookie on successful login", async () => {
    const mockResponse = { 
      user: { email: "test@example.com" },
      token: "123"
    };
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(200, mockResponse);

    await store.dispatch(
      loginUser({ email: "test@example.com", password: "password" })
    );

    const state = store.getState();
    expect(state.auth.user).toEqual(mockResponse.user);
    expect(state.auth.token).toBe(mockResponse.token);
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBeNull();

    // Verify cookie was set with correct options
    expect(Cookies.set).toHaveBeenCalledWith('token', mockResponse.token, {
      expires: 7,
      secure: true,
      sameSite: 'strict'
    });
  });

  it("dispatches loginUser.rejected and doesn't set cookie on failed login", async () => {
    const errorMessage = "Invalid credentials";
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(401, { message: errorMessage });

    await store.dispatch(
      loginUser({ email: "test@example.com", password: "wrongpassword" })
    );

    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.token).toBeNull();
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBe(errorMessage);

    // Verify cookie was not set
    expect(Cookies.set).not.toHaveBeenCalled();
  });

  it("removes cookie on logout", () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: { email: "test@example.com" },
          token: "123",
          loading: false,
          error: null
        }
      }
    });

    store.dispatch({ type: 'auth/logout' });
    
    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.token).toBeNull();
    expect(Cookies.remove).toHaveBeenCalledWith('token');
  });
});
