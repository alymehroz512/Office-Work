import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../features/dashboard/dashboardSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, token]);

  // Format error message based on error type
  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return JSON.stringify(error);
  };

  // If there's an error, show only the error message
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center" role="alert" aria-live="polite">
          {getErrorMessage(error)}
        </div>
      </div>
    );
  }

  // Format card value based on type
  const formatCardValue = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '0';
    if (typeof value === 'string' && !Number.isFinite(parseFloat(value))) return '0';
    return value.toString();
  };

  // Define card items with their respective values
  const cardItems = [
    { title: 'Total Users', value: stats ? formatCardValue(stats.totalUsers) : '' },
    { title: 'Wallet Count', value: stats ? formatCardValue(stats.wallet_count) : '' },
    { title: 'Medications Count', value: stats ? formatCardValue(stats.medications_count) : '' },
    { title: 'Genes Count', value: stats ? formatCardValue(stats.genes_count) : '' },
    { title: 'Users Without Wallet', value: stats ? formatCardValue(stats.not_have_wallet_counts) : '' },
  ];

  return (
    <div className="container mt-4">
      <div className="row">
        {cardItems.map((item, index) => (
          <div 
            className="col-12 col-md-6 col-lg-4 mb-4" 
            key={index}
            data-testid="card-container"
          >
            <div 
              className="card text-center shadow-sm p-4" 
              data-testid="dashboard-card"
              aria-busy={loading ? 'true' : 'false'}
            >
              <div className="card-body">
                {loading ? (
                  <div className="skeleton-loading">
                    <div className="skeleton-line" style={{ height: '24px', width: '80%', margin: '0 auto' }}></div>
                    <div className="mt-4">
                      <div 
                        className="spinner-border text-primary" 
                        role="status"
                        aria-label={`Loading ${item.title} data...`}
                      >
                        <span className="visually-hidden">Loading {item.title} data...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h5 
                      className="card-title text-primary"
                      data-testid="card-title"
                    >
                      {item.title}
                    </h5>
                    <h4 className="card-text fw-light mt-4">
                      <span 
                        data-testid="card-value" 
                        aria-label={`${item.title}: ${item.value}`}
                      >
                        {item.value}
                      </span>
                    </h4>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;