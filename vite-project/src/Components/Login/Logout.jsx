// import React, { useContext, useEffect, useState } from "react";
// import { AuthContext } from "./AuthProvider";
// import { useNavigate } from "react-router-dom";
// import { UserOutlined, LogoutOutlined, WalletOutlined, MoneyCollectOutlined, StarFilled, CreditCardOutlined, InteractionOutlined } from '@ant-design/icons';
// import { Button, Input, Layout, Menu, Form, message, Row, Col, Card, Image } from 'antd';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import api from "../../config/axios";
// import TopUp from "../Wallet/TopUp";
// import Transfer from "../Wallet/Transfer";
// import TopUpHistory from "../Wallet/TopUpHistory";
// import BookingTransactionHistory from "../Wallet/BookingTransactionHistory";
// import MomoTransfer from './../Wallet/MomoTransfer';

// const { Header, Content, Sider } = Layout;
// function getItem(label, key, icon, children) {
//   return {
//     key,
//     icon,
//     children,
//     label,
//   };
// }

// const items = [
//   getItem("Profile", "1", <UserOutlined />),
//   getItem("Top-up", "2", <CreditCardOutlined />),
//   getItem("Top-up history", "3", <WalletOutlined />),  
//   getItem("Transaction history", "4", <InteractionOutlined />),
// ];

// const Logout = () => {
//   const accessToken = localStorage.getItem("token");
//   const isLoggedIn = !!accessToken;
//   const userRole = localStorage.getItem("userRole")
//   const userID = localStorage.getItem("userId")
//   const [form] = Form.useForm();
//   const [form2] = Form.useForm();
//   const auth = useContext(AuthContext);
//   const navigate = useNavigate();
//   const loginEmail = localStorage.getItem('userEmail');
//   const [userDetails, setUserDetails] = useState({ username: "", phone: "" });
//   const [selectedKey, setSelectedKey] = useState("1");
//   const [showTransfer, setShowTransfer] = useState(false);
//   const [balance, setBalance] = useState(null)



//   const validationSchema = Yup.object().shape({
//     username: Yup.string().required('Full name is required'),
//     phone: Yup.string().required('Phone is required').matches(/^\d+$/, "Phone number is not valid"),
//   });
//   useEffect(() => {
//     if (userRole === "ADMIN") {
//       navigate('/adminDashboard');
//     }
//   }, [userRole, navigate])

//   useEffect(() => {
//     const fetchAccountInfo = async () => {
//       try {
//         const response = await api.get(`/account/${loginEmail}`);
//         const responseData = response.data
//         console.log(responseData)
//         setUserDetails({
//           username: responseData.fullName,
//           phone: responseData.phone,
//         });
//         form2.setFieldsValue({
//           username: responseData.fullName,
//           phone: responseData.phone,
//         });
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchAccountInfo();
//   }, [loginEmail, form2]);

//   useEffect(() => {
//     const fetchBalance = async () => {
//       try {
//         const response = await api.get(`/pay/getBalance/${userID}`);
//         setBalance(response.data);
//       } catch (error) {
//         console.error("Error fetching balance:", error);
//       }
//     };

//     fetchBalance();
//   }, [accessToken]);



//   const handleSave = async (values, actions) => {
//     const payloadData = {
//       fullName: values.username,
//       phone: values.phone,
//     };

//     try {
//       const response = await api.put('/updateNameAndPhone', payloadData);
//       console.log(response.data)
//       setUserDetails(response.data);
//       message.success('User details saved successfully!');
//     } catch (error) {
//       console.error('Error saving user details:', error);
//       message.error('An error occurred while saving user details.');
//     }
//     actions.setSubmitting(false);
//   };

//   const onChangePassword = async (values) => {
//     const payload = {
//       password: values.newPassword,
//     };
//     try {
//       const response = await api.post("/reset-password", payload);
//       message.success("Reset successful!");
//       form.resetFields()
//     } catch (error) {
//       console.error("Error occurred:", error);
//       message.error("An unknown error occurred. Please try again.");
//     }
//   };

//   const handleTopUpClick = () => {
//     setSelectedKey("2");
//     setShowTransfer(false);
//   }

//   const handleCardClick = () => {
//     setShowTransfer(true);
//   }
//   const handleLogout = () => {
//     auth.handleLogout();
//     navigate("/");
//   };
//   const filteredItems = items.filter(
//     (item) => {
//       if (userRole === "CUSTOMER") {
//         return item.key === "1" || item.key === "2" || item.key === "3" || item.key === "4";
//       } else {
//         return item.key === "1";
//       }
//     });

