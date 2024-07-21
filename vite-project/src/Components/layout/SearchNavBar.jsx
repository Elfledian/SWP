

import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, Dropdown, Menu, Select, Space, Input, Empty } from "antd";
import { UserOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const { Search } = Input;

const SearchNavBar = () => {
  const accessToken = localStorage.getItem("token")
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [clubName, setClubName] = useState("");
  const navigate = useNavigate()

  const handleAccountClick = () => {
    setShowAccountDropdown(!showAccountDropdown);
  };

  const handleSearch = async () => {
    // Perform API call with clubName
    // if (clubName) {
    //   const apiUrl = `http://badcourts.click:8080/api/clubs?name=${clubName}`;
    //   // Here you would make your API call using fetch or axios
    //   console.log("API URL:", apiUrl);
    // }
    // try {
    //   if (clubName) {
    //   const response = await api.get(`/clubs?name=${clubName}`, {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //   });
    navigate(`/clubs/${clubName}`)
    // }
    // else{
    //   <Empty description="No clubs found." />
    // }
    // } catch (error) {
    //   console.error("Error fetching clubs:", error);
    // }
  };

  const options = [
    {
      value: "searchName",
      label: "Search Name",
    },
    {
      value: "searchStartTime",
      label: "Search Start Time",
    },
  ];

  const isLoggedIn = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const accountMenu = (
    <Menu>
      {isLoggedIn ? (
        <>
          <Menu.Item>
            <Link to="/profile" style={{ textDecoration: "none" }}>
              Profile
            </Link>
          </Menu.Item>
          {/* <Menu.Item>
            <Link to="/feedback" style={{ textDecoration: "none" }}>
              Feedback Demo
            </Link>
          </Menu.Item> */}
          {userRole === "CUSTOMER" && (
            <Menu.Item>
              <Link to="/bookingHistory" style={{ textDecoration: "none" }}>
                History
              </Link>
            </Menu.Item>
          )}
        </>
      ) : (
        <Menu.Item>
          <Link to="/login" style={{ textDecoration: "none" }}>
            Login
          </Link>
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <nav className="navbar bg-white fixed-top d-flex justify-content-between align-items-center">
      <div className="container-fluid">
        {/* Logo */}
        <Link to="/" className="navbar-brand text-primary">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/projectswp-9019a.appspot.com/o/logo.png?alt=media&token=ec0e9108-2b09-4c86-8b6e-407fb1269a3b"
            style={{
              width: '100px',
              height: '70px',
              // marginLeft: "30px",
              display: "fixed",
            }}
            alt="Logo"
          />
        </Link>

        {isLoggedIn && userRole === "CLUB_OWNER" && (
          <NavLink
            to="/clubManage"
            className={({ isActive }) =>
              isActive ? "nav-link active text-primary" : "nav-link"
            }
          >
            Manage Club
          </NavLink>

        )}

        {/* Search Input and Button */}
        {userRole != "CLUB_OWNER" && (
          <Space direction="vertical" size="middle">
            <Space>
              <Search
                placeholder="Enter text to search"
                allowClear
                enterButton={<Button onClick={handleSearch}><SearchOutlined /></Button>}
                size="large"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
              />
            </Space>
          </Space>
        )}

        {/* Account Dropdown (right-aligned) */}
        <Dropdown overlay={accountMenu} trigger="click" placement="bottomRight">
          <Button.Group>
            <Button type="ghost" onClick={handleAccountClick} style={{ fontSize: '24px' }}>
              {isLoggedIn ? <UserOutlined /> : <UserOutlined />}
              <DownOutlined />
            </Button>
          </Button.Group>
        </Dropdown>
      </div>

      {/* Spacer div below the navbar */}
      <div className="navbar-spacer"></div>
    </nav>
  );
};

export default SearchNavBar;
