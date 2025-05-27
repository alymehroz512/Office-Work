import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { logout } from "../features/auth/authSlice";
import { fetchDashboardData } from "../features/dashboard/dashboardSlice";
import "../index.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2", path: "/" },
  { id: "app-config", label: "Application Configuration", icon: "bi-gear", path: "/app-config" },
  { id: "app-status", label: "Application Status", icon: "bi-bar-chart-line", path: "/app-status" },
  { id: "bridge", label: "Bridge", icon: "bi-diagram-2", path: "/bridge" },
  { id: "test-results", label: "Test Results", icon: "bi-clipboard-data", path: "/test-results" },
  { id: "users", label: "Users", icon: "bi-people", path: "/users" },
  { id: "facilities", label: "Facilities", icon: "bi-building", path: "/facilities" },
  { id: "audit-logs", label: "AuditLogs", icon: "bi-journal-text", path: "/audit-logs" },
  { id: "test-formats", label: "Test Formats", icon: "bi-file-earmark-text", path: "/test-formats" },
  { id: "patients-medical", label: "Patients Medical", icon: "bi-heart-pulse", path: "/patients-medical" },
  { id: "roles-permission", label: "Roles and Permission", icon: "bi-shield-lock", path: "/roles-permission" },
  { id: "strip-transaction", label: "Strip Transaction", icon: "bi-credit-card", path: "/strip-transaction" },
  { id: "product", label: "Product", icon: "bi-box-seam", path: "/product" },
  { id: "logout", label: "Logout", icon: "bi-box-arrow-right", path: "/logout" },
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
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);

  // Get current page from path
  const getCurrentPage = () => {
    const currentPath = location.pathname === "/" ? "/" : location.pathname;
    const currentNav = navItems.find(item => {
      if (item.path === "/") {
        return currentPath === "/";
      }
      return currentPath.startsWith(item.path);
    });
    return currentNav?.label || "Dashboard";
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
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

  const handleNavItemClick = (path, label) => {
    if (label === "Logout") {
      setShowLogoutConfirm(true);
    } else {
      navigate(path);
      if (isMobile) setCollapsed(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => setShowLogoutConfirm(false);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Header - Now at the very top */}
      <div
        className="bg-primary p-3 d-flex align-items-center justify-content-between position-fixed w-100"
        style={{ height: "70px", borderBottom: "1px solid #ddd", zIndex: 1041 }}
      >
        <div className="d-flex align-items-center w-100">
          <button 
            className="btn btn-primary fs-4 d-flex align-items-center justify-content-center border-0" 
            onClick={toggleSidebar}
            data-testid="mobile-menu-btn"
            style={{
              width: "40px",
              height: "40px",
              padding: 0
            }}
          >
          <i className="bi bi-list text-white"></i>
          </button>
          <h4 className="text-white flex-grow-1 m-0 text-center">
            {headerTitles[getCurrentPage()] || getCurrentPage()}
          </h4>
        </div>
        <div style={{ width: "40px" }}></div>
      </div>

      {/* Main content wrapper */}
      <div className="d-flex" style={{ marginTop: "70px", minHeight: "calc(100vh - 70px)" }}>
        {/* Sidebar - Now below header */}
        <div
          className={`bg-light border-end ${
            collapsed && isMobile ? "d-none" : ""
          }`}
          style={{
            width: collapsed ? "92px" : "320px",
            transition: "width 0.3s",
            position: "fixed",
            top: "70px",
            bottom: 0,
            left: 0,
            zIndex: 1040,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item-custom d-flex align-items-center text-dark mb-2 mx-2 mt-2 ${
                location.pathname === item.path ? "active" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleNavItemClick(item.path, item.label)}
              data-testid={`nav-${item.id}`}
            >
              <i className={`${item.icon} me-3 mx-2`} style={{ fontSize: "1.2rem" }}></i>
              {!collapsed && <span>{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Overlay for mobile */}
        {!collapsed && isMobile && (
          <div
            className="position-fixed w-100 h-100 bg-dark bg-opacity-50"
            style={{ 
              zIndex: 1030,
              top: "70px",
              left: 0,
              bottom: 0
            }}
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main Content Area */}
        <div
          className="flex-grow-1"
          style={{
            marginLeft: isMobile ? 0 : collapsed ? "100px" : "320px",
            transition: "margin-left 0.3s",
            width: "100%"
          }}
        >
          <div className="p-4">
            <Outlet />
          </div>
        </div>
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
    </div>
  );
};

export default DashboardLayout;
