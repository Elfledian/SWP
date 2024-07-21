

import React, { useEffect, useState } from "react";
import BookingDetails from "./BookingDetails"; // Assuming BookingDetails is also redesigned for Ant Design
import { Card, List, Space, Button, Collapse, message, Popconfirm, Modal } from "antd";
import QRCode from "qrcode.react"; // Import QRCode from qrcode.react
import { Link } from "react-router-dom";
import api from "../../config/axios";
import moment from "moment";

const BookingHistory = (props) => {
  const isLoggedIn = localStorage.getItem("token")
  const [showBookingDetail, updateShowBookingDetail] = useState(false);
  const today = moment();
  const [bookingDetail, setBookingDetail] = useState([]);
  const [allCheckedIn, setAllCheckedIn] = useState(false);

  const isPastBooking = moment(props.bookingCreateTime).isBefore(today);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false)


  const showCancelModal = () => {
    setCancelModalVisible(true);
  };

  const showCheckoutModal = () => {
    setCheckoutVisible(true);
  }

  const displayDetail = () => {
    showBookingDetail == false
      ? updateShowBookingDetail(true)
      : updateShowBookingDetail(false);
  };

  const hideDetail = () => {
    updateShowBookingDetail(false);
  };


  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const response = await api.get(`/bookingDetail/${props.orderID}`);
        setBookingDetail(response.data);
        console.log(response.data)

        // Check if all booking details are checked in
        const allCheckedIn = response.data.every(detail => detail.status === 'CHECKEDIN');
        setAllCheckedIn(allCheckedIn);
      } catch (error) {
        console.error('Failed to fetch booking detail:', error);
      }
    };

    fetchBookingDetail();
  }, [props.orderID]);




  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await api.delete(`/booking/${bookingId}`);
      console.log(res);
      message.success("Booking canceled successfully!");
      // Refresh booking data 
      props.reFetch()
      setCancelModalVisible(false);
    } catch (error) {
      message.error("An unknown error occurred, please try again.");
      console.error(error);
    }
  }

  const handlePayament = async (bookingId) => {
    try {
      const paymentResponse = await api.post(`/transactions/booking-with-wallet/${bookingId}`)
      console.log(paymentResponse.data)
      if (paymentResponse) {
        message.success("Booking success!")
        props.reFetch()
        setCheckoutVisible(false);
        // setTimeout(() => {
        //   navigate('/');
        // }, 1000);
      }
    } catch (error) {
      message.error("An unknown error occurred. Please try again later.")
      setError(error.message);
    }
  }

  const handleCancelModalClose = () => {
    setCancelModalVisible(false);
  };

  const handleCheckoutModalClose = () => {
    setCheckoutVisible(false);
  };


  const cancelModalContent = (
    <div>
      {props.status === "PENDING" ? (
        <p>Please confirm. Do you really want to cancel this booking?</p>
      ) : (
        <p>Please confirm: You will receive a refund amount of the booking fee if you cancel. Is this correct?</p>
      )}
    </div>
  );


  const checkoutModalContent = (
    <div>
      <p>Are you sure to check out this booking?</p>
    </div>
  );
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
              backgroundColor: "#f5f5f5",
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={[props]}
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

                    !allCheckedIn && (
                      booking.status === "COMPLETED" || booking.status === "DEPOSITED" ? (
                        <Link to={`/UpdateForCustomer/${booking.orderID}/${props.clubId}`}>
                          <Button type="primary" >
                            Update Booking
                          </Button>
                        </Link>
                      ) : null
                    )
                    ,

                    booking.status === "PENDING" ? (

                      <Button type="primary" onClick={showCheckoutModal} >
                        Checkout
                      </Button>

                    ) : null,

                    !allCheckedIn && (
                      booking.status === "COMPLETED" || booking.status === "PENDING" ? (

                        <Button type="primary" danger onClick={showCancelModal} disabled={isPastBooking}>
                          Cancel Booking
                        </Button>

                      ) : null

                    ), <Modal
                      title="Cancel Booking"
                      visible={cancelModalVisible}
                      onOk={() => handleCancelBooking(booking.orderID)}
                      onCancel={handleCancelModalClose}
                      okText="Confirm"
                      cancelText="Cancel"
                    >
                      {cancelModalContent}
                    </Modal>
                    ,
                    <Modal
                      title="Checkout"
                      visible={checkoutVisible}
                      onOk={() => handlePayament(booking.orderID)}
                      onCancel={handleCheckoutModalClose}
                      okText="Confirm"
                      cancelText="Cancel"
                    >
                      {checkoutModalContent}
                    </Modal>
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

