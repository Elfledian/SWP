// import React, { useContext, useEffect, useState } from 'react';
// import { Link, useNavigate, } from 'react-router-dom';
// import { login } from '../API/LoginService';
// import Divider from '@mui/material/Divider';

// // import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
// <script src="https://accounts.google.com/gsi/client" async></script>
// import { AiFillEye } from "react-icons/ai";
// import { AiFillEyeInvisible } from "react-icons/ai";
// import { AuthContext } from './AuthProvider';
// import { signInWithPopup } from 'firebase/auth';
// import { auth, provider } from './../Config/FirebaseConfig';
// import axios from 'axios';
// import GoogleButton from 'react-google-button'
// import { useAuth } from "./AuthProvider"
// import { Chip } from '@mui/material';
// const Login = () => {
//     const [visible, setVisible] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const authen = useContext(AuthContext)
//     const [rememberMe, setRememberMe] = useState(false);

//     // Load the remember me state from local storage when the component mounts
//     useEffect(() => {
//         const rememberMeValue = localStorage.getItem('rememberMe') === 'true';
//         setRememberMe(rememberMeValue);
//     }, []);
//     const handleCheckboxChange = (e) => {
//         const isChecked = e.target.checked;
//         setRememberMe(isChecked);
//         localStorage.setItem('rememberMe', isChecked);
//     };
//     const togglePasswordVisibility = () => {
//         setVisible(!visible);
//     };
//     const navigate = useNavigate();
//     // const auth = useAuth()

//     const handleLogin1 = async (e) => {
//         e.preventDefault();


//         if (email.trim() === '' || password.trim() === '') {
//             setError('Please enter both phone number and password');
//         }
//         else {
//             //API call
//             try {
//                 const data = await login(email, password);
//                 console.log('Login successful!', data);
//                 // localStorage.setItem("userName", email)
//                 const fullname = data.fullName
//                 localStorage.setItem("userName", fullname)
//                 const userEmail = data.email
//                 localStorage.setItem("userEmail", userEmail)
//                 const role = data.role
//                 localStorage.setItem("userRole", role)
//                 const token = data.token
//                 // localStorage.setItem("token", token)
//                 authen.handleLogin(token)
//                 if (role == "STAFF") {
//                     navigate("/staff")
//                 }
//                 else {
//                     navigate("/")

//                 }
//                 // Handle successful login (e.g., store token, redirect)
//             } catch (err) {
//                 console.error(err);
//                 setError(err.message);
//             }
//         }
//     }
//     const handleLoginGG = async () => {
//         try {
//             const result = await signInWithPopup(auth, provider);
//             const token = result.user.accessToken;
//             const res = await axios.post("http://152.42.168.144:8080/api/login-google", { token: token })
//             // const newToken = res.token
//             authen.handleLogin(token)
//             const newTokenData = res.data
//             const newToken = newTokenData.token
//             localStorage.setItem("token", newToken)
//             const ggData = res.data
//             const roleGG = ggData.role
//             localStorage.setItem("userRole", roleGG)
//             const userEmail = ggData.email
//             localStorage.setItem("userEmail", userEmail)
//             const name = ggData.fullName
//             localStorage.setItem("userName", name)
//             navigate("/")

//         } catch (error) {
//             console.log(error);
//         }
//     };

//     return (

//         <div className="login-container">
//             <div className="login-card">
//                 <h2 className="login-title">Login</h2>
//                 {error && <div className="error">{error}</div>}
//                 <form onSubmit={handleLogin1} className="login-form">
//                     <div className="form-group">
//                         <label htmlFor="email">Email</label>
//                         <input
//                             type="text"
//                             placeholder='Enter your email'
//                             id="username"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="form-input"
//                         />
//                     </div>
//                     <div className="form-group ">
//                         <label htmlFor="password">Password</label>
//                         <input
//                             // type={visible ? "text" : "password"}
//                             type="password"
//                             placeholder='Enter your password'
//                             id="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="form-input"
//                         />
//                         {/* <div className='' onClick={togglePasswordVisibility}>
//                             {visible ? <AiFillEye /> : <AiFillEyeInvisible />}
//                         </div> */}
//                     </div>
//                     {/* <div className='form-group'>
//                         <div className='row col-md-8'>
//                             <div className=''>
//                                 <input
//                                     type="checkbox"
//                                     id="rememberme"
//                                     checked={rememberMe}
//                                     onChange={handleCheckboxChange}
//                                 />
//                                 <label htmlFor="rememberme"> Remember me</label>
//                             </div>
//                         </div>
//                     </div> */}
//                     <button onClick={handleLogin1} type="submit" className="login-button">
//                         Login
//                     </button>
//                     <div className='footer-content flex-col col text-start-0'>
//                         <p className='col-md-4'> <Link to='/forgotpassword' style={{ color: "#007bff" }}>Forgot password?</Link></p>
//                         <p className='col-md-7'>Dont have an account? <Link to="/signup" style={{ color: "#007bff" }}>Sign up</Link></p>
//                     </div>
//                     {/* <div className='google-button'>
//                         <button onClick={handleLoginGG}>Google</button>
//                     </div> */}
//                     <Divider className='divider'>
//                         OR
//                     </Divider>
//                     <div className='button-container'>
//                         <GoogleButton
//                             onClick={handleLoginGG}
//                         />
//                     </div>
//                 </form>

