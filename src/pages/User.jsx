import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  fetchUserDetails,
  setUserType,
  setSelectedType,
  setPage,
  setPageSize,
  setSearchQuery,
  clearUserDetails,
  blockPatient,
  unblockPatient,
  blockManager,
  unblockManager,
  blockResearcher,
  unblockResearcher,
  updateUser,
  createManager,
  rejectResearcher,
  approveResearcher,
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
} from "../features/users/userSlice";
import "../index.css";

const EditUserForm = ({ user, onSubmit, onCancel, updateLoading }) => {
  const [localFormData, setLocalFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    password: "",
  });
  const [localShowPassword, setLocalShowPassword] = useState(false);

  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    onSubmit(localFormData);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <form onSubmit={handleLocalSubmit}>
        <div className="card p-5" style={{ width: "500px" }}>
          <h4 className="text-center denser mb-4 text-primary">Edit User</h4>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-white text-dark"
              id="firstName"
              name="firstName"
              value={localFormData.firstName}
              onChange={handleLocalChange}
              placeholder="First Name"
              disabled={updateLoading}
              autoComplete="off"
            />
            <label htmlFor="firstName" className="text-dark">First Name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-white text-dark"
              id="lastName"
              name="lastName"
              value={localFormData.lastName}
              onChange={handleLocalChange}
              placeholder="Last Name"
              disabled={updateLoading}
              autoComplete="off"
            />
            <label htmlFor="lastName" className="text-dark">Last Name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-white text-dark"
              id="email"
              name="email"
              value={localFormData.email}
              placeholder="Email"
              disabled
              autoComplete="off"
            />
            <label htmlFor="email" className="text-dark">Email</label>
          </div>
          <div className="form-floating mb-3 position-relative">
            <input
              type={localShowPassword ? "text" : "password"}
              className="form-control bg-white text-dark"
              id="password"
              name="password"
              value={localFormData.password}
              onChange={handleLocalChange}
              placeholder="Password"
              disabled={updateLoading}
              autoComplete="new-password"
            />
            <label htmlFor="password" className="text-dark">Password</label>
            <i
              className={`fas ${localShowPassword ? "fa-eye-slash" : "fa-eye"} position-absolute`}
              style={{
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#000",
              }}
              onClick={() => setLocalShowPassword(!localShowPassword)}
            ></i>
          </div>
          <div className="d-flex justify-content-end gap-3">
            <button
              className="btn btn-outline-primary"
              onClick={onCancel}
              disabled={updateLoading}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary d-flex align-items-center"
              type="submit"
              disabled={updateLoading}
            >
              {updateLoading ? (
                <>
                  <span
                    className="fa-solid fa-spinner fa-spin me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const AddManagerForm = ({ onSubmit, onCancel, createManagerLoading }) => {
  const [localFormData, setLocalFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [localShowPassword, setLocalShowPassword] = useState(false);

  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    onSubmit(localFormData);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="card p-5" style={{ width: "500px" }}>
        <h4 className="text-center denser mb-4 text-primary">Add Manager</h4>
        <form onSubmit={handleLocalSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-white text-dark"
              id="firstName"
              name="firstName"
              value={localFormData.firstName}
              onChange={handleLocalChange}
              placeholder="First Name"
              disabled={createManagerLoading}
              autoComplete="off"
              required
            />
            <label htmlFor="firstName" className="text-dark">First Name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control bg-white text-dark"
              id="lastName"
              name="lastName"
              value={localFormData.lastName}
              onChange={handleLocalChange}
              placeholder="Last Name"
              disabled={createManagerLoading}
              autoComplete="off"
              required
            />
            <label htmlFor="lastName" className="text-dark">Last Name</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control bg-white text-dark"
              id="email"
              name="email"
              value={localFormData.email}
              onChange={handleLocalChange}
              placeholder="Email"
              disabled={createManagerLoading}
              autoComplete="off"
              required
            />
            <label htmlFor="email" className="text-dark">Email</label>
          </div>
          <div className="form-floating mb-3 position-relative">
            <input
              type={localShowPassword ? "text" : "password"}
              className="form-control bg-white text-dark"
              id="password"
              name="password"
              value={localFormData.password}
              onChange={handleLocalChange}
              placeholder="Password"
              disabled={createManagerLoading}
              autoComplete="new-password"
              required
            />
            <label htmlFor="password" className="text-dark">Password</label>
            <i
              className={`fas ${localShowPassword ? "fa-eye-slash" : "fa-eye"} position-absolute`}
              style={{
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#000",
              }}
              onClick={() => setLocalShowPassword(!localShowPassword)}
            ></i>
          </div>
          <div className="d-flex justify-content-end gap-3">
            <button
              className="btn btn-outline-primary"
              onClick={onCancel}
              disabled={createManagerLoading}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary d-flex align-items-center"
              type="submit"
              disabled={createManagerLoading}
            >
              {createManagerLoading ? (
                <>
                  <span
                    className="fa-solid fa-spinner fa-spin me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const createNotification = (message, type = 'success') => {
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.maxWidth = "800px";
  notification.style.backgroundColor = type === 'success' ? "#4caf50" : "#f44336";
  notification.style.color = "#fff";
  notification.style.padding = "15px 25px";
  notification.style.borderRadius = "4px";
  notification.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  notification.style.fontWeight = "500";
  notification.style.zIndex = "9999";
  notification.style.opacity = "0";
  notification.style.transform = "translateX(100%)";
  notification.style.transition = "all 0.5s ease-out";
  notification.textContent = message;

  document.body.appendChild(notification);
  
  // Force reflow to ensure transition works
  notification.offsetHeight;
  
  // Show notification
  notification.style.opacity = "1";
  notification.style.transform = "translateX(0)";

  return notification;
};

const showNotification = (message, type = "success") => {
  const notification = createNotification(message, type);

  setTimeout(() => {
    // Hide notification
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    
    // Remove notification after transition
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 5000);
};

const ActionResponseCard = ({ response, error, title, onClose }) => {
  const { currentUserType, currentSelectedType } = useSelector((state) => state.users);
  
  useEffect(() => {
    const userTypeFormatted = currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1);
    const selectedTypeFormatted = currentSelectedType.charAt(0).toUpperCase() + currentSelectedType.slice(1).replace("Users", "");
    
    if (error) {
      showNotification(
        `${title} Failed for ${selectedTypeFormatted} ${userTypeFormatted} ${error.message}`,
        "error"
      );
    } else if (response) {
      let message = `${title} Successful `;
      if (response.data) {
        message += `${response.data.firstName} ${response.data.lastName} ${userTypeFormatted}`;
      } else {
        message += `${selectedTypeFormatted} ${userTypeFormatted} ${response.message || "Action completed successfully"}`;
      }
      showNotification(message, "success");
    }
    onClose();
  }, [response, error, title, onClose, currentUserType, currentSelectedType]);

  return null;
};

const User = () => {
  const dispatch = useDispatch();
  const {
    users = [],
    userDetails = null,
    totalPages = 1,
    currentUserType = 'patient',
    currentSelectedType = 'active',
    currentPage = 1,
    pageSize = 10,
    loading = false,
    detailsLoading = false,
    error = null,
    detailsError = null,
    searchQuery = '',
    showBlockConfirm = false,
    blockUserId = null,
    blockLoading = false,
    blockResponse = null,
    blockError = null,
    showUnblockConfirm = false,
    unblockUserId = null,
    unblockLoading = false,
    unblockResponse = null,
    unblockError = null,
    showEditForm = false,
    updateLoading = false,
    updateResponse = null,
    updateError = null,
    showApproveConfirm = false,
    approveUserId = null,
    approveLoading = false,
    approveResponse = null,
    approveError = null,
    showRejectConfirm = false,
    rejectUserId = null,
    rejectLoading = false,
    rejectResponse = null,
    rejectError = null,
    showCreateManagerForm: showCreateManagerFormState = false,
    createManagerLoading = false,
    createManagerResponse = null,
    createManagerError = null,
  } = useSelector((state) => state.users) || {};

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [genesSearch, setGenesSearch] = useState("");
  const [medicationsSearch, setMedicationsSearch] = useState("");
  const [transactionsSearch, setTransactionsSearch] = useState("");
  const [genesPage, setGenesPage] = useState(1);
  const [medicationsPage, setMedicationsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [genesPageSize, setGenesPageSize] = useState(10);
  const [medicationsPageSize, setMedicationsPageSize] = useState(10);
  const [transactionsPageSize, setTransactionsPageSize] = useState(10);
  const [currentEditUser, setCurrentEditUser] = useState(null);

  const fetchUsersForTable = useCallback(() => {
    setIsTableLoading(true);
    dispatch(
      fetchUsers({
        userType: currentUserType,
        selectedType: currentSelectedType,
        page: currentPage,
        pageSize,
      })
    ).finally(() => {
      setIsTableLoading(false);
    });
  }, [dispatch, currentUserType, currentSelectedType, currentPage, pageSize]);

  useEffect(() => {
    fetchUsersForTable();
  }, [fetchUsersForTable]);

  // Add new useEffect for type changes
  useEffect(() => {
    // Refresh the list whenever user type or selected type changes
    if (currentUserType && currentSelectedType) {
      setIsTableLoading(true);
      dispatch(
        fetchUsers({
          userType: currentUserType,
          selectedType: currentSelectedType,
          page: 1, // Reset to first page when switching types
          pageSize,
        })
      ).finally(() => {
        setIsTableLoading(false);
      });
    }
  }, [currentUserType, currentSelectedType, dispatch, pageSize]);

  useEffect(() => {
    if (
      updateResponse ||
      updateError ||
      blockResponse ||
      blockError ||
      unblockResponse ||
      unblockError ||
      approveResponse ||
      approveError ||
      rejectResponse ||
      rejectError ||
      createManagerResponse ||
      createManagerError
    ) {
      const timer = setTimeout(() => {
        dispatch(clearUpdateResponse());
        dispatch(clearBlockResponse());
        dispatch(clearUnblockResponse());
        dispatch(clearApproveResponse());
        dispatch(clearRejectResponse());
        dispatch(clearCreateManagerResponse());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [
    updateResponse,
    updateError,
    blockResponse,
    blockError,
    unblockResponse,
    unblockError,
    approveResponse,
    approveError,
    rejectResponse,
    rejectError,
    createManagerResponse,
    createManagerError,
    dispatch,
  ]);

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleDetailsClick = (userId) => {
    dispatch(fetchUserDetails(userId));
  };

  const handleBackClick = () => {
    setIsTableLoading(true);
    dispatch(clearUserDetails());
    fetchUsersForTable();
  };

  const handleBlockClick = (userId) => {
    dispatch(showBlockConfirmCard(userId));
  };

  const handleUnblockClick = (userId) => {
    dispatch(showUnblockConfirmCard(userId));
  };

  const handleApproveClick = (userId) => {
    dispatch(showApproveConfirmCard(userId));
  };

  const handleRejectClick = (userId) => {
    dispatch(showRejectConfirmCard(userId));
  };

  const handleConfirmBlock = () => {
    const blockAction = {
      patient: blockPatient,
      manager: blockManager,
      researcher: blockResearcher,
    }[currentUserType];

    dispatch(blockAction(blockUserId)).then(() => {
      dispatch(
        fetchUsers({
          userType: currentUserType,
          selectedType: currentSelectedType,
          page: currentPage,
          pageSize,
        })
      );
    });
  };

  const handleConfirmUnblock = () => {
    const unblockAction = {
      patient: unblockPatient,
      manager: unblockManager,
      researcher: unblockResearcher,
    }[currentUserType];

    dispatch(unblockAction(unblockUserId)).then(() => {
      dispatch(
        fetchUsers({
          userType: currentUserType,
          selectedType: currentSelectedType,
          page: currentPage,
          pageSize,
        })
      );
    });
  };

  const handleConfirmApprove = () => {
    dispatch(approveResearcher(approveUserId)).then(() => {
      dispatch(
        fetchUsers({
          userType: currentUserType,
          selectedType: currentSelectedType,
          page: currentPage,
          pageSize,
        })
      );
    });
  };

  const handleConfirmReject = () => {
    dispatch(rejectResearcher(rejectUserId)).then(() => {
      dispatch(
        fetchUsers({
          userType: currentUserType,
          selectedType: currentSelectedType,
          page: currentPage,
          pageSize,
        })
      );
    });
  };

  const handleEditClick = (user) => {
    setCurrentEditUser(user);
    dispatch(showEditFormCard({ id: user.id }));
  };

  const handleFormSubmit = (formData) => {
    dispatch(
      updateUser({
        userId: currentEditUser.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        role: currentUserType,
      })
    ).then(() => {
      dispatch(hideEditFormCard());
      setCurrentEditUser(null);
      fetchUsersForTable();
    });
  };

  const handleCancelEdit = () => {
    dispatch(hideEditFormCard());
    setCurrentEditUser(null);
  };

  const handleAddManagerClick = () => {
    dispatch(showCreateManagerForm());
  };

  const handleAddManagerSubmit = (formData) => {
    dispatch(
      createManager({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      })
    ).then(() => {
      dispatch(hideCreateManagerForm());
      if (currentUserType === 'manager' && currentSelectedType === 'active') {
        fetchUsersForTable();
      }
    });
  };

  const handleCancelAddManager = () => {
    dispatch(hideCreateManagerForm());
  };

  const userTypes = ["patient", "manager", "researcher"];
  const statusOptions = {
    patient: ["active", "blocked"],
    manager: ["active", "blocked"],
    researcher: ["active", "blocked", "unapproved", "rejectedUsers"],
  };

  const baseTableHeaders = {
    patient: [
      "First Name",
      "Last Name",
      "Email",
      "Wallet",
      "Medications",
      "Genes",
      "Details",
      "Action",
      "Settings",
    ],
    manager: [
      "First Name",
      "Last Name",
      "Email",
      "Wallet",
      "Action",
      "Settings",
    ],
    researcher: [
      "First Name",
      "Last Name",
      "Email",
      "Wallet",
      "Action",
      "Settings",
    ],
  };

  const shouldRemoveSettings =
    (currentUserType === "patient" && currentSelectedType === "blocked") ||
    (currentUserType === "manager" && currentSelectedType === "blocked") ||
    (currentUserType === "researcher" && currentSelectedType === "blocked") ||
    (currentUserType === "researcher" && currentSelectedType === "rejectedUsers");

  const tableHeaders = {
    ...baseTableHeaders,
    [currentUserType]: shouldRemoveSettings
      ? baseTableHeaders[currentUserType].filter((header) => header !== "Settings")
      : baseTableHeaders[currentUserType],
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredGenes =
    userDetails?.genesData?.filter(
      (gene) =>
        gene.GeneName?.toLowerCase().includes(genesSearch.toLowerCase()) ||
        gene.PhenoType?.toLowerCase().includes(genesSearch.toLowerCase())
    ) || [];
  const filteredMedications =
    userDetails?.medicationData?.filter(
      (med) =>
        med.DrugId?.toLowerCase().includes(medicationsSearch.toLowerCase()) ||
        med.DrugName?.toLowerCase().includes(medicationsSearch.toLowerCase()) ||
        med.DrugType?.toLowerCase().includes(medicationsSearch.toLowerCase())
    ) || [];
  const filteredTransactions =
    userDetails?.transactions?.transactions?.filter(
      (txn) =>
        txn.Date?.toLowerCase().includes(transactionsSearch.toLowerCase()) ||
        txn.SenderKey?.toLowerCase().includes(transactionsSearch.toLowerCase()) ||
        txn.ReceiverKey?.toLowerCase().includes(transactionsSearch.toLowerCase()) ||
        txn.Hash?.toLowerCase().includes(transactionsSearch.toLowerCase()) ||
        txn.Amount?.toString().includes(transactionsSearch.toLowerCase()) ||
        txn.Message?.toLowerCase().includes(transactionsSearch.toLowerCase()) ||
        txn.Status?.toLowerCase().includes(transactionsSearch.toLowerCase())
    ) || [];

  const ConfirmBlockCard = () => (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <div className="card p-5" style={{ width: "450px" }}>
        <h4 className="text-start denser mb-2 text-primary">Confirm Block</h4>
        <p className="text-start denser mb-4">Are you sure you want to block this user?</p>
        <div className="d-flex justify-content-end gap-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => dispatch(hideBlockConfirmCard())}
            disabled={blockLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleConfirmBlock}
            disabled={blockLoading}
          >
            {blockLoading ? (
              <>
                <span
                  className="fa-solid fa-spinner fa-spin me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Blocking...
              </>
            ) : (
              "Block"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const ConfirmUnblockCard = () => (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <div className="card p-5" style={{ width: "450px" }}>
        <h4 className="text-start denser mb-2 text-primary">Confirm Unblock</h4>
        <p className="text-start denser mb-4">Are you sure you want to unblock this user?</p>
        <div className="d-flex justify-content-end gap-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => dispatch(hideUnblockConfirmCard())}
            disabled={unblockLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleConfirmUnblock}
            disabled={unblockLoading}
          >
            {unblockLoading ? (
              <>
                <span
                  className="fa-solid fa-spinner fa-spin me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Unblocking...
              </>
            ) : (
              "Unblock"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const ConfirmApproveCard = () => (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <div className="card p-5" style={{ width: "450px" }}>
        <h4 className="text-start denser mb-2 text-primary">Confirm Approve</h4>
        <p className="text-start denser mb-4">Are you sure you want to approve this researcher?</p>
        <div className="d-flex justify-content-end gap-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => dispatch(hideApproveConfirmCard())}
            disabled={approveLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleConfirmApprove}
            disabled={approveLoading}
          >
            {approveLoading ? (
              <>
                <span
                  className="fa-solid fa-spinner fa-spin me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Approving...
              </>
            ) : (
              "Approve"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const ConfirmRejectCard = () => (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <div className="card p-5" style={{ width: "450px" }}>
        <h4 className="text-start denser mb-2 text-primary">Confirm Reject</h4>
        <p className="text-start denser mb-4">Are you sure you want to reject this researcher?</p>
        <div className="d-flex justify-content-end gap-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => dispatch(hideRejectConfirmCard())}
            disabled={rejectLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleConfirmReject}
            disabled={rejectLoading}
          >
            {rejectLoading ? (
              <>
                <span
                  className="fa-solid fa-spinner fa-spin me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Rejecting...
              </>
            ) : (
              "Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSkeletonTable = () => (
    <table className="table table-responsive table-bordered table-striped text-center align-middle small">
      <thead>
        <tr>
          {tableHeaders[currentUserType].map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(10)].map((_, index) => (
          <tr key={index}>
            {tableHeaders[currentUserType].map((_, i) => (
              <td key={i}>
                <div className="skeleton-line" style={{ width: "60%", margin: "0 auto" }}></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSkeletonCard = () => (
    <div className="card p-4 mb-4">
      <h5 className="text-primary denser mb-3 text-center fw-bold">
        {currentSelectedType.charAt(0).toUpperCase() +
          currentSelectedType.slice(1).replace("Users", "")}{" "}
        {currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)} Details
      </h5>
      <h6 className="text-primary denser mb-3 mt-3 text-center">User Progress</h6>
      <table className="table table-bordered table-striped text-center small mb-4">
        <thead>
          <tr>
            <th>Wallet</th>
            <th>Medications</th>
            <th>Genes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {[...Array(3)].map((_, i) => (
              <td key={i}>
                <div className="skeleton-line" style={{ width: "60%", margin: "0 auto" }}></div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <h6 className="text-primary denser mb-3 mt-3 text-center">Genes</h6>
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="position-relative w-100">
          <div className="skeleton-line" style={{ height: "38px", width: "100%" }}></div>
        </div>
      </div>
      <table className="table table-bordered table-striped text-center small mb-4">
        <thead>
          <tr>
            <th>Gene Name</th>
            <th>PhenoType</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              {[...Array(2)].map((_, i) => (
                <td key={i}>
                  <div className="skeleton-line" style={{ width: "60%", margin: "0 auto" }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h6 className="text-primary denser mb-3 mt-3 text-center">Medications</h6>
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="position-relative w-100">
          <div className="skeleton-line" style={{ height: "38px", width: "100%" }}></div>
        </div>
      </div>
      <table className="table table-bordered table-striped text-center small mb-4">
        <thead>
          <tr>
            <th>Drug Id</th>
            <th>Drug Name</th>
            <th>Drug Type</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              {[...Array(3)].map((_, i) => (
                <td key={i}>
                  <div className="skeleton-line" style={{ width: "60%", margin: "0 auto" }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h6 className="text-primary denser mb-3 mt-3 text-center">User Transactions</h6>
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="position-relative w-100">
          <div className="skeleton-line" style={{ height: "38px", width: "100%" }}></div>
        </div>
      </div>
      <table className="table table-bordered table-striped text-center small mb-4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Sender Key</th>
            <th>Receiver Key</th>
            <th>Hash</th>
            <th>Amount</th>
            <th>Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              {[...Array(7)].map((_, i) => (
                <td key={i}>
                  <div className="skeleton-line" style={{ width: "60%", margin: "0 auto" }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => {
    const pages = [];

    pages.push(
      <button
        key="prev"
        className="btn btn-sm btn-outline-primary mx-1 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: "0" }}
        onClick={() => dispatch(setPage(Math.max(currentPage - 1, 1)))}
        disabled={currentPage === 1}
      >
        <i className="bi bi-chevron-left"></i>
      </button>
    );

    const pageButtons = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageButtons.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageButtons.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageButtons.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    for (const page of pageButtons) {
      if (page === "...") {
        pages.push(
          <span
            key={`dots-${Math.random()}`}
            className="mx-2 d-flex align-items-center"
            style={{ height: "32px" }}
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            onClick={() => dispatch(setPage(page))}
            className={`btn btn-sm mx-1 rounded-circle d-flex align-items-center justify-content-center ${
              currentPage === page ? "btn-primary" : "btn-outline-primary"
            }`}
            style={{ width: "32px", height: "32px", padding: "0" }}
          >
            {page}
          </button>
        );
      }
    }

    pages.push(
      <button
        key="next"
        className="btn btn-sm btn-outline-primary mx-1 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: "0" }}
        onClick={() => dispatch(setPage(Math.min(currentPage + 1, totalPages)))}
        disabled={currentPage === totalPages}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    );

    return (
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex justify-content-center flex-wrap">{pages}</div>
        <select
          className="form-select form-select-sm d-inline w-auto"
          value={pageSize}
          onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    );
  };

  const renderSectionPagination = (currentPage, setPage, totalItems, pageSize, setPageSize) => {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const pages = [];

    pages.push(
      <button
        key="prev"
        className="btn btn-sm btn-outline-primary mx-1 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: "0" }}
        onClick={() => setPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        <i className="bi bi-chevron-left"></i>
      </button>
    );

    const pageButtons = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageButtons.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageButtons.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageButtons.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    for (const page of pageButtons) {
      if (page === "...") {
        pages.push(
          <span
            key={`dots-${Math.random()}`}
            className="mx-2 d-flex align-items-center"
            style={{ height: "32px" }}
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`btn btn-sm mx-1 rounded-circle d-flex align-items-center justify-content-center ${
              currentPage === page ? "btn-primary" : "btn-outline-primary"
            }`}
            style={{ width: "32px", height: "32px", padding: "0" }}
          >
            {page}
          </button>
        );
      }
    }

    pages.push(
      <button
        key="next"
        className="btn btn-sm btn-outline-primary mx-1 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: "0" }}
        onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    );

    return (
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex justify-content-center flex-wrap">{pages}</div>
        <select
          className="form-select form-select-sm d-inline w-auto"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    );
  };

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 12)}...${address.slice(-12)}` : "N/A";
  };

  const shortenEmail = (email) => {
    if (!email) return "-";
    if (email.length <= 24) return email;
    return `${email.slice(0, 12)}...${email.slice(-12)}`;
  };

  const renderUserDetailsCard = () => {
    if (detailsLoading) {
      return renderSkeletonCard();
    }

    if (detailsError) {
      return (
        <div className="card p-4 mb-4">
          <div className="text-danger text-center">Error: {detailsError.message}</div>
        </div>
      );
    }

    if (!userDetails) return null;

    const { progress } = userDetails;

    return (
      <div className="card p-4 mb-4">
        <h5 className="text-primary denser mb-3 text-center" style={{ fontWeight: "bold" }}>
          {currentSelectedType.charAt(0).toUpperCase() +
            currentSelectedType.slice(1).replace("Users", "")}{" "}
          {currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)} Details
        </h5>

        <h6 className="text-primary denser mb-3 mt-3 text-center">User Progress</h6>
        <table className="table table-bordered table-striped text-center small mb-4">
          <thead>
            <tr>
              <th>Wallet</th>
              <th>Medications</th>
              <th>Genes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {progress.wallet ? <span className="text-success">✔</span> : <span className="text-danger">✘</span>}
              </td>
              <td>
                {progress.medication ? (
                  <span className="text-success">✔</span>
                ) : (
                  <span className="text-danger">✘</span>
                )}
              </td>
              <td>
                {progress.genes ? <span className="text-success">✔</span> : <span className="text-danger">✘</span>}
              </td>
            </tr>
          </tbody>
        </table>

        <h6 className="text-primary denser mb-3 mt-3 text-center">Genes</h6>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div className="position-relative w-100">
            <input
              type="text"
              className="form-control bg-white pe-5"
              style={{ color: "#000" }}
              placeholder="Search genes..."
              value={genesSearch}
              onChange={(e) => {
                setGenesSearch(e.target.value);
                setGenesPage(1);
              }}
            />
            <i
              className="fas fa-search position-absolute"
              style={{
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                color: "#aaa",
                pointerEvents: "none",
              }}
            ></i>
          </div>
        </div>
        <table className="table table-bordered table-striped text-center small mb-4">
          <thead>
            <tr>
              <th>Gene Name</th>
              <th>PhenoType</th>
            </tr>
          </thead>
          <tbody>
            {filteredGenes.length > 0 ? (
              filteredGenes
                .slice((genesPage - 1) * genesPageSize, genesPage * genesPageSize)
                .map((gene, index) => (
                  <tr key={index}>
                    <td>{gene.GeneName || "-"}</td>
                    <td>{gene.PhenoType || "-"}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-muted">
                  No genes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {renderSectionPagination(genesPage, setGenesPage, filteredGenes.length, genesPageSize, setGenesPageSize)}

        <h6 className="text-primary denser mb-3 mt-3 text-center">Medications</h6>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div className="position-relative w-100">
            <input
              type="text"
              className="form-control bg-white pe-5"
              style={{ color: "#000" }}
              placeholder="Search medications..."
              value={medicationsSearch}
              onChange={(e) => {
                setMedicationsSearch(e.target.value);
                setMedicationsPage(1);
              }}
            />
            <i
              className="fas fa-search position-absolute"
              style={{
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                color: "#aaa",
                pointerEvents: "none",
              }}
            ></i>
          </div>
        </div>
        <table className="table table-bordered table-striped text-center small mb-4">
          <thead>
            <tr>
              <th>Drug Id</th>
              <th>Drug Name</th>
              <th>Drug Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedications.length > 0 ? (
              filteredMedications
                .slice((medicationsPage - 1) * medicationsPageSize, medicationsPage * medicationsPageSize)
                .map((med, index) => (
                  <tr key={index}>
                    <td>{med.DrugId || "-"}</td>
                    <td>{med.DrugName || "-"}</td>
                    <td>{med.DrugType || "-"}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No medications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {renderSectionPagination(
          medicationsPage,
          setMedicationsPage,
          filteredMedications.length,
          medicationsPageSize,
          setMedicationsPageSize
        )}

        <h6 className="text-primary denser mb-3 mt-3 text-center">User Transactions</h6>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div className="position-relative w-100">
            <input
              type="text"
              className="form-control bg-white pe-5"
              style={{ color: "#000" }}
              placeholder="Search transactions..."
              value={transactionsSearch}
              onChange={(e) => {
                setTransactionsSearch(e.target.value);
                setTransactionsPage(1);
              }}
            />
            <i
              className="fas fa-search position-absolute"
              style={{
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                color: "#aaa",
                pointerEvents: "none",
              }}
            ></i>
          </div>
        </div>
        <table className="table table-bordered table-striped text-center small mb-4">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sender Key</th>
              <th>Receiver Key</th>
              <th>Hash</th>
              <th>Amount</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions
                .slice((transactionsPage - 1) * transactionsPageSize, transactionsPage * transactionsPageSize)
                .map((txn, index) => (
                  <tr key={index}>
                    <td>{txn.Date || "-"}</td>
                    <td>{formatAddress(txn.SenderKey) || "-"}</td>
                    <td>{formatAddress(txn.ReceiverKey) || "-"}</td>
                    <td>{formatAddress(txn.Hash) || "-"}</td>
                    <td>{txn.Amount || "-"}</td>
                    <td>{txn.Message || "-"}</td>
                    <td>{txn.Status || "-"}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {renderSectionPagination(
          transactionsPage,
          setTransactionsPage,
          filteredTransactions.length,
          transactionsPageSize,
          setTransactionsPageSize
        )}
      </div>
    );
  };

  return (
    <div className="container my-4">
      {(updateResponse || updateError) && (
        <ActionResponseCard
          response={updateResponse}
          error={updateError}
          title="Update"
          onClose={() => dispatch(clearUpdateResponse())}
        />
      )}
      {(blockResponse || blockError) && (
        <ActionResponseCard
          response={blockResponse}
          error={blockError}
          title="Block"
          onClose={() => dispatch(clearBlockResponse())}
        />
      )}
      {(unblockResponse || unblockError) && (
        <ActionResponseCard
          response={unblockResponse}
          error={unblockError}
          title="Unblock"
          onClose={() => dispatch(clearUnblockResponse())}
        />
      )}
      {(approveResponse || approveError) && (
        <ActionResponseCard
          response={approveResponse}
          error={approveError}
          title="Approve"
          onClose={() => dispatch(clearApproveResponse())}
        />
      )}
      {(rejectResponse || rejectError) && (
        <ActionResponseCard
          response={rejectResponse}
          error={rejectError}
          title="Reject"
          onClose={() => dispatch(clearRejectResponse())}
        />
      )}
      {(createManagerResponse || createManagerError) && (
        <ActionResponseCard
          response={createManagerResponse}
          error={createManagerError}
          title="Create Manager"
          onClose={() => dispatch(clearCreateManagerResponse())}
        />
      )}
      {showBlockConfirm && <ConfirmBlockCard />}
      {showUnblockConfirm && <ConfirmUnblockCard />}
      {showApproveConfirm && <ConfirmApproveCard />}
      {showRejectConfirm && <ConfirmRejectCard />}
      {showEditForm && currentEditUser && (
        <EditUserForm
          user={currentEditUser}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
          updateLoading={updateLoading}
        />
      )}
      {showCreateManagerFormState && (
        <AddManagerForm
          onSubmit={handleAddManagerSubmit}
          onCancel={handleCancelAddManager}
          createManagerLoading={createManagerLoading}
        />
      )}
      {currentUserType === "patient" &&
      (currentSelectedType === "active" || currentSelectedType === "blocked") &&
      (userDetails || detailsLoading || detailsError) ? (
        <div>
          <div className="d-flex align-items-center mb-3">
            <button className="btn btn-primary" onClick={handleBackClick}>
              <i className="fas fa-chevron-left me-2"></i>Back
            </button>
          </div>
          {renderUserDetailsCard()}
        </div>
      ) : (
        <div>
          <div className="row mb-4">
            <div className="col-4 mb-3">
              <div className="form-floating">
                <select
                  id="userType"
                  value={currentUserType}
                  onChange={(e) => dispatch(setUserType(e.target.value))}
                  className="form-select bg-white cursor-pointer"
                  style={{ color: "#000" }}
                >
                  {userTypes.map((type) => (
                    <option 
                      key={type} 
                      value={type}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <style>
                  {`
                    .cursor-pointer {
                      cursor: pointer !important;
                    }
                    .cursor-pointer option {
                      cursor: pointer !important;
                    }
                  `}
                </style>
                <label htmlFor="userType">Select User Type</label>
              </div>
              <div className="text-muted mt-2 small">Please select a user type.</div>
            </div>
            <div className="col-12 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="btn-group" role="group" aria-label="Status options">
                  {statusOptions[currentUserType].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => dispatch(setSelectedType(status))}
                      className={`btn ${
                        currentSelectedType === status ? "btn-primary" : "btn-outline-primary"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace("Users", "")}
                    </button>
                  ))}
                </div>
                {currentUserType === "manager" && currentSelectedType === "active" && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddManagerClick}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-user-plus me-2"></i>Add Manager
                  </button>
                )}
              </div>
            </div>
          </div>
          <h4 className="mb-3 text-center denser mb-2 text-primary">Users</h4>
          <div className="d-flex justify-content-center align-items-center mb-3">
            <div className="position-relative w-100">
              <input
                type="text"
                className="form-control bg-white pe-5"
                style={{ color: "#000" }}
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <i
                className="fas fa-search position-absolute"
                style={{
                  top: "50%",
                  right: "15px",
                  transform: "translateY(-50%)",
                  color: "#aaa",
                  pointerEvents: "none",
                }}
              ></i>
            </div>
          </div>

          {error && <div className="text-danger text-center denser mb-3">Error: {error.message}</div>}
          {isTableLoading || loading ? (
            <div>
              {renderSkeletonTable()}
              {renderPagination()}
            </div>
          ) : (
            <div>
              <table className="table table-responsive table-bordered table-striped text-center align-middle small">
                <thead>
                  <tr>
                    {tableHeaders[currentUserType].map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.firstName || "-"}</td>
                        <td>{user.lastName || "-"}</td>
                        <td>{shortenEmail(user.email)}</td>
                        <td>
                          {typeof user.wallet === "boolean" ? (
                            user.wallet ? (
                              <span className="text-success">✓</span>
                            ) : (
                              <span className="text-danger">✗</span>
                            )
                          ) : user.wallet?.publicKey ? (
                            <span className="text-success">✓</span>
                          ) : (
                            <span className="text-danger">✗</span>
                          )}
                        </td>
                        {currentUserType === "patient" && (
                          <>
                            <td>
                              {currentUserType === "patient" &&
                              (currentSelectedType === "active" || currentSelectedType === "blocked") ? (
                                user.medications ? (
                                  <span className="text-success">✓</span>
                                ) : (
                                  <span className="text-danger">✗</span>
                                )
                              ) : user.medications ? (
                                "Yes"
                              ) : (
                                "No"
                              )}
                            </td>
                            <td>
                              {currentUserType === "patient" &&
                              (currentSelectedType === "active" || currentSelectedType === "blocked") ? (
                                user.genes ? (
                                  <span className="text-success">✓</span>
                                ) : (
                                  <span className="text-danger">✗</span>
                                )
                              ) : user.genes ? (
                                "Yes"
                              ) : (
                                "No"
                              )}
                            </td>
                            <td>
                              {(currentSelectedType === "active" || currentSelectedType === "blocked") && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleDetailsClick(user.id)}
                                >
                                  <i className="fas fa-info-circle me-2"></i>
                                  Details
                                </button>
                              )}
                            </td>
                          </>
                        )}
                        <td>
                          {currentSelectedType === "blocked" ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUnblockClick(user.id)}
                            >
                              <i className="fas fa-lock-open me-2"></i>Unblock
                            </button>
                          ) : currentSelectedType === "active" ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleBlockClick(user.id)}
                            >
                              <i className="fas fa-ban me-2"></i>Block
                            </button>
                          ) : currentUserType === "researcher" &&
                            currentSelectedType === "unapproved" ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApproveClick(user.id)}
                            >
                              <i className="fas fa-check me-2"></i>Approve
                            </button>
                          ) : currentUserType === "researcher" &&
                            currentSelectedType === "rejectedUsers" ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApproveClick(user.id)}
                            >
                              <i className="fas fa-check me-2"></i>Approve
                            </button>
                          ) : null}
                        </td>
                        {!shouldRemoveSettings && (
                          <td>
                            {currentUserType === "researcher" &&
                            currentSelectedType === "unapproved" ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleRejectClick(user.id)}
                              >
                                <i className="fas fa-times me-2"></i>Reject
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleEditClick(user)}
                                data-testid="settings-button"
                              >
                                <i className="fas fa-cog me-2"></i>Settings
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableHeaders[currentUserType].length} className="text-center text-muted">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default User;