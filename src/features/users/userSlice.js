import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  ({ userType, selectedType, page, pageSize }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.get(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/AllUsers?page=${page}&pageSize=${pageSize}&userType=${userType}&selectedType=${selectedType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      const users = (response.data.data[selectedType] || []).map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        wallet: user.wallet,
        medications: user.medication,
        genes: user.genes,
      }));

      const totalRecords = response.data.totalRecords?.[selectedType] || 0;
      const totalPages = Math.ceil(totalRecords / pageSize) || 1;

      return {
        users,
        totalPages,
        userType,
        selectedType,
      };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to fetch: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const fetchUserDetails = createAsyncThunk(
  'users/fetchUserDetails',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.get(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/UserDetails/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return response.data.data;
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to fetch user details: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const blockPatient = createAsyncThunk(
  'users/blockPatient',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.patch(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/PatientAction/${userId}`,
      { action: 'block' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to block user: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const unblockPatient = createAsyncThunk(
  'users/unblockPatient',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.patch(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/PatientAction/${userId}`,
      { action: 'unblock' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to unblock user: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const blockManager = createAsyncThunk(
  'users/blockManager',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.patch(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/ManagerAction/${userId}`,
      { action: 'block' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to block manager: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const unblockManager = createAsyncThunk(
  'users/unblockManager',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.patch(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/ManagerAction/${userId}`,
      { action: 'unblock' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to unblock manager: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const blockResearcher = createAsyncThunk(
  'users/blockResearcher',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.patch(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/ResearcherAction/${userId}`,
      { action: 'block' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to block researcher: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const unblockResearcher = createAsyncThunk(
  'users/unblockResearcher',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.patch(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/ResearcherAction/${userId}`,
      { action: 'unblock' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to unblock researcher: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  ({ userId, firstName, lastName, password, role }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    const payload = { firstName, lastName };
    if (password) payload.password = password;

    return axios.patch(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/updateUser?id=${userId}&role=${role}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return response.data;
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to update user: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const createManager = createAsyncThunk(
  'users/createManager',
  ({ firstName, lastName, email, password }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.post(
      'https://hivve.westus.cloudapp.azure.com/api/v1/admin/createUser',
      { firstName, lastName, email, password, role: 'manager' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return response.data;
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to create manager: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const rejectResearcher = createAsyncThunk(
  'users/rejectResearcher',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.post(
      `https://hivve.westus.cloudapp.azure.com/api/v1/admin/RejectResearcher/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to reject researcher: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

export const approveResearcher = createAsyncThunk(
  'users/approveResearcher',
  (userId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const token = auth.token;
    if (!token) {
      return rejectWithValue({ message: 'No token available' });
    }

    return axios.patch(
      'https://hivve.westus.cloudapp.azure.com/api/v1/admin/approveUser',
      { userId, role: 'researcher' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      return { ...response.data, userId };
    })
    .catch(error => {
      if (!error.response) {
        return rejectWithValue({ message: 'Failed to approve researcher: Server is unreachable' });
      }
      return rejectWithValue(error.response.data);
    });
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    userDetails: null,
    totalPages: 1,
    currentUserType: 'patient',
    currentSelectedType: 'active',
    currentPage: 1,
    pageSize: 10,
    loading: false,
    detailsLoading: false,
    error: null,
    detailsError: null,
    searchQuery: '',
    showBlockConfirm: false,
    blockUserId: null,
    blockLoading: false,
    blockResponse: null,
    blockError: null,
    showUnblockConfirm: false,
    unblockUserId: null,
    unblockLoading: false,
    unblockResponse: null,
    unblockError: null,
    showEditForm: false,
    editUserId: null,
    editUserData: null,
    updateLoading: false,
    updateResponse: null,
    updateError: null,
    showApproveConfirm: false,
    approveUserId: null,
    approveLoading: false,
    approveResponse: null,
    approveError: null,
    showRejectConfirm: false,
    rejectUserId: null,
    rejectLoading: false,
    rejectResponse: null,
    rejectError: null,
    showCreateManagerForm: false,
    createManagerLoading: false,
    createManagerResponse: null,
    createManagerError: null,
  },
  reducers: {
    setUserType: (state, action) => {
      state.currentUserType = action.payload;
      state.currentSelectedType = 'active';
      state.currentPage = 1;
      state.userDetails = null;
    },
    setSelectedType: (state, action) => {
      state.currentSelectedType = action.payload;
      state.currentPage = 1;
      state.userDetails = null;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
      state.detailsError = null;
    },
    showBlockConfirmCard: (state, action) => {
      state.showBlockConfirm = true;
      state.blockUserId = action.payload;
    },
    hideBlockConfirmCard: (state) => {
      state.showBlockConfirm = false;
      state.blockUserId = null;
    },
    showUnblockConfirmCard: (state, action) => {
      state.showUnblockConfirm = true;
      state.unblockUserId = action.payload;
    },
    hideUnblockConfirmCard: (state) => {
      state.showUnblockConfirm = false;
      state.unblockUserId = null;
    },
    showApproveConfirmCard: (state, action) => {
      state.showApproveConfirm = true;
      state.approveUserId = action.payload;
    },
    hideApproveConfirmCard: (state) => {
      state.showApproveConfirm = false;
      state.approveUserId = null;
    },
    showRejectConfirmCard: (state, action) => {
      state.showRejectConfirm = true;
      state.rejectUserId = action.payload;
    },
    hideRejectConfirmCard: (state) => {
      state.showRejectConfirm = false;
      state.rejectUserId = null;
    },
    showCreateManagerForm: (state) => {
      state.showCreateManagerForm = true;
    },
    hideCreateManagerForm: (state) => {
      state.showCreateManagerForm = false;
    },
    clearBlockResponse: (state) => {
      state.blockResponse = null;
      state.blockError = null;
    },
    clearUnblockResponse: (state) => {
      state.unblockResponse = null;
      state.unblockError = null;
    },
    clearApproveResponse: (state) => {
      state.approveResponse = null;
      state.approveError = null;
    },
    clearRejectResponse: (state) => {
      state.rejectResponse = null;
      state.rejectError = null;
    },
    showEditFormCard: (state, action) => {
      state.showEditForm = true;
      state.editUserId = action.payload.id;
      state.editUserData = action.payload;
    },
    hideEditFormCard: (state) => {
      state.showEditForm = false;
      state.editUserId = null;
      state.editUserData = null;
    },
    clearUpdateResponse: (state) => {
      state.updateResponse = null;
      state.updateError = null;
    },
    clearCreateManagerResponse: (state) => {
      state.createManagerResponse = null;
      state.createManagerError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
        state.currentUserType = action.payload.userType;
        state.currentSelectedType = action.payload.selectedType;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
      })
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.userDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
        state.userDetails = null;
      })
      // Block Patient
      .addCase(blockPatient.pending, (state) => {
        state.blockLoading = true;
        state.blockError = null;
        state.blockResponse = null;
      })
      .addCase(blockPatient.fulfilled, (state, action) => {
        state.blockLoading = false;
        state.blockResponse = action.payload;
        state.showBlockConfirm = false;
        state.blockUserId = null;
      })
      .addCase(blockPatient.rejected, (state, action) => {
        state.blockLoading = false;
        state.blockError = action.payload;
        state.showBlockConfirm = false;
        state.blockUserId = null;
      })
      // Unblock Patient
      .addCase(unblockPatient.pending, (state) => {
        state.unblockLoading = true;
        state.unblockError = null;
        state.unblockResponse = null;
      })
      .addCase(unblockPatient.fulfilled, (state, action) => {
        state.unblockLoading = false;
        state.unblockResponse = action.payload;
        state.showUnblockConfirm = false;
        state.unblockUserId = null;
      })
      .addCase(unblockPatient.rejected, (state, action) => {
        state.unblockLoading = false;
        state.unblockError = action.payload;
        state.showUnblockConfirm = false;
        state.unblockUserId = null;
      })
      // Block Manager
      .addCase(blockManager.pending, (state) => {
        state.blockLoading = true;
        state.blockError = null;
        state.blockResponse = null;
      })
      .addCase(blockManager.fulfilled, (state, action) => {
        state.blockLoading = false;
        state.blockResponse = action.payload;
        state.showBlockConfirm = false;
        state.blockUserId = null;
      })
      .addCase(blockManager.rejected, (state, action) => {
        state.blockLoading = false;
        state.blockError = action.payload;
        state.showBlockConfirm = false;
        state.blockUserId = null;
      })
      // Unblock Manager
      .addCase(unblockManager.pending, (state) => {
        state.unblockLoading = true;
        state.unblockError = null;
        state.unblockResponse = null;
      })
      .addCase(unblockManager.fulfilled, (state, action) => {
        state.unblockLoading = false;
        state.unblockResponse = action.payload;
        state.showUnblockConfirm = false;
        state.unblockUserId = null;
      })
      .addCase(unblockManager.rejected, (state, action) => {
        state.unblockLoading = false;
        state.unblockError = action.payload;
        state.showUnblockConfirm = false;
        state.unblockUserId = null;
      })
      // Block Researcher
      .addCase(blockResearcher.pending, (state) => {
        state.blockLoading = true;
        state.blockError = null;
        state.blockResponse = null;
      })
      .addCase(blockResearcher.fulfilled, (state, action) => {
        state.blockLoading = false;
        state.blockResponse = action.payload;
        state.showBlockConfirm = false;
        state.blockUserId = null;
      })
      .addCase(blockResearcher.rejected, (state, action) => {
        state.blockLoading = false;
        state.blockError = action.payload;
        state.showBlockConfirm = false;
        state.blockUserId = null;
      })
      // Unblock Researcher
      .addCase(unblockResearcher.pending, (state) => {
        state.unblockLoading = true;
        state.unblockError = null;
        state.unblockResponse = null;
      })
      .addCase(unblockResearcher.fulfilled, (state, action) => {
        state.unblockLoading = false;
        state.unblockResponse = action.payload;
        state.showUnblockConfirm = false;
        state.unblockUserId = null;
      })
      .addCase(unblockResearcher.rejected, (state, action) => {
        state.unblockLoading = false;
        state.unblockError = action.payload;
        state.showUnblockConfirm = false;
        state.unblockUserId = null;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateResponse = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateResponse = action.payload;
        state.showEditForm = false;
        state.editUserId = null;
        state.editUserData = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.showEditForm = false;
        state.editUserId = null;
        state.editUserData = null;
      })
      // Create Manager
      .addCase(createManager.pending, (state) => {
        state.createManagerLoading = true;
        state.createManagerError = null;
        state.createManagerResponse = null;
      })
      .addCase(createManager.fulfilled, (state, action) => {
        state.createManagerLoading = false;
        state.createManagerResponse = action.payload;
        state.showCreateManagerForm = false;
      })
      .addCase(createManager.rejected, (state, action) => {
        state.createManagerLoading = false;
        state.createManagerError = action.payload;
        state.showCreateManagerForm = false;
      })
      // Reject Researcher
      .addCase(rejectResearcher.pending, (state) => {
        state.rejectLoading = true;
        state.rejectError = null;
        state.rejectResponse = null;
      })
      .addCase(rejectResearcher.fulfilled, (state, action) => {
        state.rejectLoading = false;
        state.rejectResponse = action.payload;
        state.showRejectConfirm = false;
        state.rejectUserId = null;
      })
      .addCase(rejectResearcher.rejected, (state, action) => {
        state.rejectLoading = false;
        state.rejectError = action.payload;
        state.showRejectConfirm = false;
        state.rejectUserId = null;
      })
      // Approve Researcher
      .addCase(approveResearcher.pending, (state) => {
        state.approveLoading = true;
        state.approveError = null;
        state.approveResponse = null;
      })
      .addCase(approveResearcher.fulfilled, (state, action) => {
        state.approveLoading = false;
        state.approveResponse = action.payload;
        state.showApproveConfirm = false;
        state.approveUserId = null;
      })
      .addCase(approveResearcher.rejected, (state, action) => {
        state.approveLoading = false;
        state.approveError = action.payload;
        state.showApproveConfirm = false;
        state.approveUserId = null;
      });
  },
});

export const {
  setUserType,
  setSelectedType,
  setPage,
  setPageSize,
  setSearchQuery,
  clearUserDetails,
  showBlockConfirmCard,
  hideBlockConfirmCard,
  showUnblockConfirmCard,
  hideUnblockConfirmCard,
  showApproveConfirmCard,
  hideApproveConfirmCard,
  showRejectConfirmCard,
  hideRejectConfirmCard,
  showCreateManagerForm,
  hideCreateManagerForm,
  clearBlockResponse,
  clearUnblockResponse,
  clearApproveResponse,
  clearRejectResponse,
  showEditFormCard,
  hideEditFormCard,
  clearUpdateResponse,
  clearCreateManagerResponse,
} = userSlice.actions;

export default userSlice.reducer;