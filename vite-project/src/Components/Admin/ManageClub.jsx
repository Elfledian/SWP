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
  message,
  Table,
  Modal,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import api from "../../config/axios";

const ManageClub = () => {
  const options = [
    {
      value: "searchName",
      label: "Search Name",
    },
    {
      value: "searchStartTime",
      label: "Search Start Time",
    },
    {
      value: "searchAddress",
      label: "Search Address",
    },
  ];

  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("searchName");
  const accessToken = localStorage.getItem("token");
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get("/clubs/admin");
        setClubs(response.data);
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const handleDisableButton = async (id, active) => {
    try {
      // Make the PUT request
      const data = await api.put(`/${id}/${active}`);
      // Handle response here
      if (data) {
        message.success("Club updated successfully!");
        console.log("update status:", data.data);
      }
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.clubId === id ? { ...club, active: !active } : club
        ))
    } catch (error) {
      // Handle error here
      console.error("Error update club:", error);
      message.error("Update failed. Please try again.");
    }
  };

  // const renderClubList = (club) => (
  //   <List.Item key={club.clubId}>
  //     <List.Item.Meta
  //       avatar={
  //         <Image
  //           width={80}
  //           height={80}
  //           src={club.picture_location}
  //           alt={club.name}
  //         />
  //       }
  //       title={<Typography.Title level={4}>{club.name}</Typography.Title>}
  //       description={
  //         <Space direction="vertical">
  //           <Typography.Text>Address: {club.address}</Typography.Text>
  //           <Typography.Text>
  //             Open: {club.open_time} - {club.close_time}
  //           </Typography.Text>
  //           <Typography.Text>{club.price}VND/hour</Typography.Text>
  //           <Rate value={club.rating} />
  //           <Typography.Text>{club.feedbacks} reviews</Typography.Text>
  //         </Space>
  //       }
  //     />

  //     <Button
  //       type="primary"
  //       danger={club.active}
  //       size="small"
  //       onClick={() => handleDisableButton(club.clubId, club.active)}
  //     >
  //       {!club.active ? "Enable" : "Disable"}
  //     </Button>
  //   </List.Item>
  // );

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

  const columns = [
    { title: "ID", dataIndex: "clubId" },
    { title: "Club Name", dataIndex: "name" },
    { title: "Address", dataIndex: "address" },
    { title: "Owner", dataIndex: "ownerName" },
    { title: "Price", dataIndex: "price" },
    {
      title: "Status",
      dataIndex: "active",
      render: (_, record) => (record.active ? "Active" : "Inactive"),
    },
    {
      title: "Action",
      dataIndex: "", // No data index needed for action column
      render: (_, record) => (
        <Button
          type="primary"
          danger={record.active}
          size="small"
          onClick={() => handleDisableButton(record.clubId, record.active)}
        >
          {!record.active ? "Enable" : "Disable"}
        </Button>
      ),
    }, // Add an action column with a button
  ];

  return (
    <div>
      <ul className="nav mb-2 mb-lg-0">
        <li className="nav-item">
          <Space direction="vertical" size="middle">
            <Space.Compact>
              <Select
                defaultValue="searchName"
                style={{ height: 39.9 }}
                options={options}
                onChange={handleSearchTypeChange}
              />
              {/* <Search
              placeholder="input search text"
              enterButton
              size="large"
              // onSearch={onSearch}
              style={{ maxWidth: 400 }}
            />  */}
              <Input
                placeholder="Enter text to search"
                onChange={handleSearchChange}
                style={{ maxWidth: 500 }}
              />
            </Space.Compact>
          </Space>
        </li>
        <li className="nav-item">
          <Link
            to={{
              pathname: `/AddClubCombo`,
              // state: { club },
            }}
            className="nav-link"
          >
            Add Club
          </Link>
        </li>
      </ul>
      {/* <Footer /> */}
      {isLoading ? (
        <p>Loading accounts...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : filteredClubs.length === 0 ? (
        <Empty description="No accounts found" />
      ) : (
        <>
          <Table dataSource={filteredClubs} columns={columns} rowKey="id" />
          {/* <Modal
            title="Confirm account status update"
            visible={isUpdateModalVisible}
            onOk={handleConfirmUpdate}
            onCancel={handleCancelUpdate}
          >
            <p>Are you sure you want to update the status of this account?</p>
          </Modal> */}
        </>
      )}
    </div>
  );
};

export default ManageClub;
