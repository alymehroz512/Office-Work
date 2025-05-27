import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicationStatus } from '../features/applicationStatus/applicationStatusSlice';
import '../index.css';

const ApplicationStatusPage = () => {
  const dispatch = useDispatch();
  const { statusData, loading, error } = useSelector((state) => state.applicationStatus);

  // Polling interval (5 minutes = 300,000 milliseconds)
  const POLLING_INTERVAL = 300000;

  // Statuses configuration
  const statuses = {
    honeyBackend: {
      displayName: 'Hivve Backend',
      icon: 'server',
      timestampKey: 'backend_honey',
    },
    bridgeBackend: {
      displayName: 'Bridge Backend',
      icon: 'network-wired',
      timestampKey: 'bridge_backend',
    },
    bridgeFrontend: {
      displayName: 'Bridge Frontend',
      icon: 'desktop',
      timestampKey: 'frontend_honey',
    },
  };

  useEffect(() => {
    // Initial fetch
    dispatch(fetchApplicationStatus());

    // Set up polling
    const intervalId = setInterval(() => {
      dispatch(fetchApplicationStatus());
    }, POLLING_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Check if timestamp is within the last 5 minutes
  const isWithinLastFiveMinutes = (timestamp) => {
    if (!timestamp) return false;
    const now = Date.now();
    const time = parseInt(timestamp, 10);
    const diffInMs = now - time;
    const diffInMinutes = diffInMs / 1000 / 60;
    return diffInMinutes <= 5;
  };

  // Determine status label
  const getStatusLabel = (timestamp) => {
    const isRecent = isWithinLastFiveMinutes(timestamp);
    return `${isRecent ? 'Working (Recent)' : 'Not Working'}`; // or Inactive
  };

  // Get status icon based on label
  const getStatusIcon = (label) => {
    const isWorking = label.includes('Working (Recent)');
    return isWorking ? (
      <i className="fa-solid fa-check-circle me-2" style={{ color: 'white' }}></i>
    ) : (
      <i className="fa-solid fa-times-circle me-2" style={{ color: 'white' }}></i>
    );
  };

  // Render a status card
  const renderCard = ({ displayName, timestampKey, icon }) => {
    const timestamp = statusData?.[timestampKey];
    const label = getStatusLabel(timestamp, displayName);
    const statusIcon = getStatusIcon(label);
    const isWorking = label.includes('Working (Recent)');
    const cardStyle = {
      background: loading
        ? '#ffffff'
        : isWorking
        ? 'linear-gradient(to right, #28a745, #34d058)'
        : 'linear-gradient(to right, #dc3545, #ff6b6b)',
    };

    return (
      <div className="col-md-4 mb-4" key={displayName}>
        <div
          className="card shadow h-100 border-0 p-3 text-white"
          style={cardStyle}
          aria-busy={loading}
        >
          <div className="card-body d-flex flex-column justify-content-start align-items-start h-100">
            {loading ? (
              <>
                <div className="d-flex align-items-center">
                  <div
                    className="skeleton-line me-2"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                    }}
                  ></div>
                  <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <div
                    className="skeleton-line me-2"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                    }}
                  ></div>
                  <div className="skeleton-line" style={{ width: '100px', height: '20px' }}></div>
                </div>
              </>
            ) : (
              <>
                <h5 className="card-title d-flex align-items-center">
                  <i className={`fa-solid fa-${icon} me-2`}></i> {displayName}
                </h5>
                <p className="card-text mt-2 fs-5 d-flex align-items-center">
                  {statusIcon} {label}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      {error && <div className="alert alert-danger text-center">{error}</div>}

      <div className="row">
        {Object.values(statuses).map((config) => renderCard(config))}
      </div>
    </div>
  );
};

export default ApplicationStatusPage;