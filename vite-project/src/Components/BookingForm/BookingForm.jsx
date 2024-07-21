
import React, { createContext, useContext, useEffect, useState } from "react";
import { Form, DatePicker, Button, message, Select, InputNumber, Flex } from "antd";
import moment from "moment";
import { Option } from "antd/es/mentions";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import api from "../../config/axios";
import BookingType1 from "./BookingType1";
import BookingType2 from "./BookingType2";
import BookingType3 from "./BookingType3";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGetParams from './../../assets/hooks/useGetParams';
import TransactionSuccess from "../Payment/TransactionSuccess";
import Transaction from "../Payment/Transaction";
import { connect } from 'react-redux';
import SearchNavBar from "../layout/SearchNavBar";
const BookingForm = ({ children }) => {
  const isLoggedIn = localStorage.getItem("token")
  const navigate = useNavigate();
  const handleSetId = (id) => {
    props.setId(id); // Dispatch an action to update state
  };
  const param = useGetParams();
  const { id } = useParams();
  console.log(id);

  const [bookingType, setBookingType] = useState(null);
  const [bookingId, setBookingId] = useState();
  const [courtId, setCourtID] = useState();
  const [bookingConfirm, setBookingConfirm] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [totalPrice, setTotalPrice] = useState("");
  const [bookId, setBookId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [parentId, setParentId] = useState(null);
  const [bookingDetailRequestCombos, setBookingDetailRequestCombos] = useState(
    []
  );
  console.log(bookingDetailRequestCombos);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false)
  const [days, setDays] = useState(0);
  const userRole = localStorage.getItem("userRole");
  const isEnoughDay = (value) => {
    setDays(value);
  };


  //post api, create booking
  const bookingDetailRequest = (items) => {
    console.log(items);
    setBookingDetailRequestCombos(items);
  };


  useEffect(() => {
    if (userRole === "CLUB_OWNER") {
      navigate('/error404');
    }
    else if (userRole === "ADMIN"){
      navigate('/adminDashboard')
    }
  }, [userRole, navigate]);

  const onFinish = async (values) => {
    if (bookingType === 3 && days != bookingDetailRequestCombos.length) {
      message.error("Not Booking enough slots");
      return;
    }
    try {
      const response = await api.post("/booking/bookingCombo", {
        club_id: +id,
        booking_type_id: values.booking_type_id,
        bookingDetailRequestCombos: bookingDetailRequestCombos,
      });
      console.log(response)

      const bId = response.data.bookingResponse.id
      setBookId(bId)
      setBookingDate(response.data.bookingResponse.bookingDate)
      const res = await api.get(`/transactions/price/${bId}`)
      setTotalPrice(res.data.totalPriceNeedToPay)
      console.log(res.data.totalPriceNeedToPay)
      localStorage.setItem("totalPrice", res.data.totalPriceNeedToPay)
      setBookingConfirm(res.data)
      console.log(res.data)

      form.setFields([
        { name: "name", readonly: true },
        { name: "booking_type_id", readonly: true },
        { name: "submitButton", readonly: true }

      ]);
      setIsBookingConfirmed(true);
      console.log("Booking created:", response.data);
      message.success("Booking confirmed!");
    } catch (error) {
      // Handle error here
      console.error("Error creating booking:", error);
      message.error("Booking failed. Please try again.");
    }
  };

  //call for court name
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await api.get(`/court/${id}`);

        console.log(response.data);
        setCourts(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchCourts();
  }, []);

  const handlePayament = async () => {


      try {
        const paymentResponse = await api.post(`/transactions/booking-with-wallet/${bookId}`)
        console.log(paymentResponse.data)
        if(paymentResponse){
          message.success("Booking success!")
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      } catch (error) {
        navigate("/profile")
        message.error("An unknown error occurred. Check your balance and try again later.")
        setError(error.message);
      }
  }

  return (
    <>

      <div>
        <SearchNavBar />
        <div style={{ display: "flex", flexDirection: "row", gap: "20px", justifyContent: "center" }}>


          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 100 }}>
            {" "}
            <div
              style={{
                width: "511px",
                padding: 20,
                backgroundColor: "#fff",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            >
              {isLoggedIn ? (
                <Form
                  form={form}
                  name="bookingForm"
                  layout="vertical"
                  onFinish={onFinish}
                >

                  <Form.Item
                    name="name"
                    label="Court Name"
                    rules={[
                      { required: true, message: "Please select the court name!" },
                    ]}
                  >
                    <Select
                      placeholder="Select a Court Name"
                      onChange={(key) => setCourtID(key)}
                    >
                      {courts.map((court) => (
                        <Option key={court.id} value={court.id}>
                          {court.courtName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="booking_type_id"
                    label="Booking Type"
                    rules={[
                      { required: true, message: "Please select the booking type!" },
                    ]}
                  >
                    <Select onChange={(value) => setBookingType(value)}>
                      <Option value={1}>Booking by date</Option>
                      <Option value={2}>Fixed Schedule</Option>
                      <Option value={3}>Flexible Schedule</Option>
                    </Select>
                  </Form.Item>

                  {bookingType === 1 && (
                    <BookingType1
                      courtId={courtId}
                      bookingDetail={bookingDetailRequest}
                    ></BookingType1>
                  )}
                  {bookingType === 2 && (
                    <BookingType2
                      courtId={courtId}
                      bookingDetail={bookingDetailRequest}
                    ></BookingType2>
                  )}
                  {bookingType === 3 && (
                    <BookingType3
                      courtId={courtId}
                      bookingDetail={bookingDetailRequest}
                      isEnoughDay={isEnoughDay}
                    ></BookingType3>
                  )}

                  <Form.Item
                    name="submitButton"
                  >
                    <Button type="primary" htmlType="submit" disabled={isBookingConfirmed}>
                      Confirm Booking
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                navigate("/login")

              )}
            </div>
          </div>



          {/* Right form */}
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 100 }}>
            {" "}
            <div
              style={{
                width: "511px",
                padding: 20,
                backgroundColor: "#fff",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            >
              <Form
                form={form2}
                name="bookingForm"
                layout="vertical"
                onFinish={handlePayament}
              >
                <div>
                  <h3>Booking summary</h3>
                  <p>Price: {bookingConfirm?.fullPrice}</p>
                  <p>Discount: {bookingConfirm?.salePrice}</p>
                  <p>Total: {bookingConfirm?.totalPriceNeedToPay}</p>
                </div>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Checkout
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default BookingForm;

