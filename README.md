/*Ghi chú:
- club manager id(Club) constrain vs cái gì,, tìm cách nhét vào lại
- Booking type ID(Booking), nếu đc thì gộp constraint lại, ko thì làm tạo bảng cah1 H.A
- payment method chưa hiểu, từ chối làm(có mỗi PK)
- Court Owner, Staff, Customer xem lại cần userID ko
- Staff cần clubID ko
*/

CREATE TABLE BookingMonth
(
  BookingTypeID INT NOT NULL,
  TimeBegin  NOT NULL,
  TimeEnd  NOT NULL,
  Weekday INT NOT NULL,
  TotalTime  NOT NULL,
  PRIMARY KEY (BookingTypeID)
);

CREATE TABLE Booking_1Time
(
  BookingTypeID VARCHAR NOT NULL,
  TimeSlotID VARCHAR NOT NULL,
  Date DATE NOT NULL,
  PRIMARY KEY (BookingTypeID)
);

CREATE TABLE Booking_ByHours
(
  BookingTypeID INT NOT NULL,
  TotalTime INT NOT NULL,
  PRIMARY KEY (BookingTypeID)
);

CREATE TABLE PaymentMethod
(
  PaymentMethodID VARCHAR NOT NULL,
  PRIMARY KEY (PaymentMethodID)
);

CREATE TABLE CourtOwner
(
  UserID VARCHAR NOT NULL,
  CourtOwnerID VARCHAR NOT NULL,
  CourtOwnerName VARCHAR NOT NULL,
  PRIMARY KEY (CourtOwnerID)
);

CREATE TABLE Staff
(
  UserID VARCHAR NOT NULL,
  StaffID VARCHAR NOT NULL,
  StaffName VARCHAR NOT NULL,
  PRIMARY KEY (StaffID)
);

CREATE TABLE Customer
(
  CustomerID VARCHAR NOT NULL,
  UserID VARCHAR NOT NULL,
  CustomerName VARCHAR NOT NULL,
  PRIMARY KEY (CustomerID)
);

CREATE TABLE Club
(
  ClubID VARCHAR NOT NULL,
  Name VARCHAR NOT NULL,
  Address VARCHAR NOT NULL,
  OpenHour INT NOT NULL,
  CloseHour INT NOT NULL,
  ClubPicture VARCHAR NOT NULL,
  CourtOwnerID VARCHAR NOT NULL,
  StaffID VARCHAR NOT NULL,
  PRIMARY KEY (ClubID),
  FOREIGN KEY (CourtOwnerID) REFERENCES CourtOwner(CourtOwnerID),
  FOREIGN KEY (StaffID) REFERENCES Staff(StaffID)
);

CREATE TABLE Court
(
  CourtID INT NOT NULL,
  Name INT NOT NULL,
  Price INT NOT NULL,
  ClubID VARCHAR NOT NULL,
  PRIMARY KEY (CourtID),
  FOREIGN KEY (ClubID) REFERENCES Club(ClubID)
);

CREATE TABLE TimeSlot
(
  TimeSlotID VARCHAR NOT NULL,
  StartTime INT NOT NULL,
  EndTime INT NOT NULL,
  Status VARCHAR NOT NULL,
  CourtID INT NOT NULL,
  PRIMARY KEY (TimeSlotID),
  FOREIGN KEY (CourtID) REFERENCES Court(CourtID)
);

CREATE TABLE Booking
(
  BookingID VARCHAR NOT NULL,
  BookingDate DATE NOT NULL,
  Status VARCHAR NOT NULL,
  BookingTypeID INT NOT NULL,
  BookingTypeID VARCHAR NOT NULL,
  BookingTypeID INT NOT NULL,
  CourtID INT NOT NULL,
  StaffID VARCHAR NOT NULL,
  CustomerID VARCHAR NOT NULL,
  PRIMARY KEY (BookingID),
  FOREIGN KEY (BookingTypeID) REFERENCES BookingMonth(BookingTypeID),
  FOREIGN KEY (BookingTypeID) REFERENCES Booking_1Time(BookingTypeID),
  FOREIGN KEY (BookingTypeID) REFERENCES Booking_ByHours(BookingTypeID),
  FOREIGN KEY (CourtID) REFERENCES Court(CourtID),
  FOREIGN KEY (StaffID) REFERENCES Staff(StaffID),
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

CREATE TABLE Transaction
(
  DepositAmount INT NOT NULL,
  PaymentDate DATE NOT NULL,
  TotalAmount INT NOT NULL,
  TransactionID VARCHAR NOT NULL,
  Status VARCHAR NOT NULL,
  BookingID VARCHAR NOT NULL,
  PaymentMethodID VARCHAR NOT NULL,
  PRIMARY KEY (TransactionID),
  FOREIGN KEY (BookingID) REFERENCES Booking(BookingID),
  FOREIGN KEY (PaymentMethodID) REFERENCES PaymentMethod(PaymentMethodID)
);

CREATE TABLE Feedback
(
  Feedback VARCHAR NOT NULL,
  FeedbackText VARCHAR NOT NULL,
  Rating VARCHAR NOT NULL,
  BookingID VARCHAR NOT NULL,
  CustomerID VARCHAR NOT NULL,
  FOREIGN KEY (BookingID) REFERENCES Booking(BookingID),
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);
