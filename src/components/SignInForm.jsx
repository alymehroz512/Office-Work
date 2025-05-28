import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";
import ParticleNetwork from "./ParticleNetwork";

const SignInForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Redirect if already logged in (now using cookie-based token)
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!role) {
      setFormError("Please select a role.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter both email and password.");
      return;
    }

    try {
      await dispatch(loginUser({ role, email, password })).unwrap();
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error.includes("Failed to fetch")) {
      return "Failed to fetch";
    }
    return error;
  };

  return (
    <div className="container-fluid SignInFormBackground">
      <ParticleNetwork />
      <div className="row justify-content-center">
        <div className="col-md-5 p-2">
          <div className="card p-5 shadow SignInFormCard">
            <div className="lock-icon-wrapper text-center mb-3">
              <i className="fa-solid fa-lock fs-4" />
            </div>
            <h2 className="signin-heading text-center mb-4">Sign In</h2>

            {/* Role selection */}
            <div className="mb-4 text-center">
              <div className="btn-group" role="group" aria-label="Role selection">
                <button
                  type="button"
                  className={`btn btn-outline-primary d-flex align-items-center gap-2 ${
                    role === "admin" ? "active" : ""
                  }`}
                  onClick={() => setRole("admin")}
                >
                  <i className="fa-solid fa-user-shield" /> Admin
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary d-flex align-items-center gap-2 ${
                    role === "manager" ? "active" : ""
                  }`}
                  onClick={() => setRole("manager")}
                >
                  <i className="fa-solid fa-user-tie" /> Manager
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="form-sm" data-testid="sign-in-form">
              {/* Email */}
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="floatingEmail"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="email-input"
                />
                <label htmlFor="floatingEmail">Email</label>
              </div>

              {/* Password */}
              <div className="form-floating mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="floatingPassword"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="password-input"
                />
                <label htmlFor="floatingPassword">Password</label>
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="toggle-password"
                >
                  {showPassword ? (
                    <i className="fa-solid fa-eye-slash" />
                  ) : (
                    <i className="fa-solid fa-eye" />
                  )}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2"
                disabled={loading}
                data-testid="sign-in-button"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Error messages */}
              {formError && (
                <div className="text-danger text-center mt-3" data-testid="form-error">
                  {formError}
                </div>
              )}
              {error && (
                <div className="text-danger text-center mt-2" data-testid="server-error">
                  {getErrorMessage()}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
