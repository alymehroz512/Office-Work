import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApplicationConfiguration,
  updateConfig,
  clearMessages,
} from "../features/applicationConfiguration/applicationConfigurationSlice";

const ApplicationConfigurationPage = () => {
  const dispatch = useDispatch();
  const { config, loading, error, successMessage } = useSelector(
    (state) => state.applicationConfiguration
  );

  const [editableFields, setEditableFields] = useState({});
  const [formValues, setFormValues] = useState({});
  const [inputChangeMessage, setInputChangeMessage] = useState(""); // State for input change notification

  useEffect(() => {
    dispatch(fetchApplicationConfiguration());
  }, [dispatch]);

  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      setFormValues(config);
    }
  }, [config]);

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

  const SuccessNotification = () => {
    useEffect(() => {
      const notification = createNotification(successMessage, 'success');

      const timer = setTimeout(() => {
        // Hide notification
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        
        // Remove notification after transition
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 500);
        dispatch(clearMessages());
      }, 5000); // Changed to 5 seconds

      return () => {
        clearTimeout(timer);
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      };
    }, []);

    return null;
  };

  const ErrorNotification = () => {
    useEffect(() => {
      const notification = createNotification(error, 'error');

      const timer = setTimeout(() => {
        // Hide notification
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        
        // Remove notification after transition
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 500);
        dispatch(clearMessages());
      }, 5000); // Changed to 5 seconds

      return () => {
        clearTimeout(timer);
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      };
    }, []);

    return null;
  };

  const InputChangeNotification = () => {
    useEffect(() => {
      if (!inputChangeMessage) return;

      const notification = createNotification(inputChangeMessage, 'success');

      const timer = setTimeout(() => {
        // Hide notification
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        
        // Remove notification after transition
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 500);
        setInputChangeMessage("");
      }, 5000); // Changed to 5 seconds

      return () => {
        clearTimeout(timer);
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      };
    }, [inputChangeMessage]);

    return null;
  };

  const handleEditClick = (field) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateConfig({ config: formValues })).then(() => {
      dispatch(fetchApplicationConfiguration());
      setInputChangeMessage("Configuration updated successfully!");
    });
  };

  const renderInput = (label, field, type = "text") => (
    <div className="col-12 col-md-6 col-lg-12" key={field}>
      <div className="form-floating mb-3 position-relative">
        {loading ? (
          <div
            className="skeleton-line"
            style={{ height: "58px", borderRadius: "4px" }}
          ></div>
        ) : (
          <>
            <input
              type={type}
              className="form-control bg-white text-dark"
              id={field}
              value={formValues[field] || ""}
              disabled={!editableFields[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditableFields((prev) => ({
                    ...prev,
                    [field]: false,
                  }));
                  setInputChangeMessage(`${label} updated successfully!`);
                  e.preventDefault();
                }
              }}
            />
            <label htmlFor={field}>{label}</label>
            {!editableFields[field] && (
              <i
                className="fa-solid fa-pencil position-absolute text-primary"
                style={{ top: "50%", right: "12px", transform: "translateY(-50%)", cursor: "pointer" }}
                onClick={() => handleEditClick(field)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {successMessage && <SuccessNotification />}
      {error && <ErrorNotification />}
      {inputChangeMessage && <InputChangeNotification />}

      <div className="container py-4" aria-busy={loading}>
        <div className="card shadow p-3 p-md-4 mx-auto" style={{ maxWidth: "800px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {renderInput("Reward Amount on Genes", "amountOnGenes", "number")}
              {renderInput("Reward Amount on PGX", "amountOnPGX", "number")}
              {renderInput("Reward Amount on Blood Data", "amountOnBlood", "number")}
              {renderInput("Reward Amount on Toxicology Data", "amountOnToxicology", "number")}
              {renderInput("Reward Amount on Infectious Disease Data", "amountOnInfectious", "number")}
              {renderInput("Reward Amount on Medications", "amountOnMedications", "number")}
              {renderInput("Blockchain URL for Backend", "blockchainUrlForBacked", "text")}
              {renderInput("Blockchain URL for Bridge", "blockchainUrlForBridge", "text")}
              {renderInput("Polkadot Public Key", "polkadotPublicKey", "text")}
              {renderInput("Contract Address (ETH)", "mainAccountEth", "text")}
              {renderInput("Public Key (ETH)", "publicKeyEth", "text")}
              {renderInput("Strip Secret Key", "stripeSecretKey", "text")}
            </div>
            <div className="d-flex justify-content-center mt-3">
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfigurationPage;