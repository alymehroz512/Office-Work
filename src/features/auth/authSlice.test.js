import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { loginUser, logout } from "./authSlice";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

describe("auth slice tests", () => {
  describe("initial state", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("uses token from cookie in initial state if available", () => {
      // Setup cookie mock before importing the slice
      Cookies.get.mockReturnValue("existing-token");
      
      // Re-import the slice to get fresh initial state
      jest.isolateModules(() => {
        const { default: freshAuthReducer } = require("./authSlice");
        const store = configureStore({
          reducer: { auth: freshAuthReducer },
        });

        const state = store.getState().auth;
        expect(state.token).toBe("existing-token");
        expect(state.user).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });
    });

    it("has correct initial state when no token in cookie", () => {
      Cookies.get.mockReturnValue(null);
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      const state = store.getState().auth;
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("loginUser thunk", () => {
    let mock;
    let store;

    beforeEach(() => {
      mock = new MockAdapter(axios);
      jest.clearAllMocks();

      store = configureStore({
        reducer: { auth: authReducer },
      });
    });

    afterEach(() => {
      mock.reset();
    });

    it("sets loading state while authenticating", () => {
      mock
        .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
        .reply(() => new Promise(() => {})); // Never resolves to keep loading state

      store.dispatch(loginUser({ email: "test@example.com", password: "password" }));

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
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

      const state = store.getState().auth;
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.token);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

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

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);

      // Verify cookie was not set
      expect(Cookies.set).not.toHaveBeenCalled();
    });

    it("handles network errors correctly", async () => {
      mock
        .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
        .networkError();

      await store.dispatch(
        loginUser({ email: "test@example.com", password: "password" })
      );

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Login failed");
      expect(Cookies.set).not.toHaveBeenCalled();
    });
  });

  describe("logout action", () => {
    it("clears state and removes cookie on logout", () => {
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

      store.dispatch(logout());
      
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(Cookies.remove).toHaveBeenCalledWith('token');
    });

    it("handles logout when already logged out", () => {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: null,
            token: null,
            loading: false,
            error: null
          }
        }
      });

      store.dispatch(logout());
      
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(Cookies.remove).toHaveBeenCalledWith('token');
    });
  });
});
