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

  const SuccessNotification = () => {
    useEffect(() => {
      const notification = document.createElement("div");
      notification.style.position = "fixed";
      notification.style.top = "0";
      notification.style.left = "0";
      notification.style.width = "100%";
      notification.style.backgroundColor = "green";
      notification.style.color = "#fff";
      notification.style.textAlign = "center";
      notification.style.padding = "10px";
      notification.style.fontWeight = "bold";
      notification.style.zIndex = "1000";
      notification.textContent = successMessage;
      document.body.appendChild(notification);

      const timer = setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        dispatch(clearMessages());
      }, 4000);

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
      const notification = document.createElement("div");
      notification.style.position = "fixed";
      notification.style.top = "0";
      notification.style.left = "0";
      notification.style.width = "100%";
      notification.style.backgroundColor = "red";
      notification.style.color = "#fff";
      notification.style.textAlign = "center";
      notification.style.padding = "10px";
      notification.style.fontWeight = "bold";
      notification.style.zIndex = "1000";
      notification.textContent = error;
      document.body.appendChild(notification);

      const timer = setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        dispatch(clearMessages());
      }, 4000);

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

      const notification = document.createElement("div");
      notification.style.position = "fixed";
      notification.style.top = "0";
      notification.style.left = "0";
      notification.style.width = "100%";
      notification.style.backgroundColor = "green";
      notification.style.color = "#fff";
      notification.style.textAlign = "center";
      notification.style.padding = "10px";
      notification.style.fontWeight = "bold";
      notification.style.zIndex = "1000";
      notification.textContent = inputChangeMessage;
      document.body.appendChild(notification);

      const timer = setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        setInputChangeMessage("");
      }, 4000);

      return () => {
        clearTimeout(timer);
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      };
    }, []);

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