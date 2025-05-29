import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import bridgeReducer, {
  fetchPolkadotTransactions,
  fetchEthereumAddress,
  fetchSinglePolkadotTransaction,
} from "./bridgeSlice";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("bridge slice tests", () => {
  let mock;
  let store;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    store = configureStore({
      reducer: {
        bridge: bridgeReducer,
        auth: (state = { token: "test-token" }) => state,
      },
    });
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = store.getState().bridge;
      expect(state.polkadot).toEqual({
        transactions: [],
        singleTransaction: null,
        totalRecords: 0,
        balance: 0,
        address: '',
        loading: false,
        error: null,
      });
      expect(state.ethereum).toEqual({
        balance: 0,
        address: '',
        loading: false,
        error: null,
      });
    });
  });

  describe("fetchPolkadotTransactions thunk", () => {
    const mockPolkadotData = {
      transactions: [
        {
          id: 1,
          senderKey: "sender1",
          receiverKey: "receiver1",
          amount: 100,
        },
      ],
      totalRecords: 1,
      balance: 1000,
      address: "polkadot-address",
    };

    it("sets loading state while fetching", () => {
      mock
        .onGet(/.*\/PolkadotTransactions.*/)
        .reply(() => new Promise(() => {}));

      store.dispatch(fetchPolkadotTransactions({ page: 1, pageSize: 10, search: "" }));

      const state = store.getState().bridge;
      expect(state.polkadot.loading).toBe(true);
      expect(state.polkadot.error).toBeNull();
    });

    it("handles successful fetch", async () => {
      mock
        .onGet(/.*\/PolkadotTransactions.*/)
        .reply(200, { data: mockPolkadotData });

      await store.dispatch(fetchPolkadotTransactions({ page: 1, pageSize: 10, search: "" }));

      const state = store.getState().bridge;
      expect(state.polkadot.transactions).toEqual(mockPolkadotData.transactions);
      expect(state.polkadot.totalRecords).toBe(mockPolkadotData.totalRecords);
      expect(state.polkadot.balance).toBe(mockPolkadotData.balance);
      expect(state.polkadot.address).toBe(mockPolkadotData.address);
      expect(state.polkadot.loading).toBe(false);
      expect(state.polkadot.error).toBeNull();
    });

    it("handles API error", async () => {
      const errorMessage = "Failed to fetch transactions";
      mock
        .onGet(/.*\/PolkadotTransactions.*/)
        .reply(500, { message: errorMessage });

      await store.dispatch(fetchPolkadotTransactions({ page: 1, pageSize: 10, search: "" }));

      const state = store.getState().bridge;
      expect(state.polkadot.loading).toBe(false);
      expect(state.polkadot.error).toBeDefined();
    });
  });

  describe("fetchEthereumAddress thunk", () => {
    const mockEthereumData = {
      balance: 2000,
      address: "ethereum-address",
    };

    it("sets loading state while fetching", () => {
      mock
        .onGet(/.*\/EthTransactions/)
        .reply(() => new Promise(() => {}));

      store.dispatch(fetchEthereumAddress());

      const state = store.getState().bridge;
      expect(state.ethereum.loading).toBe(true);
      expect(state.ethereum.error).toBeNull();
    });

    it("handles successful fetch", async () => {
      mock
        .onGet(/.*\/EthTransactions/)
        .reply(200, { data: mockEthereumData });

      await store.dispatch(fetchEthereumAddress());

      const state = store.getState().bridge;
      expect(state.ethereum.balance).toBe(mockEthereumData.balance);
      expect(state.ethereum.address).toBe(mockEthereumData.address);
      expect(state.ethereum.loading).toBe(false);
      expect(state.ethereum.error).toBeNull();
    });

    it("handles API error", async () => {
      const errorMessage = "Failed to fetch Ethereum data";
      mock
        .onGet(/.*\/EthTransactions/)
        .reply(500, { message: errorMessage });

      await store.dispatch(fetchEthereumAddress());

      const state = store.getState().bridge;
      expect(state.ethereum.loading).toBe(false);
      expect(state.ethereum.error).toBeDefined();
    });
  });

  describe("fetchSinglePolkadotTransaction thunk", () => {
    const mockSingleTransaction = {
      id: 1,
      senderKey: "sender1",
      receiverKey: "receiver1",
      amount: 100,
    };

    it("sets loading state while fetching", () => {
      mock
        .onGet(/.*\/getSingleTrasaction\/.*/)
        .reply(() => new Promise(() => {}));

      store.dispatch(fetchSinglePolkadotTransaction(1));

      const state = store.getState().bridge;
      expect(state.polkadot.loading).toBe(true);
      expect(state.polkadot.error).toBeNull();
      expect(state.polkadot.singleTransaction).toBeNull();
    });

    it("handles successful fetch", async () => {
      mock
        .onGet(/.*\/getSingleTrasaction\/1/)
        .reply(200, { data: mockSingleTransaction });

      await store.dispatch(fetchSinglePolkadotTransaction(1));

      const state = store.getState().bridge;
      expect(state.polkadot.singleTransaction).toEqual(mockSingleTransaction);
      expect(state.singleTransaction).toEqual(mockSingleTransaction);
      expect(state.polkadot.loading).toBe(false);
      expect(state.polkadot.error).toBeNull();
    });

    it("handles API error", async () => {
      const errorMessage = "Failed to fetch transaction";
      mock
        .onGet(/.*\/getSingleTrasaction\/1/)
        .reply(500, { message: errorMessage });

      await store.dispatch(fetchSinglePolkadotTransaction(1));

      const state = store.getState().bridge;
      expect(state.polkadot.loading).toBe(false);
      expect(state.polkadot.error).toBeDefined();
      expect(state.polkadot.singleTransaction).toBeNull();
    });
  });
});
