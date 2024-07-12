import React, { useContext, useEffect, useState } from "react";
import {
  Form,
  DatePicker,
  Button,
  message,
  Select,
  Radio,
  List,
  Input
} from "antd";
import moment from "moment";
import { Option } from "antd/es/mentions";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import api from "../../config/axios";
import { Link, useParams } from "react-router-dom";

const StaffBookingForm = ({ id }) => {
  //const { id } = useParams();
  console.log(id);

  const [courtId, setCourtID] = useState();
  const [sum, setSum] = useState(0);
  const [bookingDetailRequestCombos, setBookingDetailRequestCombos] = useState(
    []
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [courtTimeSlots, setCourtTimeSlots] = useState([]);
    // Validate date
    const disabledDate = (current) => {
      const today = moment().startOf("day");
      const maxDate = moment().add(30, "days").endOf("day");
      return current && (current < today || current > maxDate);
    };

  console.log(bookingDetailRequestCombos);
  const [form] = Form.useForm();

  // Function to reset the form and state variables
  const resetForm = () => {
    form.resetFields();
    setCourtID(null);
    setSum(0);
    setBookingDetailRequestCombos([]);
    setSelectedDate(null);
    setAvailableTimes([]);
    setSelectedSchedule([]);
    setCourtTimeSlots([]);
  };

  //post api, create booking
  const onFinish = async (values) => {
    try {
      // Make the POST request
      console.log("check");
      console.log(bookingDetailRequestCombos);
      const response = await api.post("/booking/bookingForStaff", {
        club_id: +id,
        booking_type_id: 3,
        email: values.email, // Include the email in the request body
        bookingDetailRequestCombos: bookingDetailRequestCombos,
      });
      // Handle response here
      console.log("Booking created:", response.data);
      message.success("Booking successful!");
      resetForm(); // Reset form after successful booking
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
    //GET Court
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

  //GET Summary
  const fetchSum = async () => {
    try {
      const sumResponse = await api.get(
        `/transactions/predictedPrice/${id}/3/${bookingDetailRequestCombos.length}`
      );

      console.log(sumResponse.data);
      setSum(sumResponse.data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (bookingDetailRequestCombos.length > 0) {
      fetchSum();
    } else {
      setSum(0);
    }
  }, [bookingDetailRequestCombos]);

  const handleDateChange = async (date) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
    await fetchCourtTimeSlots(date.format("YYYY-MM-DD"));
  };

  //GET Court Time Slot
  const fetchCourtTimeSlots = async (date) => {
    try {
      const response = await api.get(`/courtTimeSlot/${courtId}/${date}`);
      const slotFilter = response.data;
      setCourtTimeSlots(response.data);
      console.log(response.data);
      // setAvailableTimes(
      //   slotFilter.filter((item) => item.status == "AVAILABLE")
      // );
      // console.log(slotFilter.filter((item) => item.status == "AVAILABLE"));
      const today = moment().format("YYYY-MM-DD");
      const now = moment();
      const twoHoursLater = now.clone().add(2, "hours");

      const filteredSlots = slotFilter.filter((item) => {
        if (date === today) {
          const startTime = moment(item.start_time, "HH:mm");
          return (
            item.status === "AVAILABLE" &&
            startTime.isBetween(now, twoHoursLater, null, "[]")
          );
        }
        return item.status === "AVAILABLE";
      });

      setAvailableTimes(filteredSlots);
      console.log(filteredSlots);

    } catch (error) {
      setError(error.message);
    }
  };

  // Check duplicate for date && Prepare + Check duplicate bookingDetailRequestCombos
  const handleAddToSchedule = (id, startTime, endTime) => {
    const newEntry = { id, date: selectedDate, startTime, endTime };
    const bookingTypeDetail = {
      courtTSId: id, // Update with correct value if available
      bookingDate: selectedDate,
      durationInMonths: 0, // Update with correct value if available
      dayOfWeek: null, // Update with correct value if available
    };

    const isDateDuplicate = selectedSchedule.some(
      (entry) =>
        entry.id === newEntry.id &&
        entry.date === newEntry.date &&
        entry.startTime === newEntry.startTime &&
        entry.endTime === newEntry.endTime
    );
    const isBookingDuplicate = bookingDetailRequestCombos.some(
      (entry) =>
        entry.courtTSId === bookingTypeDetail.courtTSId &&
        entry.bookingDate === bookingTypeDetail.bookingDate
    );

    if (isDateDuplicate) {
      message.warning("This schedule is already added");
    } else {
      setSelectedSchedule([...selectedSchedule, newEntry]);
      message.success(
        `Added ${newEntry.date} at ${newEntry.startTime} - ${newEntry.endTime} to schedule`
      );
    }
    if (!isBookingDuplicate) {
      setBookingDetailRequestCombos([
        ...bookingDetailRequestCombos,
        bookingTypeDetail,
      ]);
    }
  };

  const handleDeleteFromSchedule = (index) => {
    const newSchedule = [...selectedSchedule];
    newSchedule.splice(index, 1);
    setSelectedSchedule(newSchedule);

    const selectedBooking = [...bookingDetailRequestCombos];
    selectedBooking.splice(index, 1);
    setBookingDetailRequestCombos(selectedBooking);

    message.success("Schedule entry deleted");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* <NavBar /> */}
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: 100, marginBottom: 100 }}
      >
        {" "}
        {/* Added margin-top for space */}
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
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: 'email', message: "Please enter a valid email!" }
              ]}
            >
              <Input placeholder="Enter customer's email" />
            </Form.Item>

            <div name="bookingType3Form" layout="vertical">
              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    label="Select Booking Date"
                    name="bookingDate"
                    rules={[
                      {
                        required: true,
                        message: "Please select the date you want to book!",
                      },
                    ]}
                  >
                    <DatePicker onChange={handleDateChange} disabledDate={disabledDate}/>
                  </Form.Item>
                </div>
              </div>
              <Form.Item
                name="time"
                label="Available Times"
              >
                <Radio.Group>
                  {availableTimes.map((item, index) => (
                    <Radio.Button
                      key={index}
                      value={item.courtTimeSlotId}
                      onClick={() =>
                        handleAddToSchedule(
                          item.courtTimeSlotId,
                          item.start_time,
                          item.end_time
                        )
                      }
                    >
                      {item.start_time} - {item.end_time}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Selected Schedule">
                <List
                  bordered
                  dataSource={selectedSchedule}
                  renderItem={(item, index) => (
                    <List.Item>
                      <div>
                        {index + 1}. {item.date} at {item.startTime} -{" "}
                        {item.endTime}
                        <Button
                          type="link"
                          onClick={() => handleDeleteFromSchedule(index)}
                        >
                          Delete
                        </Button>
                      </div>
                    </List.Item>
                  )}
                />
              </Form.Item>
            </div>

            <Form.Item style={{ textAlign: "center" }}>
              <Button type="link">
                Total: {sum ? `${sum.moneyback}₫` : '0₫'}
              </Button>
              <br></br>
              <Button type="primary" htmlType="submit">
                Confirm Booking
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default StaffBookingForm;