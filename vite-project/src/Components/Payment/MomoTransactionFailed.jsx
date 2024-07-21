import React, { useEffect, useState } from 'react';
import { CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Typography, Space, Divider, Card } from 'antd';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import { Link } from 'react-router-dom';
import useGetParams from '../../assets/hooks/useGetParams';
import moment from "moment";
import api from '../../config/axios';


const MomoTransactionFailed = ({ message = 'Transaction failed!', details = null }) => {
  const param = useGetParams();
  const bookingId = param("vnp_OrderInfo")
  const transactionDate = moment()

  // const payload = {
  //   bookingId: bookingId,
  //   status: "01"
  // }
  // useEffect(() => {
  //   const postTransaction = async () => {
  //     try {
  //       const transactionFailData = await api.post("/transactions", payload)
  //       console.log(transactionFailData)
  //     }
  //     catch (error) {
  //       console.log(error)
  //     }
  //   }; 
  //   postTransaction();
  // }, [])

  return (
    <div style={{ padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}> {/* Background color and padding */}
      <Card bordered style={{ width: 400, margin: '0 auto', backgroundColor: '#f2f2f2' }}> {/* Card styles with background color */}
        <Row justify="center" align="middle">
          <Col span={24}>
            <CloseCircleOutlined style={{ fontSize: 64, color: 'red' }} />
            <Typography.Title level={3} style={{ color: 'red' }}>
              {message}
            </Typography.Title>
          </Col>
        </Row>
        <Space direction="vertical" size={12}>
          {details && (
            <>
              <Divider />
              <Typography.Paragraph>
                <InfoCircleOutlined style={{ marginRight: 8 }} /> {details}
              </Typography.Paragraph>
            </>
          )}
        </Space>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 18 }}> {/* Center alignment and margin */}
          <p>An error occurred, please try again later.</p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography.Text style={{ fontSize: 18 }}>Redirect to Home</Typography.Text>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default MomoTransactionFailed;
