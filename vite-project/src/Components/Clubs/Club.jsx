import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Image,
  Typography,
  Button,
  Space,
  Empty,
  Rate,
  Select,
  Input,
  Modal,
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import api from "../../config/axios";
import SearchNavBar from "../layout/SearchNavBar";


const Club = () => {
  const options = [
    { value: "searchName", label: "Search Name" },
    { value: "searchStartTime", label: "Search Start Time" },
    { value: "searchAddress", label: "Search Address" },
  ];

  const [clubs, setClubs] = useState([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("searchName");
  const [showModal, setShowModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const accessToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { clubName } = useParams()

  const userRole = localStorage.getItem("userRole");
  console.log(clubName)


  useEffect(() => {
    if (userRole === "CLUB_OWNER") {
      navigate('/error404');
    }
    else if (userRole === "ADMIN"){
      navigate('/adminDashboard')
    }
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.get(`/clubs?name=${clubName}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setClubs(response.data);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };

    fetchClubs();
  }, [accessToken]);

  const fetchFeedbacks = async (clubId) => {
    try {
      const response = await api.get(`/feedback/club/${clubId}`);
      setFeedbacks(response.data);
      console.log(response.data)
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const renderClubList = (club) => (
    <List.Item key={club.clubId}>
      <List.Item.Meta
        avatar={
          <Image
            width={80}
            height={80}
            src={club.picture_location}
            alt={club.name}
          />
        }
        title={<Typography.Title level={4}>{club.name}</Typography.Title>}
        description={
          <Space direction="vertical">
            <Typography.Text>Address: {club.address}</Typography.Text>
            <Typography.Text>
              Open: {club.open_time} - {club.close_time}
            </Typography.Text>
            <Typography.Text>{club.price}VND/hour</Typography.Text>
            <Rate value={club.rating} disabled />
            <Typography.Text>
              <Button type="link" onClick={() => fetchFeedbacks(club.clubId)}>
                {club.feedbacks} reviews
              </Button>
            </Typography.Text>
          </Space>
        }
      />
        <Link to={`/booking/${club.clubId}`}>
          <Button type="primary" size="small">
            Book Now
          </Button>
        </Link>
    </List.Item>
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const handleSearchTypeChange = (value) => {
    setSearchType(value);
  };

  const filteredClubs = clubs.filter((club) => {
    if (searchType === "searchName") {
      return club.name.toLowerCase().includes(search);
    } else if (searchType === "searchStartTime") {
      return club.open_time.toLowerCase().includes(search);
    } else if (searchType === "searchAddress") {
      return club.address.toLowerCase().includes(search);
    }
    return false;
  });

  return (
    <>
   
        <div>
          <SearchNavBar />
          <div className="container" style={{ marginTop: 100 }}>
            <Space direction="vertical" size="middle">
              <Space.Compact>
                <Select
                  defaultValue="searchName"
                  style={{ height: 39.9 }}
                  options={options}
                  onChange={handleSearchTypeChange}
                />
                <Input
                  placeholder="Enter text to search"
                  onChange={handleSearchChange}
                  style={{ maxWidth: 400 }}
                />
              </Space.Compact>
            </Space>
            {filteredClubs.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={filteredClubs}
                renderItem={renderClubList}
                pagination={{ pageSize: 4 }}
              />
            ) : (
              <Empty description="No clubs found." />
            )}
          </div>
          <Footer />
          <Modal
            title="Feedbacks"
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={[
              <Button key="close" onClick={() => setShowModal(false)}>
                Close
              </Button>,
            ]}
          >
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback, index) => (
                <Card key={index} style={{ marginBottom: 10 }}>
                  <Typography.Text>{feedback.feedbackContent}</Typography.Text>
                  <br />
                  <Rate value={feedback.feedbackRating} disabled />
                </Card>
              ))
            ) : (
              <Empty description="No feedbacks found." />
            )}
          </Modal>
        </div>
    </>
  );
};

export default Club;