//   useEffect(() => {
//     if (selectedKey !== "2") {
//       setShowTransfer(false); // Reset showTransfer on key change (except key 2)
//     }
//   }, [selectedKey]);
//   return (
//     <>
//       {isLoggedIn ? (
//         <Layout style={{ height: '100vh' }}>
//           <Content
//             style={{
//               padding: '48px',
//             }}
//           >
//             <Layout
//               style={{
//                 padding: '24px 0',
//                 background: '#fff',
//                 borderRadius: '8px',
//               }}
//             >
//               <Sider
//                 style={{
//                   background: '#fff',
//                   width: 200,
//                   display: 'flex',
//                   flexDirection: 'column',
//                   justifyContent: 'space-between',
//                 }}
//               >
//                 <Menu
//                   mode="inline"
//                   selectedKeys={[selectedKey]}
//                   style={{
//                     height: 'calc(100% - 50px)',
//                   }}
//                   onClick={({ key }) => setSelectedKey(key)}
//                   items={filteredItems}
//                 />
//                 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
//                   <Button type="danger" icon={<LogoutOutlined />} onClick={handleLogout}>
//                     Logout
//                   </Button>
//                 </div>
//               </Sider>
//               <Content
//                 style={{
//                   padding: '24px',
//                   minHeight: 280,
//                   height: '100%',
//                 }}
//               >
//                 {selectedKey === "1" &&
//                   <>
//                     <>
//                       <h4>Account Detail</h4>
//                       <p>Email: {loginEmail}</p>
//                       <Formik
//                         initialValues={userDetails}
//                         enableReinitialize
//                         validationSchema={validationSchema}
//                         onSubmit={handleSave}
//                       >
//                         {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
//                           <Form layout="vertical" form={form2} onFinish={handleSubmit}>
//                             <Row gutter={16}>
//                               <Col xs={24}>
//                                 <Form.Item
//                                   label="Full name"
//                                   name="username"
//                                   validateStatus={errors.username && touched.username ? 'error' : ''}
//                                   help={errors.username && touched.username && errors.username}
//                                 // value={userDetails.username}
//                                 >
//                                   <Input
//                                     name="username"
//                                     value={values.username}
//                                     onChange={handleChange}
//                                     onBlur={handleBlur} />
//                                 </Form.Item>
//                               </Col>
//                               <Col xs={24}>
//                                 <Form.Item
//                                   label="Phone Number"
//                                   name="phone"
//                                   validateStatus={errors.phone && touched.phone ? 'error' : ''}
//                                   help={errors.phone && touched.phone && errors.phone}
//                                 // value={userDetails.phone}
//                                 >
//                                   <Input
//                                     name="phone"
//                                     value={values.phone}
//                                     onChange={handleChange}
//                                     onBlur={handleBlur} />
//                                 </Form.Item>
//                               </Col>
//                             </Row>
//                             <Form.Item>
//                               <Button type="primary" htmlType="submit" >
//                                 Save information
//                               </Button>
//                             </Form.Item>
//                           </Form>
//                         )}
//                       </Formik>

//                       {/* Wallet - DO NOT TOUCH */}

//                       {userRole === "CUSTOMER" &&
//                         <Card style={{ marginTop: 20, maxWidth: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
//                           <h5>Remaining Badcoins</h5>
//                           <Row gutter={16} style={{ marginTop: 20 }}>
//                             <Col xs={4} sm={2} md={1} lg={1} xl={1}>
//                               <Image preview={false} width={40} height={30} style={{ alignSelf: 'center' }} src="https://firebasestorage.googleapis.com/v0/b/projectswp-9019a.appspot.com/o/coin.png?alt=media&token=fc52517b-5991-44f5-af34-7c2a6d063cdc" />
//                             </Col>
//                             <Col xs={20} sm={22} md={23} lg={23} xl={23}>
//                               <p style={{ marginLeft: 20, marginTop: 4 }}>{new Intl.NumberFormat().format(balance)}đ</p>
//                             </Col>
//                           </Row>
//                           <Row>
//                             <Col xs={24} style={{ textAlign: 'end' }}>
//                               <Button type="primary" onClick={() => handleTopUpClick()}>Top up</Button>
//                             </Col>
//                           </Row>
//                         </Card>
//                       }

//                       <h4 style={{ marginTop: 20 }}>Change password</h4>
//                       <Form layout="vertical" form={form} name="changePasswordForm" onFinish={onChangePassword}>
//                         <Row gutter={16}>
//                           <Col xs={24} sm={12} md={8} lg={6} xl={6}>
//                             <Form.Item
//                               label="New password"
//                               name="newPassword"
//                               rules={[
//                                 { required: true, message: "Please input your new password!" },
//                               ]}
//                             >
//                               <Input.Password placeholder="Enter new password" />
//                             </Form.Item>
//                           </Col>
//                           <Col xs={24} sm={12} md={8} lg={6} xl={6}>
//                             <Form.Item
//                               label="Confirm new password"
//                               name="passwordConfirm"
//                               rules={[
//                                 { required: true, message: "Please confirm your new password!" },
//                                 ({ getFieldValue }) => ({
//                                   validator(_, value) {
//                                     if (!value || getFieldValue('newPassword') === value) {
//                                       return Promise.resolve();
//                                     }
//                                     return Promise.reject(new Error('Password does not match!'));
//                                   },
//                                 }),
//                               ]}
//                             >
//                               <Input.Password placeholder="Confirm new password" />
//                             </Form.Item>
//                           </Col>
//                         </Row>
//                         <Form.Item>
//                           <Button type="primary" htmlType="submit">
//                             Confirm new password
//                           </Button>
//                         </Form.Item>
//                       </Form>


