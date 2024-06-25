import React from "react";
import BookingHistoryList from "./BookingHistoryList";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";

const BookingHistoryPage = () => {
  return (
    <div>
      <NavBar />
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <BookingHistoryList></BookingHistoryList>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingHistoryPage;
