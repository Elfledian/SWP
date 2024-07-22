import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  List,
  Modal,
  Button,
  Form,
  Select,
  DatePicker,
  message,
  Tag,
} from "antd";
import api from "../../config/axios";
import moment from "moment";
const ShowBooking = (props) => {
  const isLoggedIn = localStorage.getItem("token");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [courts, setCourts] = useState([]);
  const [courtTimeSlots, setCourtTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const today = moment();

  const showModal = async (booking) => {
    setCurrentBooking(booking);
    setIsModalVisible(true);

    try {
      const response = await api.get(`/court/${props.clubId}`);
      setCourts(response.data);
    } catch (error) {
      console.error("Failed to fetch courts:", error);
    }
  };

  // const handleOk = async () => {
  //   try {
  //     const changeSlotBookingDetailRequestCombo = {
  //       newcourtTSId: selectedTimeSlot,
  //       newbookingDate: selectedDate.format('YYYY-MM-DD')
  //     };
  //     const response = await api.put(`/bookingDetail/slot/${currentBooking.bookingDetailsId}`, changeSlotBookingDetailRequestCombo);
  //     console.log("Booking updated:", response.data); // This will log the response data
  //     message.success("Updated success!")
  //     setIsModalVisible(false);
  //     props.refreshBookings();
  //   } catch (error) {
  //     message.error("Error!")
  //     console.error("Error updating booking:", error);
  //   }
  // };

  const handleOk = async () => {
    try {
      const changeSlotBookingDetailRequestCombo = {
        newcourtTSId: selectedTimeSlot,
        newbookingDate: selectedDate.format("YYYY-MM-DD"),
      };
      const response = await api.put(
        `/bookingDetail/slot/${currentBooking.bookingDetailsId}`,
        changeSlotBookingDetailRequestCombo
      );
      console.log("Booking updated:", response.data);
      message.success("Updated success!");
      setIsModalVisible(false);
      await props.refreshBookings(props.selectedDate); // Make sure refreshBookings is awaited
      console.log("Data reloaded successfully"); // Log message after data reload
    } catch (error) {
      message.error("Error!");
      console.error("Error updating booking:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCourtChange = async (value) => {
    setSelectedCourt(value);
    if (selectedDate) {
      try {
        const response = await api.get(
          `/courtTimeSlot/${value}/${selectedDate.format("YYYY-MM-DD")}`
        );
        setCourtTimeSlots(response.data);
      } catch (error) {
        console.error("Failed to fetch court time slots:", error);
      }
    }
  };

  const handleDateChange = async (date, dateString) => {
    setSelectedDate(date);
    if (selectedCourt) {
      try {
        const response = await api.get(
          `/courtTimeSlot/${selectedCourt}/${date.format("YYYY-MM-DD")}`
        );
        setCourtTimeSlots(response.data);
      } catch (error) {
        console.error("Failed to fetch court time slots:", error);
      }
    }
  };

  const handleTimeSlotClick = (timeSlotId) => {
    setSelectedTimeSlot(timeSlotId);
  };
  console.log(props);
  // const { bookings } = props;
  // console.log(bookings);
  return (
    <>
      {isLoggedIn ? (
        <Card
          bordered={false}
          style={{
            margin: "16px 24px",
            padding: "16px",
            backgroundColor: "#f5f5f5", // Light grey background
          }}
        >
          <List
            // grid={{ gutter: 16, column: 1 }}
            itemLayout="horizontal"
            dataSource={[props]} // Use bookings array here
            renderItem={(booking) => (
              <List.Item>
                <List.Item.Meta
                  // avatar={<div className="status-badge">{booking.status}</div>}
                  title={`Booking ID: ${booking.bookingID}`}
                  description={
                    <Descriptions bordered>
                      <Descriptions.Item label="Court TS ID">
                        {booking.courtTSId}
                      </Descriptions.Item>
                      <Descriptions.Item label="Booking Date">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-GB",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          }
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Booking Details ID">
                        {booking.bookingDetailsId}
                      </Descriptions.Item>
                      <Descriptions.Item label="Court Name">
                        {booking.courtName}
                      </Descriptions.Item>

                      <Descriptions.Item label="Full Name of Customer">
                        {booking.fullnameoforder}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone Number">
                        {booking.phonenumber}
                      </Descriptions.Item>
                      <Descriptions.Item label="Start Time">
                        {booking.start_time}
                      </Descriptions.Item>
                      <Descriptions.Item label="End Time">
                        {booking.end_time}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        {booking.status}
                      </Descriptions.Item>
                    </Descriptions>
                  }
                />
                <Button
                  style={{ cursor: "pointer" }}
                  onClick={() => showModal(booking)}
                  disabled={
                    moment().isAfter(
                      moment(booking.bookingDate).endOf("day")
                    ) ||
                    (moment().isSame(moment(booking.bookingDate), "day") &&
                      moment().hour() >
                        parseInt(booking.start_time.split(":")[0]))
                  }
                  //   // moment().startOf('hour').isAfter(booking.start_time +1)
                  //   // || booking.status !== 'NOTYET'
                >
                  Update
                </Button>
              </List.Item>
            )}
          />
          <Modal
            title="Update Booking"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Form>
              <Form.Item name="ctslot_id">
                <Select
                  placeholder="Select a court"
                  onChange={handleCourtChange}
                >
                  {courts.map((court) => (
                    <Option key={court.id} value={court.id}>
                      {court.courtName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="date">
                <DatePicker
                  placeholder="Select a date"
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  disabledDate={(current) =>
                    current && current < moment().startOf("day")
                  }
                />
              </Form.Item>
              <Form.Item name="courtTimeSlotId">
                {courtTimeSlots
                  .filter((timeSlot) => timeSlot.status === "AVAILABLE")
                  .map((timeSlot) => (
                    <Tag
                      key={timeSlot.courtTimeSlotId}
                      color={
                        selectedTimeSlot === timeSlot.courtTimeSlotId
                          ? "blue"
                          : "default"
                      }
                      onClick={() =>
                        handleTimeSlotClick(timeSlot.courtTimeSlotId)
                      }
                    >
                      {timeSlot.start_time} - {timeSlot.end_time}
                    </Tag>
                  ))}
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      ) : (
        navigate("/")
      )}
    </>
  );
};

export default ShowBooking;
