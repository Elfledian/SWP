

import React, { useEffect, useState } from "react";
import BookingDetails from "./BookingDetails"; // Assuming BookingDetails is also redesigned for Ant Design
import { Card, List, Space, Button, Collapse, message, Popconfirm } from "antd";
import QRCode from "qrcode.react"; // Import QRCode from qrcode.react
import { Link } from "react-router-dom";
import api from "../../config/axios";
import moment from "moment";

const BookingHistory = (props) => {
  const isLoggedIn = localStorage.getItem("token")
  const [showBookingDetail, updateShowBookingDetail] = useState(false);
  const today = moment();

  const isPastBooking = moment(props.bookingCreateTime).isBefore(today);

  console.log(props.transactionStatus)

  const displayDetail = () => {
    showBookingDetail == false
      ? updateShowBookingDetail(true)
      : updateShowBookingDetail(false);
  };

  const hideDetail = () => {
    updateShowBookingDetail(false);
  };


  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await api.get(
          `/transactions/${props.orderID}`
        );
        setTransactionData(response.data);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };
    fetchTransactionData();
  }, [])


  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await api.delete(`/booking/${bookingId}`);
      console.log(res);
      message.success("Booking cancelled successfully!");
      // Refresh booking data (without full page reload)
      props.reFetch()
    } catch (error) {
      message.error("An unknown error occurred, please try again.");
      console.error(error);
    }
  }

  const qrCodeValue = JSON.stringify({ bookingId: props.orderID });

  return (
    <>
      {isLoggedIn ? (
        <div>
          <Card
            bordered={false}
            style={{
              margin: "16px 24px",
              padding: "16px",
              backgroundColor: "#f5f5f5", // Light grey background
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={[props]} // Assuming data is passed as a single object
              renderItem={(booking) => (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={displayDetail}>
                      Details
                    </Button>,
                    booking.status === "COMPLETED" && (
                      <Link to={`/feedback/${props.orderID}`}>
                        <Button type="primary">
                          Feedback
                        </Button>
                      </Link>
                    ),
                    booking.status === "COMPLETED" || booking.status === "DEPOSITED" ? (
                      <Link to={`/UpdateForCustomer/${booking.orderID}/${props.clubId}`}>
                        <Button type="primary" disabled={isPastBooking} >
                          Update Booking
                        </Button>
                      </Link>
                    ) : null,

                    // booking.status === "COMPLETED" || booking.status === "PENDING" ? (
                    //   <Popconfirm title="You will not get refund if you cancel. Confirm?" disabled={isPastBooking} onConfirm={() => handleCancelBooking(booking.orderID)}>
                    //     <Button type="primary" danger disabled={isPastBooking}>
                    //       Cancel Booking
                    //     </Button>
                    //   </Popconfirm>
                    // ) : null,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<div className="status-badge">{booking.status}</div>}
                    title={`Order ID: ${booking.orderID}`}
                    description={
                      <Space direction="vertical">
                        <p>
                          Club: {booking.club} - {booking.address}
                        </p>
                        <p>
                          Booking Create Time:{" "}
                          {new Date(booking.bookingCreateTime).toLocaleDateString(
                            "en-GB",
                            { year: "numeric", month: "2-digit", day: "2-digit" }
                          )}
                        </p>
                        {/* Display QR Code */}
                        <div style={{ textAlign: "left" }}>
                          <QRCode value={qrCodeValue} />
                        </div>
                      </Space>
                    }
                  />
                  {/* {showBookingDetail && renderBookingDetails()} */}
                </List.Item>
              )}
            />
            {showBookingDetail && (
              <div
                className={`alert ${props.showDetail ? "" : "hidden"}`}
                role="alert"
              >
                <BookingDetails
                  showDetail={showBookingDetail}
                  showId={props.orderID}
                // hideDetail={hideDetail}
                ></BookingDetails>
              </div>
            )}
          </Card>
        </div>
      ) : (
        navigate('/')
      )}
    </>
  );
};

export default BookingHistory;
