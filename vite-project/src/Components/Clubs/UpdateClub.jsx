import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  TimePicker,
  message,
  InputNumber,
  Upload,
} from "antd";
import moment from "moment";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import uploadFile from "../util/useUpload";
import { updateClubAPI } from "../API/UpdateClubAPI";
import api from "../../config/axios";

const UpdateClub = () => {
  const isLoggedIn = localStorage.getItem("token");
  const { clubId } = useParams();
  const [form] = Form.useForm();
  const [initialPicture, setInitialPicture] = useState(null);
  const [uploadList, setUploadList] = useState([]);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await api.get("/club");
        const club = response.data;
        form.setFieldsValue({
          name: club.name,
          address: club.address,
          price: club.price,
          open_time: moment(club.open_time, "HH:mm:ss"),
          close_time: moment(club.close_time, "HH:mm:ss"),
          picture_location: club.picture_location,
        });
        setInitialPicture(club.picture_location);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch club data");
      }
    };
    fetchClubData();
  }, [form, clubId]);

  const handleUpdate = async (values) => {
    try {
      let img = initialPicture;
      img = await uploadFile(values.picture_location.file);
      const openTime = values.open_time;
      const closeTime = values.close_time;

      const data = await updateClubAPI(
        clubId,
        values.name,
        values.address,
        values.price,
        openTime.hour(),
        openTime.minute(),
        closeTime.hour(),
        closeTime.minute(),
        img
      );

      if (data) {
        message.success("Club updated successfully!");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update club");
    }
  };

  const handleRemove = () => {
    setInitialPicture(null);
    form.setFieldsValue({ picture_location: null });
  };

  return (
    <>
      {isLoggedIn ? (
        <div
          className="login-container"
          style={{ height: "50%", paddingTop: "20px" }}
        >
          <div className="login-card">
            <Form
              form={form}
              name="updateClubForm"
              layout="vertical"
              onFinish={handleUpdate}
            >
              <Form.Item>
                <Link to={`/clubManage`}>
                  <Button type="text">
                    <ArrowLeftOutlined /> Back
                  </Button>
                </Link>
              </Form.Item>

              <Form.Item
                name="name"
                label="Club Name"
                rules={[
                  { required: true, message: "Please enter the club name!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address"
                label="Club Address"
                rules={[
                  { required: true, message: "Please enter the club address!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: "Please enter the price!" }]}
              >
                <InputNumber
                  min={0}
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                name="open_time"
                label="Open Time"
                rules={[
                  { required: true, message: "Please select the open time!" },
                ]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="close_time"
                label="Close Time"
                rules={[
                  { required: true, message: "Please select the close time!" },
                ]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="picture_location" label="Club picture">
                <Upload
                  name="file"
                  type="file"
                  listType="picture"
                  beforeUpload={() => false} // Prevents automatic upload
                  maxCount={1}
                  defaultFileList={
                    initialPicture
                      ? [
                          {
                            uid: "-1",
                            name: "current-picture",
                            status: "done",
                            url: initialPicture,
                          },
                        ]
                      : []
                  }
                  onRemove={handleRemove}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Club
                </Button>
              </Form.Item>
            </Form>
            <Link to="/clubManage" className="btn btn-warning">
              Back to Club List
            </Link>
          </div>
        </div>
      ) : (
        navigate("/")
      )}
    </>
  );
};

export default UpdateClub;
