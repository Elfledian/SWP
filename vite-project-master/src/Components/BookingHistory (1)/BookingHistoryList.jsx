import React, { useEffect, useState } from "react";
import BookingHistory from "./BookingHistory";
import axios from "axios";
import api from './../../Config/axios';


const bookings = [
  {
    id: 1,
    Club: "Fpt",
    Address: "kldjaljkda",
    Time: "12/10/2023 7:00",
    BookingCreateTime: "10/10/2023 8:00",
    status: "pending",
  },
  {
    OrderID: 2,
    Club: "Fpt",
    Address: "kldjaljkda",
    Time: "12/10/2023 7:00",
    BookingCreateTime: "10/10/2023 8:00",
    status: "pending",
  },
  {
    OrderID: 3,
    Club: "Fpt",
    Address: "kldjaljkda",
    Time: "12/10/2023 7:00",
    BookingCreateTime: "10/10/2023 8:00",
    status: "pending",
  },
];
const BookingHistoryList = () => {
  // const url = "http://152.42.168.144:8080/api/booking/customer";

  // const [bookingHistory, setBookingHistory] = useState([]);

  // useEffect(() => {
  //   loadList();
  // }, []);

  // const loadList = async () => {
  //   const result = await axios.get(url, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   setBookingHistory(result.data);
  // };
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/booking/customer", {
          transformResponse: [
            (data) => {
              // Transform the response data to handle empty responses
              return data ? JSON.parse(data) : [];
            },
          ],
        });
        // const response = await api.get("/booking/customer");
        // console.log(response);
        console.log(response.data);
        setCustomers(response.data);
        const data = response.data;
        const bookingId = data.id
        localStorage.setItem("Id", bookingId)
      } catch (error) {
        setError(error.message);
      }
    };

    fetchCustomers();
  }, []);
  // console.log(customers);
  return (
    <ul className="list-group shadow-sm">
      <h1>History</h1>
      {customers.map((booking) => {
        return (
          <BookingHistory
            orderID={booking?.id}
            club={booking?.club_name}
            address={booking?.address}
            time={booking?.Time}
            type={booking?.bookingTypeId}
            bookingCreateTime={booking?.bookingDate}
            status={booking?.status}
          ></BookingHistory>
        );
      })}
    </ul>
    // <div>
    //   <h1>Customer List</h1>
    //   {error && <div>Error: {error}</div>}
    //   <ul>
    //     {customers.map((customer, index) => (
    //       <li key={index}>{JSON.stringify(customer)}</li>
    //     ))}
    //   </ul>
    // </div>
  );
};

export default BookingHistoryList;
