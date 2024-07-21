import React, { useEffect, useState } from "react";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import {
  Layout,
  Menu,
  Row,
  Col,
  Card,
  Image,
  Typography,
  List,
  Breadcrumb,
  Button,
  Dropdown,
  Empty
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../config/axios"; // Assuming your API client
import QRScanner from "../QRCheckin/StaffPage";
import StaffBookingForm from "../BookingForm/StaffBookingForm";
import RevenueChart from "./RevenueChart";
import ClubOwnerBalance from "./ClubOwnerBalance";
import TopUpHistory from "../Wallet/TopUpHistory";

const ClubOwnerManage = () => {
  const [club, setClub] = useState(null);
  const isLoggedIn = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const userID = localStorage.getItem("userId");
  const [selectedKey, setSelectedKey] = useState("1");
  const { clubId } = useParams(); // Get club ID from URL parameters
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole != "CLUB_OWNER") {
      navigate('/error404');
    }
  }, [userRole, navigate]);

  const handleAccountClick = () => {
    setShowAccountDropdown(!showAccountDropdown);
  };

  



  const accountMenu = (
    <Menu>
      {isLoggedIn ? (
        <>
          <Menu.Item>
            <Link to="/profile" style={{ textDecoration: "none" }}>
              Profile
            </Link>
          </Menu.Item>
          {/* {userRole === "CUSTOMER" && (
            <Menu.Item>
              <Link to="/bookingHistory" style={{ textDecoration: "none" }}>
                History
              </Link>
            </Menu.Item>
          )} */}
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

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await api.get(`/club`); // Use club ID
        setClub(response.data);
      } catch (error) {
        console.error("Error fetching club details:", error);
      }
    };

    fetchClub();
  }, [clubId]);

  if (!club) {
    return <Empty description="No data"/>
  }

  // const { name, pictureLocation, price, address, openTime, closeTime, ownerName } = club;

  return (
    <>
      {isLoggedIn ? (
        <Layout style={{ minHeight: "100vh" }}>
          <Layout.Sider>
            <Menu
              theme="dark"
              defaultSelectedKeys={["1"]}
              selectedKeys={[selectedKey]}
              mode="inline"
              onClick={({ key }) => setSelectedKey(key)}
            >
              <Menu.Item key="1">Dashboard</Menu.Item>
              <Menu.Item key="5">Balance</Menu.Item>
              <Menu.Item key="6">Top-up history</Menu.Item>
              <Menu.Item key="2">Check In</Menu.Item>
              <Menu.Item key="3">Booking</Menu.Item>
              <Menu.Item key="4">Revenue Chart</Menu.Item>
            </Menu>
          </Layout.Sider>

          <Layout>
            <Layout.Header
              style={{
                padding: 0,
                background: "#fff",
                textAlign: "center",
                fontFamily: "fantasy",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div></div>
              <div>{club.name}'s workspace</div>
              <Dropdown
                overlay={accountMenu}
                trigger="click"
                placement="bottomRight"
              >
                <Button.Group>
                  <Button
                    type="ghost"
                    onClick={handleAccountClick}
                    style={{ fontSize: "24px" }}
                  >
                    {isLoggedIn ? <UserOutlined /> : <UserOutlined />}
                    <DownOutlined />
                  </Button>
                </Button.Group>
              </Dropdown>
            </Layout.Header>

            <Layout.Content style={{ padding: "0 24px", minHeight: 280 }}>
              {selectedKey === "1" && (
                <Card bordered={true}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} lg={8}>
                      <Image src={club.picture_location} alt={name} width="100%" />
                    </Col>
                    <Col xs={24} md={12} lg={16}>
                      <Typography.Title level={4}>{name}</Typography.Title>
                      <List
                        itemLayout="horizontal"
                        dataSource={[
                          { title: "Price", content: `${club.price} VND/hr` },
                          { title: "Address", content: club.address },
                          {
                            title: "Open Time",
                            content: `${club.open_time} - ${club.close_time}`,
                          },
                          { title: "Owner", content: club.ownerName },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta title={item.title} />
                            {item.content}
                          </List.Item>
                        )}
                      />
                      <div className="club-actions">
                        {/* Action Links (replace with Ant Design components) */}
                        <Link to={`/clubManage/clubUpdate/${club.clubId}`}>
                          <Button type="primary">Update Club</Button>
                        </Link>
                        {/* <Link to={`/StaffBooking/${club.clubId}`}>
                      <Button>Booking</Button>
                    </Link>
                    <Link to={`/RevenueChart/${club.clubId}`}>
                      <Button>Revenue Chart</Button>
                    </Link> */}
                        <Link to={`/clubManage/courtList/${club.clubId}`}>
                          <Button>Show Courts</Button>
                        </Link>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              {selectedKey === "2" && <QRScanner />}
              {selectedKey === "3" && <StaffBookingForm id={club.clubId} />}
              {selectedKey === "4" && <RevenueChart clubId={club.clubId} />}
              {selectedKey === "5" && <ClubOwnerBalance/>}
              {selectedKey === "6" && <TopUpHistory/>}
            </Layout.Content>

            {/* Replace with your actual admin dashboard footer */}
            <Layout.Footer style={{ textAlign: "center" }}>
              ©{new Date().getFullYear()} Badcourts. All rights reserved
            </Layout.Footer>
          </Layout>
        </Layout>
      ) : (
        navigate('/login')
      )}
    </>
  );
};

export default ClubOwnerManage;
