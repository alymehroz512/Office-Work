import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import applicationStatusReducer, { fetchApplicationStatus } from "./applicationStatusSlice";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("applicationStatus slice tests", () => {
  let mock;
  let store;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    store = configureStore({
      reducer: { 
        applicationStatus: applicationStatusReducer,
        auth: (state = { token: "test-token" }) => state
      }
    });
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = store.getState().applicationStatus;
      expect(state.statusData).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("fetchApplicationStatus thunk", () => {
    it("sets loading state while fetching", () => {
      mock
        .onGet("https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationStatus")
        .reply(() => new Promise(() => {})); // Never resolves to keep loading state

      store.dispatch(fetchApplicationStatus());

      const state = store.getState().applicationStatus;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("handles successful fetch", async () => {
      const mockData = {
        backend_honey: Date.now(),
        bridge_backend: Date.now(),
        frontend_honey: Date.now()
      };

      mock
        .onGet("https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationStatus")
        .reply(200, { data: mockData });

      const result = await store.dispatch(fetchApplicationStatus());
      expect(result.type).toBe('applicationStatus/fetchApplicationStatus/fulfilled');
      expect(result.payload).toEqual(mockData);

      const state = store.getState().applicationStatus;
      expect(state.statusData).toEqual(mockData);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("handles API error", async () => {
      const errorMessage = "Failed to fetch application status";
      mock
        .onGet("https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationStatus")
        .reply(500, { message: errorMessage });

      await store.dispatch(fetchApplicationStatus());

      const state = store.getState().applicationStatus;
      expect(state.statusData).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("handles network error", async () => {
      mock
        .onGet("https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationStatus")
        .networkError();

      await store.dispatch(fetchApplicationStatus());

      const state = store.getState().applicationStatus;
      expect(state.statusData).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Failed to fetch application status");
    });

    it("includes auth token in request header", async () => {
      mock
        .onGet("https://hivve.westus.cloudapp.azure.com/api/v1/admin/ApplicationStatus")
        .reply(config => {
          expect(config.headers.Authorization).toBe("Bearer test-token");
          return [200, { data: {} }];
        });

      await store.dispatch(fetchApplicationStatus());
    });
  });
});
