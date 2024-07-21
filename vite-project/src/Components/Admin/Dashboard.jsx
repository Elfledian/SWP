import React, { useContext, useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import {
  DesktopOutlined,
  UserOutlined,
  LogoutOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FundViewOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import MyResponsiveLine from "./LineGraph";
import BookingReport from "./BarChart";
import UserManage from "./UserManage";
import ManageClub from "./ManageClub";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Login/AuthProvider";
import PieChartComponent from "./../ClubOwnerShowBooking/PieChart";

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem("Option 2", "2", <DesktopOutlined />),
  getItem("Manage Users", "12", <UserOutlined />),
  getItem("Manage Club", "10", <DesktopOutlined />),
  getItem("Chart", "sub1", <FundViewOutlined />, [
    // getItem("Income Analysis", "1", <LineChartOutlined />),
    getItem("Total Bookings", "11", <BarChartOutlined />),
    getItem("Booking Status", "13", <PieChartOutlined />),
  ]),
];

const Dashboard = () => {
  const isLoggedIn = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole")
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("12");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [selectedBookingType, setSelectedBookingType] = useState(null);
  const [form] = Form.useForm();

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (userRole != "ADMIN") {
      navigate('/error404');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/booking-types");
        setBookingTypes(response.data);
      } catch (error) {
        console.error("Error fetching booking types:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    console.log("Logged out");
    auth.handleLogout();
    navigate("/");
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = {
      name: values.typeName,
      discount: values.discount,
    };

    try {
      await api.put(`/booking-types/${values.typeID}`, payload);
      message.success("Update success!");
    } catch (error) {
      message.error("An unknown error occurred, try again later.");
      console.error("Error updating booking type:", error);
    } finally {
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleBookingTypeChange = (value) => {
    const selected = bookingTypes.find((bkt) => bkt.bookingTypeId === value);
    setSelectedBookingType(selected);
    form.setFieldsValue({
      typeName: selected.bookingTypeName,
      discount: selected.bookingDiscount,
    });
  };

  const filteredItems = items.filter(
    (item) => item.key === "10" || item.key === "12" || item.key === "sub1"
  );

  return (
    <>
      {isLoggedIn ? (
        <Layout style={{ minHeight: "100vh" }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
          >
            <Menu
              theme="dark"
              selectedKeys={[selectedKey]}
              mode="inline"
              onClick={({ key }) => setSelectedKey(key)}
              items={filteredItems}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 0",
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ marginRight: 8, color: 'white', backgroundColor: 'transparent' }}
              />
              <Button
                color="white"
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ color: 'white', backgroundColor: 'transparent' }}
              />
            </div>
          </Sider>
          <Layout>
            <Header
              style={{
                padding: 0,
                background: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {selectedKey === "10" && (
                <div style={{ marginLeft: 16 }}>
                  <Button type="primary" onClick={showModal}>
                    Update Booking Type
                  </Button>
                </div>
              )}
            </Header>
            <Content style={{ margin: "0 16px" }}>
              {selectedKey === "1" && <MyResponsiveLine />}
              {selectedKey === "10" && <ManageClub />}
              {selectedKey === "11" && <BookingReport />}
              {selectedKey === "12" && <UserManage />}
              {selectedKey === "13" && <PieChartComponent />}
            </Content>
            <Footer style={{ textAlign: "center" }}>
              ©{new Date().getFullYear()} Badcourts. All rights reserved
            </Footer>
          </Layout>
          <Modal
            title="Booking Type"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Form layout="vertical" form={form}>
              <Form.Item
                label="Type ID"
                name="typeID"
                rules={[
                  { required: true, message: "Please select the booking type!" },
                ]}
              >
                <Select
                  placeholder="Select a Booking Type"
                  onChange={handleBookingTypeChange}
                >
                  {bookingTypes.map((bkt) => (
                    <Option key={bkt.bookingTypeId} value={bkt.bookingTypeId}>
                      {bkt.bookingTypeId}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Type Name"
                name="typeName"
                rules={[
                  { required: true, message: "Please input the type name!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Discount"
                name="discount"
                rules={[
                  { required: true, message: "Please input the discount!" },
                ]}
              >
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Modal>
        </Layout>
      ) : (
        navigate("/login")
      )}
    </>
  );
};

export default Dashboard;
