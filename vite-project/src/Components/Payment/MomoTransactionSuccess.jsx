
import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Typography, Space, Divider, Card } from 'antd';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import useGetParams from '../../assets/hooks/useGetParams';
import api from '../../config/axios';
import moment from "moment";


const MomoTransactionSuccess = ({ message = 'Payment successful!', details = null }) => {
  const param = useGetParams();
  const transactionNo = param("transId")
  const transactionDate = moment()
  const bankInfo = param("partnerCode")
  const transactionid = param("orderInfo")

  // const payload = {
  //   paymentDate: transactionDate,
  //   bookingId: bookingId,
  //   status: "00"
  // }
  // useEffect(() => {
  //   const postTransaction = async () => {
  //     try {
  //       const transactionSuccessData = await api.post("/transactions", payload)
  //       console.log(transactionSuccessData)
  //     }
  //     catch (error) {
  //       console.log(error)
  //     }
  //   }; 
  //   postTransaction();
  // }, [])

    useEffect(() => {
      const updateRechargeTransaction = async () => {
        try {
          const transactionSuccessData = await api.put(`/transactions/rechargeTransaction/${transactionid}`)
          console.log(transactionSuccessData)
        }
        catch (error) {
          console.log(error)
        }
      }; 
      updateRechargeTransaction();
    }, [])


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}> {/* Center vertically */}
      <Card bordered style={{ width: 400, backgroundColor: '#f2f2f2' }}>
        <Row justify="center" align="middle">
          <Col span={24}>
            <CheckCircleOutlined style={{ fontSize: 64, color: 'green' }} />
            <Typography.Title level={3}>{message}</Typography.Title>
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
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p>Time: {new Date(transactionDate).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
          <p>Transaction No: {transactionNo} </p>
          {/* <p>Amount: {amount}</p> */}
          <p>Payment Method: {bankInfo}</p>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography.Text style={{ fontSize: 18 }}>Redirect to Home</Typography.Text>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default MomoTransactionSuccess;