//                     </>

//                   </>
//                 }
//                 {selectedKey === "2" && !showTransfer && <TopUp onCardClick={handleCardClick} />}
//                 {selectedKey === "2" && showTransfer && <Transfer />}
//                 {selectedKey === "3" && <TopUpHistory />}
//                 {selectedKey === "4" && <BookingTransactionHistory />}
//               </Content>
//             </Layout>
//           </Content>
//         </Layout>
//       ) : (
//         navigate('/login')
//       )}
//     </>
//   );
// };

// export default Logout;
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { LogoutOutlined, UserOutlined, CreditCardOutlined, WalletOutlined, InteractionOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Form, message, Row, Col, Input, Card, Image } from 'antd';
import { Formik } from 'formik';
import * as Yup from 'yup';
import api from "../../config/axios";
import TopUp from "../Wallet/TopUp";
import Transfer from "../Wallet/Transfer";
import TopUpHistory from "../Wallet/TopUpHistory";
import BookingTransactionHistory from "../Wallet/BookingTransactionHistory";
import MomoTransfer from './../Wallet/MomoTransfer';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem("Profile", "1", <UserOutlined />),
  getItem("Top-up", "2", <CreditCardOutlined />),
  getItem("Top-up history", "3", <WalletOutlined />),
  getItem("Transaction history", "4", <InteractionOutlined />),
];

