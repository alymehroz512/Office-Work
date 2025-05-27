import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPolkadotTransactions,
  fetchEthereumAddress,
  fetchSinglePolkadotTransaction,
} from "../features/bridge/bridgeSlice";
import moment from "moment";
import { FaRegCopy } from "react-icons/fa";
import PolkadotImg from "../images/polkadot.png";
import EthereumImg from "../images/ethereum.png";
import "../index.css";

const Bridge = () => {
  const dispatch = useDispatch();
  const { polkadot, ethereum, singleTransaction, errorSingleTransaction } =
    useSelector((state) => state.bridge);

  const [detailMode, setDetailMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  useEffect(() => {
    setIsAddressLoading(true);
    dispatch(
      fetchPolkadotTransactions({
        page: currentPage,
        pageSize: recordsPerPage,
        search: searchTerm,
      })
    ).finally(() => {
      setIsTableLoading(false);
      setIsAddressLoading(false);
    });
    dispatch(fetchEthereumAddress()).finally(() => {
      setIsAddressLoading(false);
    });
  }, [dispatch, currentPage, recordsPerPage, searchTerm]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "0";
    notification.style.left = "0";
    notification.textContent = text.includes("0x")
      ? "Ethereum Address copied to clipboard!"
      : "Polkadot Address copied to clipboard!";
    notification.style.width = "100%";
    notification.style.backgroundColor = "green";
    notification.style.color = "#fff";
    notification.style.textAlign = "center";
    notification.style.padding = "10px";
    notification.style.fontWeight = "bold";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
  };

  const handleDetailClick = (id) => {
    setDetailMode(true);
    setIsDetailLoading(true);
    setIsAddressLoading(true);
    dispatch(fetchSinglePolkadotTransaction(id)).finally(() => {
      setIsDetailLoading(false);
      setIsAddressLoading(false);
    });
  };

  const handleBackClick = () => {
    setDetailMode(false);
    setIsTableLoading(true);
    setIsAddressLoading(true);
    dispatch(
      fetchPolkadotTransactions({
        page: currentPage,
        pageSize: recordsPerPage,
        search: searchTerm,
      })
    ).finally(() => {
      setIsTableLoading(false);
      setIsAddressLoading(false);
    });
  };

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 12)}...${address.slice(-12)}` : "N/A";
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const renderSkeletonCard = () => (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <div
            className="skeleton-line mb-4 mt-3"
            style={{ width: "60%", height: "24px", margin: "0 auto" }}
          ></div>
          <div
            className="skeleton-line mb-0"
            style={{ width: "80%", height: "20px" }}
          ></div>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
          <div
            className="skeleton-line"
            style={{ width: "40%", height: "20px" }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: "20%", height: "30px" }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderSkeletonTable = () => (
    <table className="table table-responsive table-bordered table-striped text-center align-middle small">
      <thead>
        <tr>
          <th>Date</th>
          <th>Sender Key</th>
          <th>Receiver Key</th>
          <th>Amount</th>
          <th>Transaction Type</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(10)].map((_, index) => (
          <tr key={index}>
            <td>
              <div
                className="skeleton-line"
                style={{ width: "80%", margin: "0 auto" }}
              ></div>
            </td>
            <td>
              <div
                className="skeleton-line"
                style={{ width: "80%", margin: "0 auto" }}
              ></div>
            </td>
            <td>
              <div
                className="skeleton-line"
                style={{ width: "80%", margin: "0 auto" }}
              ></div>
            </td>
            <td>
              <div
                className="skeleton-line"
                style={{ width: "60%", margin: "0 auto" }}
              ></div>
            </td>
            <td>
              <div
                className="skeleton-line"
                style={{ width: "60%", margin: "0 auto" }}
              ></div>
            </td>
            <td>
              <div
                className="skeleton-line"
                style={{ width: "50%", margin: "0 auto", height: "30px" }}
              ></div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSkeletonDetailCard = () => (
    <div className="card mb-2 p-5 shadow-sm">
      <div className="card-body d-flex">
        <div className="w-25 d-flex justify-content-center align-items-center border-end pe-3">
          <div
            className="skeleton-line"
            style={{ width: "80px", height: "34px" }}
          ></div>
        </div>
        <div className="w-100 ps-3">
          <div
            className="skeleton-line mb-4"
            style={{ width: "60%", height: "24px" }}
          ></div>
          <hr className="mb-5" />
          {[...Array(8)].map((_, index) => (
            <div key={index}>
              <div
                className="skeleton-line mb-3"
                style={{ width: "80%", height: "20px" }}
              ></div>
              <hr />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactionDetailCard = (tx) => (
    <div className="card mb-2 p-5 shadow-sm" key={tx._id}>
      <div className="card-body d-flex">
        <div className="w-25 d-flex justify-content-center align-items-center border-end pe-3">
          {tx.network === "Ethereum" ? (
            <div className="d-flex align-items-center justify-content-center">
              <img
                src={EthereumImg}
                alt="Ethereum"
                style={{ width: "34px", marginRight: "8px" }}
              />
              <i className="bi bi-arrow-right"></i>
              <img
                src={EthereumImg}
                alt="Ethereum"
                style={{ width: "34px", marginLeft: "8px" }}
              />
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center">
              <img
                src={PolkadotImg}
                alt="Polkadot"
                style={{ width: "34px", marginRight: "8px" }}
              />
              <i className="bi bi-arrow-right"></i>
              <img
                src={PolkadotImg}
                alt="Polkadot"
                style={{ width: "34px", marginLeft: "8px" }}
              />
            </div>
          )}
        </div>
        <div className="w-100 ps-3">
          <h5 className="card-title mb-4 text-primary">
            Transaction Details of {tx.network} to {tx.network}
          </h5>
          <hr className="mb-5" />
          <p className="card-text">
            <strong>Sender:</strong> {formatAddress(tx.sender)}
          </p>
          <hr />
          <p className="card-text">
            <strong>Receiver:</strong> {formatAddress(tx.receiver)}
          </p>
          <hr />
          <p className="card-text">
            <strong>Block Number:</strong> {tx.blockNumber}
          </p>
          <hr />
          <p className="card-text">
            <strong>Block Hash:</strong> {formatAddress(tx.blockHash)}
          </p>
          <hr />
          <p className="card-text">
            <strong>Transaction Hash:</strong> {formatAddress(tx.txHash)}
          </p>
          <hr />
          <p className="card-text">
            <strong>Amount:</strong> {tx.amount}
          </p>
          <hr />
          <p className="card-text">
            <strong>Status:</strong> {tx.status}
          </p>
          <hr />
          <p className="card-text">
            <strong>Created At:</strong>{" "}
            {moment(tx.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </p>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    const totalPages = Math.ceil(polkadot.totalRecords / recordsPerPage) || 1;
    const pages = [];

    pages.push(
      <button
        key="prev"
        className="btn btn-sm btn-outline-primary mx-1 rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: "32px", height: "32px", padding: "0" }}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
        pageButtons.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pageButtons.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
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
            onClick={() => setCurrentPage(page)}
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
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
          value={recordsPerPage}
          onChange={handleRecordsPerPageChange}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
    );
  };

  return (
    <div className="container my-4">
      {!detailMode && (
        <div className="row mb-5">
          <div className="col-md-6 mb-3">
            {isAddressLoading || polkadot?.loading ? (
              renderSkeletonCard()
            ) : (
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title text-primary mb-4 mt-3 text-center">
                      Polkadot Address
                    </h5>
                    <p className="card-text mb-0">
                      <strong>
                        {formatAddress(polkadot?.address || "N/A")}
                      </strong>
                    </p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                    <p className="mb-0">
                      <strong>Balance:</strong>{" "}
                      {polkadot?.balance
                        ? polkadot.balance.toFixed(4)
                        : "0.0000"}{" "}
                      HIVE
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => copyToClipboard(polkadot?.address)}
                    >
                      <FaRegCopy className="me-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            {isAddressLoading || ethereum?.loading ? (
              renderSkeletonCard()
            ) : (
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title text-primary mb-4 mt-3 text-center">
                      Ethereum Address
                    </h5>
                    <p className="card-text mb-0">
                      <strong>
                        {formatAddress(ethereum?.address || "N/A")}
                      </strong>
                    </p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                    <p className="mb-0">
                      <strong>Balance:</strong>{" "}
                      {ethereum?.balance
                        ? ethereum.balance.toFixed(4)
                        : "0.0000"}{" "}
                      HIVE
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => copyToClipboard(ethereum?.address)}
                    >
                      <FaRegCopy className="me-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!detailMode ? (
        <>
          <h4 className="mb-3 text-center mb-2 text-primary">Transactions</h4>
          <div className="d-flex justify-content-center align-items-center mb-3">
            <div className="position-relative w-100">
              <input
                type="text"
                className="form-control bg-white pe-5"
                style={{ color: "#000" }}
                placeholder="Search by sender key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          {isTableLoading || polkadot?.loading ? (
            <>
              {renderSkeletonTable()}
              {renderPagination()}
            </>
          ) : polkadot?.error ? (
            <div className="text-danger">Error: {polkadot.error}</div>
          ) : (
            <>
              <table className="table table-responsive table-bordered table-striped text-center align-middle small">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sender Key</th>
                    <th>Receiver Key</th>
                    <th>Amount</th>
                    <th>Transaction Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {polkadot?.transactions?.length > 0 ? (
                    polkadot.transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td>{moment(tx.CreatedAt).format("DD-MM-YYYY")}</td>
                        <td>{formatAddress(tx.senderKey)}</td>
                        <td>{formatAddress(tx.receiverKey)}</td>
                        <td>{String(Math.floor(tx.amount / 1e10))[0]}</td>
                        <td>
                          {tx.transactionType === "ETH" ? (
                            <div className="d-flex align-items-center justify-content-center">
                              <img
                                src={EthereumImg}
                                alt="Ethereum"
                                style={{ width: "24px", marginRight: "8px" }}
                              />
                              <i className="bi bi-arrow-right"></i>
                              <img
                                src={PolkadotImg}
                                alt="Polkadot"
                                style={{ width: "24px", marginLeft: "8px" }}
                              />
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center">
                              <img
                                src={PolkadotImg}
                                alt="Polkadot"
                                style={{ width: "24px", marginRight: "8px" }}
                              />
                              <i className="bi bi-arrow-right"></i>
                              <img
                                src={EthereumImg}
                                alt="Ethereum"
                                style={{ width: "24px", marginLeft: "8px" }}
                              />
                            </div>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDetailClick(tx._id)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {renderPagination()}
            </>
          )}
        </>
      ) : (
        <>
          <button className="btn btn-primary mb-3" onClick={handleBackClick}>
            <i className="fas fa-chevron-left me-2"></i>Back
          </button>
          {isDetailLoading ? (
            renderSkeletonDetailCard()
          ) : errorSingleTransaction ? (
            <div className="text-danger">Error: {errorSingleTransaction}</div>
          ) : Array.isArray(singleTransaction) &&
            singleTransaction.length > 0 ? (
            singleTransaction.map((tx) => renderTransactionDetailCard(tx))
          ) : (
            <div className="text-danger">No transaction details found.</div>
          )}
        </>
      )}
    </div>
  );
};

export default Bridge;
