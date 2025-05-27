import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import SignInForm from "./SignInForm";
import DashboardPage from "../pages/DashboardPage";
import ApplicationConfigurationPage from "../pages/ApplicationConfigurationPage";
import ApplicationStatusPage from "../pages/ApplicationStatusPage";
import Bridge from "../pages/Bridge";
import TestResult from "../pages/TestResult";
import User from "../pages/User";
import { logout } from "../features/auth/authSlice";
import { fetchDashboardData } from "../features/dashboard/dashboardSlice";

import "../index.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { id: "app-config", label: "Application Configuration", icon: "bi-gear" },
  { id: "app-status", label: "Application Status", icon: "bi-bar-chart-line" },
  { id: "bridge", label: "Bridge", icon: "bi-diagram-2" },
  { id: "test-results", label: "Test Results", icon: "bi-clipboard-data" },
  { id: "users", label: "Users", icon: "bi-people" },
  { id: "facilities", label: "Facilities", icon: "bi-building" },
  { id: "audit-logs", label: "AuditLogs", icon: "bi-journal-text" },
  { id: "test-formats", label: "Test Formats", icon: "bi-file-earmark-text" },
  { id: "patients-medical", label: "Patients Medical", icon: "bi-heart-pulse" },
  { id: "roles-permission", label: "Roles and Permission", icon: "bi-shield-lock" },
  { id: "strip-transaction", label: "Strip Transaction", icon: "bi-credit-card" },
  { id: "product", label: "Product", icon: "bi-box-seam" },
  { id: "logout", label: "Logout", icon: "bi-box-arrow-right" },
];

const headerTitles = {
  "Dashboard": "Dashboard",
  "Application Configuration": "Configuration Page",
  "Application Status": "Status Viewer",
  "Bridge": "Bridge",
  "Test Results": "Test Results",
  "Users": "Users",
  "Facilities": "Facilities",
  "AuditLogs": "Audit Logs",
  "Test Formats": "Test Formats",
  "Patients Medical": "Patients Medical",
  "Roles and Permission": "Roles & Permissions",
  "Strip Transaction": "Transaction History",
  "Product": "Product Manager",
};

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(true);
  const [selectedNavItem, setSelectedNavItem] = useState("Dashboard");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);

  // Reset state when auth token changes
  useEffect(() => {
    if (!token) {
      setSelectedNavItem("Dashboard");
      setCollapsed(true);
    }
  }, [token]);

  useEffect(() => {
    // Only fetch dashboard data if we have a token
    if (token) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, token]);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 991;
      setIsMobile(isNowMobile);
      setCollapsed(isNowMobile);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleNavItemClick = (label) => {
    if (label === "Logout") {
      setShowLogoutConfirm(true);
    } else {
      setSelectedNavItem(label);
      if (isMobile) setCollapsed(true);
    }
  };

  const handleLogout = () => {
    setSelectedNavItem("Dashboard"); // Reset selected nav item
    setCollapsed(true); // Reset sidebar state
    dispatch(logout());
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const renderContent = () => {
    switch (selectedNavItem) {
      case "Dashboard":
        return <DashboardPage />;
      case "Application Configuration":
        return <ApplicationConfigurationPage />;
      case "Application Status":
        return <ApplicationStatusPage />;
      case "Bridge":
        return <Bridge />;
      case "Test Results":
        return <TestResult />;
      case "Users":
        return <User />;
      case "Facilities":
        return <div>Facilities Page</div>;
      case "AuditLogs":
        return <div>Audit Logs Page</div>;
      case "Test Formats":
        return <div>Test Formats Page</div>;
      case "Patients Medical":
        return <div>Patients Medical Page</div>;
      case "Roles and Permission":
        return <div>Roles and Permission Page</div>;
      case "Strip Transaction":
        return <div>Strip Transaction Page</div>;
      case "Product":
        return <div>Product Page</div>;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", position: "relative" }}>
      {!token ? (
        <SignInForm />
      ) : (
        <>
          {/* Sidebar */}
          <div
            className={`bg-light p-3 border-end position-fixed top-0 bottom-0 start-0 ${
              collapsed && isMobile ? "d-none" : ""
            }`}
            style={{
              width: collapsed ? "100px" : "320px",
              transition: "width 0.3s",
              zIndex: 1040,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div className="mb-4">
              <button 
                className="btn btn-primary w-100 fs-5" 
                onClick={toggleSidebar}
                data-testid="mobile-menu-btn"
              >
                {collapsed ? "☰" : "←"}
              </button>
            </div>

            {navItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item-custom d-flex align-items-center text-dark mb-2 ${
                  selectedNavItem === item.label ? "active" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleNavItemClick(item.label)}
                data-testid={`nav-${item.id}`}
              >
                <i className={`${item.icon} me-3 mx-1`} style={{ fontSize: "1.2rem" }}></i>
                {!collapsed && <span>{item.label}</span>}
              </div>
            ))}
          </div>

          {/* Overlay for mobile */}
          {!collapsed && isMobile && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
              style={{ zIndex: 1030 }}
              onClick={toggleSidebar}
            ></div>
          )}

          {/* Main Content */}
          <div
            className="flex-grow-1"
            style={{
              marginLeft: isMobile ? 0 : collapsed ? "100px" : "320px",
              transition: "margin-left 0.3s",
            }}
          >
            <div
              className="bg-primary p-3 d-flex align-items-center justify-content-between"
              style={{ height: "70px", borderBottom: "1px solid #ddd" }}
            >
              <div className="d-flex align-items-center w-100">
                {isMobile && (
                  <button 
                    className="btn btn-primary" 
                    onClick={toggleSidebar}
                    data-testid="mobile-menu-btn"
                  >
                    ☰
                  </button>
                )}
                <h4 className="text-white flex-grow-1 m-0 text-center">
                  {headerTitles[selectedNavItem] || selectedNavItem}
                </h4>
              </div>
              <div style={{ width: "40px" }}></div>
            </div>

            <div className="p-4">{renderContent()}</div>
          </div>

          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50"
              style={{ zIndex: 1050 }}
            >
              <div className="card p-5" style={{ width: "450px" }}>
                <h4 className="mb-2 text-start text-primary">Confirm Logout</h4>
                <p className="text-start text-dark">
                  Are you sure you want to log out?
                </p>
                <div className="d-flex justify-content-end mt-2">
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={handleCancelLogout}
                    data-testid="cancel-logout-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary ms-2" 
                    onClick={handleLogout}
                    data-testid="confirm-logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardLayout;