//             </div>
//         </div>
//     );
// };
// export default Login;

import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../API/LoginService";
import Divider from "@mui/material/Divider";

// import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
<script src="https://accounts.google.com/gsi/client" async></script>;
import { AiFillEye } from "react-icons/ai";
import { AiFillEyeInvisible } from "react-icons/ai";
import { AuthContext } from "./AuthProvider";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./../Config/FirebaseConfig";
import axios from "axios";
import GoogleButton from "react-google-button";
import { useAuth } from "./AuthProvider";
import { Chip } from "@mui/material";
const Login = () => {
  const [visible, setVisible] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const authen = useContext(AuthContext);
  const [rememberMe, setRememberMe] = useState(false);

  // Load the remember me state from local storage when the component mounts
  useEffect(() => {
    const rememberMeValue = localStorage.getItem("rememberMe") === "true";
    setRememberMe(rememberMeValue);
  }, []);
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    localStorage.setItem("rememberMe", isChecked);
  };
  const togglePasswordVisibility = () => {
    setVisible(!visible);
  };
  const navigate = useNavigate();
  // const auth = useAuth()

  const handleLogin1 = async (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter both phone number and password");
    } else {
      //API call
      try {
        const data = await login(email, password);
        // console.log("Login successful!", data);
        // localStorage.setItem("userName", email)
         const token = data.token;
        localStorage.setItem("token", token)
        // authen.handleLogin(token);
        // const resData = data.data 
        const userId = data.accountId
        localStorage.setItem("userId", userId)
        const fullname = data.fullName;
        localStorage.setItem("userName", fullname);
        const userEmail = data.email;
        localStorage.setItem("userEmail", userEmail);
        const userPhone = data.phone;
        localStorage.setItem("userPhone", userPhone);
        const role = data.role;
        localStorage.setItem("userRole", role);
       
       
        if (role == "CLUB_OWNER") {
          navigate("/clubManage");
          localStorage.setItem("userId", userId)
        } else if (role == "ADMIN") {
          navigate("/adminDashboard");
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }
  };
  const handleLoginGG = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = result.user.accessToken;
      const res = await axios.post(
        "http://152.42.168.144:8080/api/login-google",
        { token: token }
      );
      // const newToken = res.token
      authen.handleLogin(token);
      const newTokenData = res.data;
      const newToken = newTokenData.token;
      localStorage.setItem("token", newToken);
      const ggData = res.data;
      console.log(ggData)
      const roleGG = ggData.role;
      localStorage.setItem("userRole", roleGG);
      const userEmail = ggData.email;
      localStorage.setItem("userEmail", userEmail);
      const name = ggData.fullName;
      localStorage.setItem("userName", name);
      const userPhoneNo = ggData.phone;
      localStorage.setItem("userPhone", userPhoneNo);
      const userId = ggData.accountId
      localStorage.setItem("userId", userId)
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleLogin1} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group ">
            <label htmlFor="password">Password</label>
            <input
              // type={visible ? "text" : "password"}
              type="password"
              placeholder="Enter your password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            {/* <div className='' onClick={togglePasswordVisibility}>
                            {visible ? <AiFillEye /> : <AiFillEyeInvisible />}
                        </div> */}
          </div>
          {/* <div className='form-group'>
                        <div className='row col-md-8'>
                            <div className=''>
                                <input
                                    type="checkbox"
                                    id="rememberme"
                                    checked={rememberMe}
                                    onChange={handleCheckboxChange}
                                />
                                <label htmlFor="rememberme"> Remember me</label>
                            </div>
                        </div>
                    </div> */}
          <button onClick={handleLogin1} type="submit" className="login-button">
            Login
          </button>
          <div className="footer-content flex-col col text-start-0">
            <p className="col-md-4">
              {" "}
              <Link to="/forgotpassword" style={{ color: "#007bff" }}>
                Forgot password?
              </Link>
            </p>
            <p className="col-md-7">
              Dont have an account?{" "}
              <Link to="/signup" style={{ color: "#007bff" }}>
                Sign up
              </Link>
            </p>
          </div>
          {/* <div className='google-button'>
                        <button onClick={handleLoginGG}>Google</button>
                    </div> */}
          <Divider className="divider">OR</Divider>
          <div className="button-container">
            <GoogleButton onClick={handleLoginGG} />
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;