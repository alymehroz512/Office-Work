import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { loginUser } from "./authSlice";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("loginUser thunk async tests", () => {
  let mock;
  let store;

  beforeEach(() => {
    mock = new MockAdapter(axios);

    store = configureStore({
      reducer: { auth: authReducer },
    });
  });

  afterEach(() => {
    mock.reset();
  });

  it("dispatches loginUser.fulfilled on successful login", async () => {
    const mockResponse = { user: { email: "test@example.com", token: "123" } };
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(200, mockResponse);

    await store.dispatch(
      loginUser({ email: "test@example.com", password: "password" })
    );

    const state = store.getState();
    expect(state.auth.user).toEqual(mockResponse.user);
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBeNull();
  });

  it("dispatches loginUser.rejected on failed login", async () => {
    const errorMessage = "Invalid credentials";
    mock
      .onPost("https://hivve.westus.cloudapp.azure.com/api/v1/auth/login")
      .reply(401, { message: errorMessage });

    await store.dispatch(
      loginUser({ email: "test@example.com", password: "wrongpassword" })
    );

    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.loading).toBe(false);
    expect(state.auth.error).toBe(errorMessage);
  });
});
