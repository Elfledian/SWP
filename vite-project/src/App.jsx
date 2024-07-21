import './App.css'
import Home from './Components/Home/Home'
import './Components/css/Login.css'
import './Components/css/SignUp.css'
import './Components/css/ForgotPassword.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from './Components/Login/AuthProvider'
import Login from './Components/Login/login'
import SignUp from './Components/Login/SignUp'
import ForgotPassword from './Components/Login/ForgotPassword';
import Logout from './Components/Login/Logout';
import ForgotPassConfirm from './Components/Login/ForgotPassConfirm'
import EmailSent from './Components/Login/EmailSent'
import CRUD from './Components/common/CRUD'
import Club from './Components/Clubs/Club'
import ClubDetail from './Components/Clubs/ClubDetail'
import Dashboard from './Components/Admin/Dashboard'
import BookingHistoryPage from './Components/BookingHistory/BookingHistoryPage'
import BookingForm from './Components/BookingForm/BookingForm';
import Feedback from './Components/Feedback/Feedback'
import Transaction from './Components/Payment/Transaction'
import QRScanner from './Components/QRCheckin/StaffPage'
// import ClubOwnerList from './Components/Clubs/ClubOwnerList'
import UpdateClub from './Components/Clubs/UpdateClub'
import CourtList from './Components/Clubs/CourtList'
import AddClubCombo from './Components/Admin/AddClubCombo'
import AddCourt from './Components/Clubs/AddCourt'
import CourtTimeSlotList from './Components/Clubs/CourtTimeSlotList'
import ClubOwnerManage from './Components/Clubs/ClubOwnerManage';
import AddCourtTimeSlot from './Components/Clubs/AddCourtTimeSlot';
import ShowBookingList from './Components/ClubOwnerShowBooking/ShowBookingList';
import StaffBookingForm from './Components/BookingForm/StaffBookingForm';
import BookingReport from "./Components/Admin/BarChart";
import MyResponsiveLine from "./Components/Admin/LineGraph";
import UpdateForCustomer from './Components/Clubs/UpdateForCustomer'
import UpdateForOwner from "./Components/Clubs/UpdateForOwner";
import ShowBookingsOfAClub from "./Components/Clubs/ShowBookingsOfAClub";
import RevenueChart from './Components/Clubs/RevenueChart';
import SetPassConfirm from './Components/Admin/SetPassConfirm'
import Error404 from './Components/common/Error404'
import MomoTransaction from './Components/Payment/MomoTransaction'


function App() {
  return (
    <AuthProvider>
      <main>

        <Router>
          <Routes>
            <Route
              exact
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/staff"
              element={<QRScanner />}
            />
            <Route
              path="/profile"
              element={<Logout />}
            />
            <Route
              path="/clubManage"
              element={<ClubOwnerManage />}
            />
            <Route
              path="/clubManage/clubUpdate/:clubId"
              element={<UpdateClub />}
            />
            <Route
              path="/clubManage/courtList/:clubId"
              element={<CourtList />}
            />
            <Route
              path="/signup"
              element={<SignUp />}
            />
            <Route
              path="/error404"
              element={<Error404 />}
            />
            {/* <Route
              path="/confirmOTP"
              element={<OTPConfirm />}
            /> */}
            <Route
              path='/forgotpassword'
              element={<ForgotPassword />}
            />
            <Route
              path='/emailsent'
              element={<EmailSent />}
            />
            <Route
              path="/UpdateForCustomer/:bookingid/:clubid"
              element={<UpdateForCustomer />}
            />
            {/* <Route
              path="/clubManage/ShowBookingsOfAClub"
              element={<ShowBookingsOfAClub />}
            />
            <Route
              path="/clubManage/ShowBookingsOfAClub/UpdateForOwner/:bookingid/:clubid"
              element={<UpdateForOwner />}
            /> */}
            <Route
              path='/reset-password'
              element={<ForgotPassConfirm />}
            />
            <Route
              path='/clubs/:clubName'
              element={<Club />}
            />
            <Route
              path='/clubs'
              element={<Club />}
            />
            {/* <Route
              path='/clubs/:address'
              element={<ClubDetail />}
            /> */}
            <Route
              path='/bookingHistory'
              element={<BookingHistoryPage />}
            />
            <Route
              path='/booking/:id'
              element={<BookingForm />}
            />
            <Route
              path="/showBooking/:courtId"
              element={<ShowBookingList />} />
            <Route
              path='/transactions'
              element={<Transaction />}
            />

            <Route
              path='/momoTransactions'
              element={<MomoTransaction />}
            />

            <Route
              path='/RevenueChart/:clubId'
              element={<RevenueChart />}
            />
            <Route
              path='/feedback/:bookingId'
              element={<Feedback />}
            />
            <Route
              path='/CRUD'
              element={<CRUD />}
            />
            <Route
              path='/AddClubCombo'
              element={<AddClubCombo />}
            />

            <Route
              path='/adminDashboard'
              element={<Dashboard />}
            />
            <Route
              path='/clubManage/courtList/addCourt/:clubId'
              element={<AddCourt />}
            />
            <Route
              path='/AddCourtTimeSlot'
              element={<AddCourtTimeSlot />}
            />
            <Route
              path='/clubManage/courtList/CourtsDetail/:courtId'
              element={<CourtTimeSlotList />}
            />
            <Route
              path="/StaffBooking/:id"
              element={<StaffBookingForm />}
            />
            <Route
              path="*"
              element={<Navigate to="/" />}
            />
            <Route
              path="/line"
              element={<MyResponsiveLine />}
            />
            <Route
              path="/bar"
              element={<BookingReport />}
            />
            <Route
              path="/setPasswordActiveClub"
              element={<SetPassConfirm />}
            />
          </Routes>
        </Router>

      </main>
    </AuthProvider>
  )
}

export default App
