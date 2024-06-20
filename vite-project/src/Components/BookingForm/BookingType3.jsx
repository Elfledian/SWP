import React, { useState } from "react";
import { Form, DatePicker, Button, List, message, Radio } from "antd";
import moment from "moment";
import api from "../../config/axios";

const BookingType3 = (props) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [courtTimeSlots, setCourtTimeSlots] = useState([]);
  const [error, setError] = useState(null);

  const handleDateChange = async (date) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
    await fetchCourtTimeSlots(date.format("YYYY-MM-DD"));
  };

  //GET Court Time Slot
  const fetchCourtTimeSlots = async (date) => {
    try {
      const response = await api.get(`/courtTimeSlot/${props.courtId}/${date}`);
      const slotFilter = response.data;
      setCourtTimeSlots(response.data);
      console.log(response.data);
      setAvailableTimes(
        slotFilter.filter((item) => item.status == "AVAILABLE")
      );
      console.log(slotFilter.filter((item) => item.status == "AVAILABLE"));
      // const data = response.data;
      // const bookingId = data.id;
      // localStorage.setItem("Id", bookingId);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddToSchedule = (id, startTime, endTime) => {
    // const newEntry = { date: selectedDate.format("YYYY-MM-DD"), time };
    const newEntry = { id, date: selectedDate, startTime, endTime };

    const isDuplicate = selectedSchedule.some(
      (entry) =>
        entry.id === newEntry.id &&
        entry.date === newEntry.date &&
        entry.startTime === newEntry.startTime &&
        entry.endTime === newEntry.endTime
    );
    console.log(selectedSchedule);
    if (isDuplicate) {
      message.warning("This schedule is already added");
    } else {
      setSelectedSchedule([...selectedSchedule, newEntry]);
      message.success(
        `Added ${newEntry.date} at ${newEntry.startTime} - ${newEntry.endTime} to schedule`
      );
    }
  };

  const handleDeleteFromSchedule = (index) => {
    const newSchedule = [...selectedSchedule];
    newSchedule.splice(index, 1);
    setSelectedSchedule(newSchedule);
    message.success("Schedule entry deleted");
  };

  // const onFinish = () => {
  //   props.handleSubmitParent(selectedSchedule);
  // };

  return (
    <div name="bookingType3Form" layout="vertical">
      <Form.Item label="Select Booking Date" name="bookingDate">
        <DatePicker onChange={handleDateChange} />
      </Form.Item>

      {/* {selectedDate && ( */}
      <Form.Item
        name="time"
        label="Available Times"
        // rules={[{ required: true, message: "Please select a time!" }]}
      >
        <Radio.Group>
          {availableTimes.map((item) => (
            <Radio.Button
              // key={index}
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
        {/* {availableTimes.map((item, index) => (
            <Button key={index} onClick={() => handleAddToSchedule(item.time)}>
              {item.time}
            </Button>
          ))} */}
      </Form.Item>
      {/* )} */}

      <Form.Item label="Selected Schedule">
        <List
          bordered
          dataSource={selectedSchedule}
          renderItem={(item, index) => (
            <List.Item>
              <div>
                {item.date} at {item.startTime} - {item.endTime}
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
  );
};

export default BookingType3;
