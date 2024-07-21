import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/axios';
import { Card, Typography, Space, Row, Col, Button, Form, Input, Modal, message, DatePicker, Select, Tag } from 'antd';
import NavBar from '../layout/NavBar';
import Footer from '../layout/Footer';
import moment from 'moment';
import SearchNavBar from '../layout/SearchNavBar';

const { Meta } = Card;
const { Option } = Select;

const UpdateForCustomer = () => {
    const isLoggedIn = localStorage.getItem("token")
    const userRole = localStorage.getItem("userRole")
    const navigate = useNavigate()
    const [bookingDetail, setBookingDetail] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [courts, setCourts] = useState([]);
    const [courtTimeSlots, setCourtTimeSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const { bookingid } = useParams();
    const { clubid } = useParams();

    useEffect(() => {
        if (userRole != "CUSTOMER") {
            navigate('/error404');
        }
    }, [userRole, navigate]);

    useEffect(() => {
        const fetchBookingDetail = async () => {
            try {
                const response = await api.get(`/bookingDetail/${bookingid}`);
                setBookingDetail(response.data);
            } catch (error) {
                console.error('Failed to fetch booking detail:', error);
            }
        };

        fetchBookingDetail();
    }, [bookingid]);

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const response = await api.get(`/court/${clubid}`);
                setCourts(response.data);
            } catch (error) {
                console.error('Failed to fetch courts:', error);
            }
        };

        fetchCourts();
    }, [clubid]);

    const handleCourtChange = async (value) => {
        setSelectedCourt(value);
        if (selectedDate) {
            try {
                const response = await api.get(`/courtTimeSlot/${value}/${selectedDate.format('YYYY-MM-DD')}`);
                setCourtTimeSlots(response.data);
            } catch (error) {
                console.error('Failed to fetch court time slots:', error);
            }
        }
    };

    const handleDateChange = async (date, dateString) => {
        setSelectedDate(date);
        if (selectedCourt) {
            try {
                const response = await api.get(`/courtTimeSlot/${selectedCourt}/${date.format('YYYY-MM-DD')}`);
                setCourtTimeSlots(response.data);
            } catch (error) {
                console.error('Failed to fetch court time slots:', error);
            }
        }
    };


    const handleTimeSlotClick = (timeSlotId) => {
        setSelectedTimeSlot(timeSlotId);
    };

    const showModal = (booking) => {
        setCurrentBooking(booking);
        setIsModalVisible(true);
    };

    const handleUpdate = async () => {
        try {
            const changeSlotBookingDetailRequestCombo = {
                newcourtTSId: selectedTimeSlot,
                newbookingDate: selectedDate.format('YYYY-MM-DD')
            };
            const response = await api.put(`/bookingDetail/slot/${currentBooking.bookingDetailsId}`, changeSlotBookingDetailRequestCombo);
            console.log("Booking updated:", response.data);
            message.success("Updated success!")
            setIsModalVisible(false);

            const fetchBookingDetail = async () => {
                try {
                    const response = await api.get(`/bookingDetail/${bookingid}`);
                    setBookingDetail(response.data);
                } catch (error) {
                    console.error('Failed to fetch booking detail:', error);
                }
            };
            fetchBookingDetail();
        } catch (error) {
            message.error("Error!")
            console.error("Error updating booking:", error);
        }
    };

    return (
        <>
            {isLoggedIn ? (
                <div>
                    <SearchNavBar />
                    <div style={{ marginTop: 130, marginBottom: 30 }}>
                        <h3 style={{ textAlign: 'center' }}>Booking ID: {bookingid}</h3>

                        <Row gutter={[16, 16]} justify="center">
                            {bookingDetail?.map((booking, index) => {
                                const bookingDate = new Date(booking.bookingDate);
                                const year = bookingDate.getFullYear();
                                const month = bookingDate.getMonth() + 1;
                                const day = bookingDate.getDate();
                                const dayOfWeek = bookingDate.toLocaleString('en-US', { weekday: 'long' });

                                return (
                                    <Col key={index} span={10}>
                                        <Card title={`Court: ${booking.courtName}`} style={{ margin: '0 auto' }}>
                                            <Space direction="vertical">
                                                <Typography.Text>Name: {booking.fullnameoforder}</Typography.Text>
                                                <Typography.Text>Phone: {booking.phonenumber}</Typography.Text>
                                                <Typography.Text strong>Time: Start: {booking.start_time} - End: {booking.end_time}</Typography.Text>
                                                <Typography.Text strong>Date: {month}/{day}/{year} ({dayOfWeek})</Typography.Text>
                                                <Typography.Text>Status: {booking.status}</Typography.Text>
                                                <Button
                                                    onClick={() => showModal(booking)}
                                                    disabled={
                                                        moment().utc().format('YYYY-MM-DD') >= moment.utc(booking.bookingDate).format('YYYY-MM-DD')
                                                        || booking.status !== 'NOTYET' || booking.status === "CHECKEDIN"
                                                    }
                                                >
                                                    Update
                                                </Button>




                                            </Space>
                                        </Card>
                                        <Modal title="Update Booking" visible={isModalVisible && currentBooking === booking} onCancel={() => setIsModalVisible(false)} footer={null}>
                                            <Form onFinish={handleUpdate}>
                                                <Form.Item name="ctslot_id">
                                                    <Select placeholder="Select a court" onChange={handleCourtChange}>
                                                        {courts.map((court) => (
                                                            <Option key={court.id} value={court.id}>{court.courtName}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <DatePicker
                                                    placeholder="Select a date"
                                                    format="YYYY-MM-DD"
                                                    onChange={handleDateChange}
                                                    disabledDate={(current) => {

                                                        const bookingDate = moment(booking.bookingDate);

                                                        return current && (current < moment().startOf('day') || current > bookingDate.add(3, 'days'));
                                                    }}
                                                />



                                                <Form.Item name="courtTimeSlotId">
                                                    {courtTimeSlots.filter(timeSlot => timeSlot.status === 'AVAILABLE').map((timeSlot) => (
                                                        <Tag
                                                            key={timeSlot.courtTimeSlotId}
                                                            color={selectedTimeSlot === timeSlot.courtTimeSlotId ? 'blue' : 'default'}
                                                            onClick={() => handleTimeSlotClick(timeSlot.courtTimeSlotId)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {timeSlot.start_time} - {timeSlot.end_time}
                                                        </Tag>
                                                    ))}
                                                </Form.Item>
                                                <Button type="primary" htmlType="submit">Submit</Button>
                                            </Form>
                                        </Modal>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                    <Footer />
                </div>
            ) : (
                navigate('/login')
            )}
        </>
    );
};

export default UpdateForCustomer;