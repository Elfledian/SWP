import React, { useState } from "react";
import {
  Form,
  Select,
  Radio,
  InputNumber,
  Button,
  DatePicker,
  List,
  message,
} from "antd";
import moment from "moment";
import api from "../../config/axios";

const { Option } = Select;

// const timeSlots = [
//   { time: "07:00" },
//   { time: "08:00" },
//   { time: "09:00" },
//   { time: "10:00" },
//   { time: "11:00" },
// ];

const BookingType2 = (props) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [endDate, setEndDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [courtTimeSlots, setCourtTimeSlots] = useState([]);
  const [weekDay, setWeekDay] = useState();
  const [error, setError] = useState(null);
  const [typeDetailList, setTypeDetailList] = useState([]);
  // Validate date
  const disabledDate = (current) => {
    const today = moment().startOf("day");
    const maxDate = moment().add(91, "days").endOf("day");
    return current && (current < today || current > maxDate);
  };
  //GET Booking type 2
  const fetchCourtTimeSlots = async (startDate, enDate, dayOfWeek) => {
    try {
      const response = await api.get(
        `/courtTimeSlot/${props.courtId}/${startDate}/${enDate}/${dayOfWeek}`
      );
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

  // const handleDateChange = (date) => {
  //   setSelectedDate(date);
  //   const timesForDate = bookingType2.filter(
  //     (item) => item.date === date.format("YYYY-MM-DD")
  //   );
  //   setAvailableTimes(timesForDate);
  //   calculateEndDate(date, numberOfMonths);
  // };

  // const handleMonthChange = (value) => {
  //   setNumberOfMonths(value);
  //   calculateEndDate(selectedDate, value);
  // };

  // const calculateEndDate = (startDate, months) => {
  //   if (startDate && months > 0) {
  //     const newEndDate = moment(startDate)
  //       .add(months, "months")
  //       .format("YYYY-MM-DD");
  //     setEndDate(newEndDate);
  //   }
  // };
  const handleDateChange = async (date) => {
    console.log(date.format("YYYY-MM-DD"));
    setSelectedDate(date.format("YYYY-MM-DD"));
    calculateEndDate(date.format("YYYY-MM-DD"), selectedMonth);
    await fetchCourtTimeSlots(date.format("YYYY-MM-DD"), endDate, weekDay);
  };

  const handleMonthChange = async (value) => {
    setSelectedMonth(value);
    calculateEndDate(selectedDate, value);
    await fetchCourtTimeSlots(selectedDate, endDate, weekDay);
  };

  const calculateEndDate = async (date, months) => {
    if (date && months) {
      const endDate = moment(date).add(months, "months");
      setEndDate(endDate.format("YYYY-MM-DD"));
      console.log(endDate.format("YYYY-MM-DD"));
      return endDate.format("YYYY-MM-DD");
    }
  };

  const handleAddToSchedule = (id, startTime, endTime) => {
    // const newEntry = { date: selectedDate.format("YYYY-MM-DD"), time };
    const newEntry = { id, date: weekDay, startTime, endTime };

    const isDuplicate = selectedSchedule.some(
      (entry) =>
        entry.id === newEntry.id &&
        entry.date === newEntry.date &&
        entry.startTime === newEntry.startTime &&
        entry.endTime === newEntry.endTime
    );

    if (isDuplicate) {
      message.warning("This schedule is already added");
    } else {
      if (newEntry.date) {
        setSelectedSchedule([...selectedSchedule, newEntry]);
        message.success(
          `Added ${newEntry.date} at ${newEntry.startTime} - ${newEntry.endTime} to schedule`
        );
      } else message.warning("Please choose week day");
    }
  };

  const handleDeleteFromSchedule = (index) => {
    const newSchedule = [...selectedSchedule];
    newSchedule.splice(index, 1);
    setSelectedSchedule(newSchedule);

    const selectedBooking = [...typeDetailList];
    selectedBooking.splice(index, 1);
    setTypeDetailList(selectedBooking);

    message.success("Schedule entry deleted");
  };

  // Prepare bookingDetailRequestCombos
  const onChange = (values) => {
    const bookingTypeDetail = {
      courtTSId: values.target.value, // Update with correct value if available
      bookingDate: selectedDate,
      durationInMonths: selectedMonth, // Update with correct value if available
      dayOfWeek: weekDay, // Update with correct value if available
    };

    setTypeDetailList([...typeDetailList, bookingTypeDetail]);
    props.bookingDetail([...typeDetailList, bookingTypeDetail]);
  };

  return (
    <div name="bookingType2Form" layout="vertical">
      <div className="row">
        <div className="col-md-6">
          <Form.Item
            name="Date"
            label="Start Date"
            rules={[
              { required: true, message: "Please select the booking date!" },
            ]}
          >
          <DatePicker
              format="YYYY-MM-DD"
              onChange={handleDateChange}
              disabledDate={disabledDate}
            />
          </Form.Item>
        </div>
        <div className="col-md-6">
          <Form.Item
            name="month"
            label="Month"
            rules={[{ required: true, message: "Please input the month!" }]}
          >
            <InputNumber
              min={1}
              max={12}
              style={{ width: "100%" }}
              onChange={handleMonthChange}
            />
          </Form.Item>
        </div>
        {/* <div className="col-md-6">
          
          <Form.Item name="endDate" label="End Date">
            <DatePicker
              format="YYYY-MM-DD"
              value={endDate}
              disabled
              // Make sure the component re-renders when endDate changes
              renderExtraFooter={() => (
                <div>
                  {endDate
                    ? `End Date: ${endDate.format("YYYY-MM-DD")}`
                    : "Select start date and months to see the end date"}
                </div>
              )}
            />
          </Form.Item>
        </div> */}

        <Form.Item
          name="day_in_week_id"
          label="Day"
          rules={[
            { required: true, message: "Please select the booking type!" },
          ]}
        >
          <Select
            onChange={(value) => {
              setWeekDay(value);
              fetchCourtTimeSlots(selectedDate, endDate, value);
            }}
          >
            <Option value={"SUNDAY"}>Sunday</Option>
            <Option value={"MONDAY"}>Monday</Option>
            <Option value={"TUESDAY"}>Tuesday</Option>
            <Option value={"WEDNESDAY"}>Wednesday</Option>
            <Option value={"THURSDAY"}>Thursday</Option>
            <Option value={"FRIDAY"}>Friday</Option>
            <Option value={"SATURDAY"}>Saturday</Option>
          </Select>
        </Form.Item>
        <div className="col-md-6">
          <Form.Item
            name="time"
            label="Select Time"
            rules={[{ required: true, message: "Please select a time!" }]}
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
                  onChange={onChange}
                >
                  {item.start_time} - {item.end_time}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
        </div>
      </div>
      <Form.Item label="Selected Schedule">
        <List
          bordered
          dataSource={selectedSchedule}
          renderItem={(item, index) => (
            <List.Item>
              <div>
                {index} {item.date} at {item.startTime} - {item.endTime}
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

export default BookingType2;
