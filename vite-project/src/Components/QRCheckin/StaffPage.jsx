import React, { useState, useRef } from "react";
import QrScanner from "react-qr-scanner";
import "bootstrap/dist/css/bootstrap.min.css";
import "./QRScanner.css";
import axios from "axios";
import api from "../../config/axios";
import BookingHistory from "../BookingHistory/BookingHistory";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [scannerKey, setScannerKey] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastScannedCodeRef = useRef(null);

  const handleError = (error) => {
    console.error("QR Scanner Error:", error);
    setError("Error scanning QR code. Please try again.");
  };

  const handleScan = (result) => {
    if (result && result.text !== lastScannedCodeRef.current) {
      console.log("QR Code Scanned:", result.text);
      try {
        const data = JSON.parse(result.text);
        console.log("Parsed QR Code Data:", data);
        const bookingId = parseInt(data.bookingId, 10);

        if (!isNaN(bookingId)) {
          lastScannedCodeRef.current = result.text;
          setScanResult(bookingId);
          fetchBookingDetails(bookingId);
          fetchTransactionData(bookingId);
        } else {
          console.error("Invalid bookingId format");
          setError("Invalid bookingId format.");
        }
      } catch (error) {
        console.error("Error parsing QR code data:", error);
        setError("Error parsing QR code data.");
      }
    }
  };

  const fetchBookingDetails = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching booking details for ID: ${bookingId}`);
      const response = await api.get(`/bookingDetail/qrcheck/${bookingId}`);
      console.log("Booking Details Response:", response.data);
      setBookingDetails(response.data.length > 0 ? response.data : null);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Error fetching booking details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionData = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/transactions/${bookingId}`);
      const transaction = response.data;
      if (transaction && (transaction?.status === "DEPOSITED" || transaction?.status === "FULLY_PAID" || transaction?.status === "PERSONAL")) {
        setTransactionData(transaction);
      } else {
        setTransactionData(null);
      }
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      setError("Error fetching transaction data.");
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/transactions/${id}`, {}, {
        headers: {
          Accept: "*/*",
        },
      });
      console.log("Update Transaction Status Response:", response.data);
      setTransactionData((prevData) => ({
        ...prevData,
        status: "FULLY_PAID",
      }));
    } catch (error) {
      console.error("Error updating transaction status:", error);
      setError("Error updating transaction status.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingDetailsId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/bookingDetail/checkin/${bookingDetailsId}`, {});
      console.log("Check-In Response:", response.data);
      setBookingDetails((prevDetails) =>
        prevDetails.map((detail) =>
          detail.bookingDetailsId === bookingDetailsId
            ? { ...detail, status: "CHECKED_IN" }
            : detail
        )
      );
    } catch (error) {
      console.error("Error during check-in:", error);
      setError("Error during check-in.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Invalid Date";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredBookingDetails = Array.isArray(bookingDetails)
    ? bookingDetails.filter((detail) => formatDate(detail.bookingDate) === today)
    : [];

  const refreshScanner = () => {
    setScannerKey(Date.now());
    setScanResult("");
    setBookingDetails(null);
    setTransactionData(null);
    setError(null);
    lastScannedCodeRef.current = null;
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">Today's Booking Details</h2>
              {filteredBookingDetails?.length > 0 && (transactionData?.status === "DEPOSITED" || transactionData?.status === "FULLY_PAID" ||transactionData?.status === "PERSONAL") && (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Booking Date</th>
                        <th>Court Name</th>
                        <th>Full Name</th>
                        <th>Phone Number</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookingDetails.map((detail, index) => (
                        <tr key={index}>
                          <td>{formatDate(detail.bookingDate)}</td>
                          <td>{detail.courtName}</td>
                          <td>{detail.fullnameoforder}</td>
                          <td>{detail.phonenumber}</td>
                          <td>{detail.start_time}</td>
                          <td>{detail.end_time}</td>
                          <td>{detail?.status}</td>
                          <td>
                            {detail?.status !== "CHECKED_IN" && (
                              <button
                                className="btn btn-custom-primary"
                                onClick={() =>
                                  handleCheckIn(detail.bookingDetailsId)
                                }
                              >
                                Check-In
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">QR Scanner</h2>
              <QrScanner
                key={scannerKey}
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%", maxWidth: "100%" }}
              />
              <button
                className="btn btn-custom-secondary mt-3"
                onClick={refreshScanner}
              >
                Refresh Scanner
              </button>
              {scanResult && filteredBookingDetails.length === 0 && (
                <div className="alert alert-warning mt-3">No booking found for today</div>
              )}
              {loading && (
                <div className="loading-overlay">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              )}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
          {transactionData && (transactionData?.status === "DEPOSITED" || transactionData?.status === "FULLY_PAID" ||transactionData?.status === "PERSONAL") && (
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Transaction Details</h2>
                <form>
                  <div className="form-group">
                    <label>Transaction ID:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={transactionData.id}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={transactionData.totalAmount}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Deposit:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={transactionData.depositAmount}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Date:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatDate(transactionData.paymentDate)}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Status:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={transactionData?.status}
                      readOnly
                    />
                  </div>
                  {transactionData?.status === "DEPOSITED" && (
                    <button
                      type="button"
                      className="btn btn-custom-success"
                      onClick={() =>
                        updateTransactionStatus(transactionData.id)
                      }
                    >
                      Update Status
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