const Logout = () => {
  const accessToken = localStorage.getItem("token");
  const isLoggedIn = !!accessToken;
  const userRole = localStorage.getItem("userRole");
  const userID = localStorage.getItem("userId");
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const loginEmail = localStorage.getItem('userEmail');
  const [userDetails, setUserDetails] = useState({ username: "", phone: "" });
  const [selectedKey, setSelectedKey] = useState("1");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [balance, setBalance] = useState(null);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Full name is required'),
    phone: Yup.string().required('Phone is required').matches(/^\d+$/, "Phone number is not valid"),
  });

  useEffect(() => {
    if (userRole === "ADMIN") {
      navigate('/adminDashboard');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const response = await api.get(`/account/${loginEmail}`);
        const responseData = response.data;
        console.log(responseData);
        setUserDetails({
          username: responseData.fullName,
          phone: responseData.phone,
        });
        form2.setFieldsValue({
          username: responseData.fullName,
          phone: responseData.phone,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAccountInfo();
  }, [loginEmail, form2]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get(`/pay/getBalance/${userID}`);
        setBalance(response.data);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [accessToken]);

  const handleSave = async (values, actions) => {
    const payloadData = {
      fullName: values.username,
      phone: values.phone,
    };

    try {
      const response = await api.put('/updateNameAndPhone', payloadData);
      console.log(response.data);
      setUserDetails(response.data);
      message.success('User details saved successfully!');
    } catch (error) {
      console.error('Error saving user details:', error);
      message.error('An error occurred while saving user details.');
    }
    actions.setSubmitting(false);
  };

  const onChangePassword = async (values) => {
    const payload = {
      password: values.newPassword,
    };
    try {
      const response = await api.post("/reset-password", payload);
      message.success("Reset successful!");
      form.resetFields();
    } catch (error) {
      console.error("Error occurred:", error);
      message.error("An unknown error occurred. Please try again.");
    }
  };

  const showTransferComponent = (paymentMethod) => {
    setSelectedComponent(paymentMethod);
    setShowTransfer(true)
  };

  const handleLogout = () => {
    auth.handleLogout();
    navigate("/");
  };


  const filteredItems = items.filter(
    (item) => {
      if (userRole === "CUSTOMER") {
        return item.key === "1" || item.key === "2" || item.key === "3" || item.key === "4";
      }
      else if (userRole === "CLUB_OWNER") {
        return item.key === "1" || item.key === "2"
      }
      else {
        return item.key === "1";
      }
    });

  useEffect(() => {
    if (selectedKey !== "2") {
      setSelectedComponent(null);
      setShowTransfer(false);
    }
  }, [selectedKey]);

  const handleTopUpClick = () => {
    setSelectedKey("2");
    setShowTransfer(false);
  }


  return (
    <>
      {isLoggedIn ? (
        <Layout style={{ height: '100vh' }}>
          <Content style={{ padding: '48px' }}>
            <Layout style={{ padding: '24px 0', background: '#fff', borderRadius: '8px' }}>
              <Sider style={{ background: '#fff', width: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {userRole === "CLUB_OWNER" ? (
                  <Link to={`/clubManage`}>
                    <Button type="text">
                      <ArrowLeftOutlined /> Back to dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/`}>
                    <Button type="text">
                      <ArrowLeftOutlined /> Back
                    </Button>
                  </Link>
                )}
                <Menu
                  mode="inline"
                  selectedKeys={[selectedKey]}
                  style={{ height: 'calc(100% - 50px)' }}
                  onClick={({ key }) => setSelectedKey(key)}
                >
                  {filteredItems.map(item => (
                    <Menu.Item key={item.key} icon={item.icon}>
                      {item.label}
                    </Menu.Item>
                  ))}
                </Menu>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <Button type="danger" icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </Sider>
              <Content style={{ padding: '24px', minHeight: 280, height: '100%' }}>
                {selectedKey === "1" &&
                  <>
                    <>
                      <h4>Account Detail</h4>
                      <p>Email: {loginEmail}</p>
                      <Formik
                        initialValues={userDetails}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleSave}
                      >
                        {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
                          <Form layout="vertical" form={form2} onFinish={handleSubmit}>
                            <Row gutter={16}>
                              <Col xs={24}>
                                <Form.Item
                                  label="Full name"
                                  name="username"
                                  validateStatus={errors.username && touched.username ? 'error' : ''}
                                  help={errors.username && touched.username && errors.username}
                                // value={userDetails.username}
                                >
                                  <Input
                                    name="username"
                                    value={values.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur} />
                                </Form.Item>
                              </Col>
                              <Col xs={24}>
                                <Form.Item
                                  label="Phone Number"
                                  name="phone"
                                  validateStatus={errors.phone && touched.phone ? 'error' : ''}
                                  help={errors.phone && touched.phone && errors.phone}
                                // value={userDetails.phone}
                                >
                                  <Input
                                    name="phone"
                                    value={values.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Form.Item>
                              <Button type="primary" htmlType="submit" >
                                Save information
                              </Button>
                            </Form.Item>
                          </Form>
                        )}
                      </Formik>

                      {/* Wallet - DO NOT TOUCH */}

                      {userRole === "CUSTOMER" &&
                        <Card style={{ marginTop: 20, maxWidth: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <h5>Remaining Badcoins</h5>
                          <Row gutter={16} style={{ marginTop: 20 }}>
                            <Col xs={4} sm={2} md={1} lg={1} xl={1}>
                              <Image preview={false} width={40} height={30} style={{ alignSelf: 'center' }} src="https://firebasestorage.googleapis.com/v0/b/projectswp-9019a.appspot.com/o/coin.png?alt=media&token=fc52517b-5991-44f5-af34-7c2a6d063cdc" />
                            </Col>
                            <Col xs={20} sm={22} md={23} lg={23} xl={23}>
                              <p style={{ marginLeft: 20, marginTop: 4 }}>{new Intl.NumberFormat().format(balance)}đ</p>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={24} style={{ textAlign: 'end' }}>
                              <Button type="primary" onClick={() => handleTopUpClick()}>Top up</Button>
                            </Col>
                          </Row>
                        </Card>
                      }

                      <h4 style={{ marginTop: 20 }}>Change password</h4>
                      <Form layout="vertical" form={form} name="changePasswordForm" onFinish={onChangePassword}>
                        <Row gutter={16}>
                          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                              label="New password"
                              name="newPassword"
                              rules={[
                                { required: true, message: "Please input your new password!" },
                              ]}
                            >
                              <Input.Password placeholder="Enter new password" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                            <Form.Item
                              label="Confirm new password"
                              name="passwordConfirm"
                              rules={[
                                { required: true, message: "Please confirm your new password!" },
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                      return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Password does not match!'));
                                  },
                                }),
                              ]}
                            >
                              <Input.Password placeholder="Confirm new password" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item>
                          <Button type="primary" htmlType="submit">
                            Confirm new password
                          </Button>
                        </Form.Item>
                      </Form>


                    </>

                  </>
                }
                {selectedKey === "2" && !showTransfer &&
                  <TopUp onCardClick={showTransferComponent} />
                }
                {selectedKey === "3" &&
                  <TopUpHistory />
                }
                {selectedKey === "4" &&
                  <BookingTransactionHistory />
                }
                {selectedComponent === "vnpay" && showTransfer && <Transfer />}
                {selectedComponent === "momo" && showTransfer && <MomoTransfer />}
              </Content>
            </Layout>
          </Content>
        </Layout>
      ) : (
        <div>Please login to access your account.</div>
      )}
    </>
  );
};

export default Logout;
