import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import applicationConfigurationReducer from '../features/applicationConfiguration/applicationConfigurationSlice';
import applicationStatusReducer from '../features/applicationStatus/applicationStatusSlice';
import bridgeReducer from "../features/bridge/bridgeSlice";
import testResultReducer from '../features/testResult/testResultSlice';
import userReducer from '../features/users/userSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    applicationConfiguration: applicationConfigurationReducer,
    applicationStatus: applicationStatusReducer,
    bridge: bridgeReducer,
    testResult: testResultReducer,
    users: userReducer,
  },
});

export default store;
