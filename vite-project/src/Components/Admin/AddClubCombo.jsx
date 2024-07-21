import React, { useEffect, useState } from "react";
// import 'bootstrap/dist/css/bootstrap.min.css';
import uploadFile from "../util/useUpload";
import { addClubAPICombo } from "./AddClubAPICombo";
import { colors } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AddClubCombo = () => {
  const navigate = useNavigate()
  const userRole = localStorage.getItem("userRole")
  const isLoggedIn = localStorage.getItem("token")
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [courtAddress, setCourtAddress] = useState("");
  const [courtName, setCourtName] = useState("");
  const [price, setPrice] = useState("");
  const [courtStartHour, setCourtStartHour] = useState("");
  const [courtStartMinute, setCourtStartMinute] = useState("");
  const [courtEndHour, setCourtEndHour] = useState("");
  const [courtEndMinute, setCourtEndMinute] = useState("");
  const [uploadImage, setUploadImage] = useState(null);
  const [error, setError] = useState("");



  useEffect(() => {
    if (userRole != "ADMIN") {
      navigate('/error404');
    }
  }, [userRole, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const img = await uploadFile(uploadImage);
    console.log(img);
    if (courtName.trim() === "" || courtAddress.trim() === "") {
      setError("Please enter all fields");
    } else {
      try {
        const data = await addClubAPICombo(
          phone,
          email,
          fullname,
          courtName,
          courtAddress,
          price,
          courtStartHour,
          courtStartMinute,
          courtEndHour,
          courtEndMinute,
          img.toString()
        );
        console.log("Added successful!", data);

        if (data) {
          alert("Club created, password email is sent to email: " + email);
          setFullname("");
          setPhone("");
          setEmail("");
          setCourtAddress("");
          setCourtName("");
          setPrice("");
          setCourtStartHour("");
          setCourtStartMinute("");
          setCourtEndHour("");
          setCourtEndMinute("");
          setUploadImage(null);
          document.getElementById("clear").reset();
          setError("");
          navigate("/adminDashboard")
        }

        // Handle successful
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }
  };
  // style={{width:"1500px"}}
  return (
    <>
    {isLoggedIn ? (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div
        className="card p-4 shadow-lg"
        style={{ width: "100%", maxWidth: "1000px" }}
      >
        {error && <div className="alert alert-danger">{error}</div>}
        <form id="clear" onSubmit={handleAdd}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="fullname" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  id="fullname"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your phone number"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter your club price"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Club name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter club name"
                  id="name"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Club address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter club address"
                  id="address"
                  value={courtAddress}
                  onChange={(e) => setCourtAddress(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="mb-3 row">
                <label htmlFor="openTime" className="form-label">
                  Open time
                </label>
                <div className="col-6">
                  <input
                    type="number"
                    required
                    min={0}
                    max={23}
                    placeholder="Open hour"
                    id="openTimeHour"
                    value={courtStartHour}
                    onChange={(e) => setCourtStartHour(e.target.valueAsNumber)}
                    className="form-control"
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    required
                    min={0}
                    max={59}
                    placeholder="Open minute"
                    id="openTimeMinute"
                    value={courtStartMinute}
                    onChange={(e) =>
                      setCourtStartMinute(e.target.valueAsNumber)
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="closeTime" className="form-label">
                  Close time
                </label>
                <div className="col-6">
                  <input
                    type="number"
                    required
                    min={0}
                    max={23}
                    placeholder="Close hour"
                    id="closeTimeHour"
                    value={courtEndHour}
                    onChange={(e) => setCourtEndHour(e.target.valueAsNumber)}
                    className="form-control"
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    required
                    min={0}
                    max={59}
                    placeholder="Close minute"
                    id="closeTimeMinute"
                    value={courtEndMinute}
                    onChange={(e) => setCourtEndMinute(e.target.valueAsNumber)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="picture_location" className="form-label">
                  Club picture
                </label>
                <input
                  type="file"
                  required
                  name="picture_location"
                  id="picture_location"
                  onChange={(e) => setUploadImage(e.target.files[0])}
                  className="form-control"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Add club
          </button>
        </form>
      </div>
    </div>
    ) : (
      navigate("/login")
    )}
    </>
  );
};

export default AddClubCombo;