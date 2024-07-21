import React, { useState } from 'react';
import { Card, Image, Input, Typography, Button, Checkbox, message, Form } from 'antd';
import api from '../../config/axios';

const { Title, Text } = Typography;

const MomoTransfer = () => {
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/projectswp-9019a.appspot.com/o/unnamed.jpg?alt=media&token=7f3367e3-aa33-42dd-90b1-a86801705ad2";
  const title = "Momo";
  const description = "";
  const [buttonStatus, setButtonStatus] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [form] = Form.useForm();

  const handleButtonClick = () => {
    setButtonStatus(!buttonStatus);
  };

  const handleRecharge = async () => {
    try {
      const res = await api.post('pay/momo', {
        bookingId: 0,
        amount: rechargeAmount
      });
      const paymentURL = res.data;
      if (paymentURL) {
        window.location.href = paymentURL;
      } else {
        console.error("No paymentURL found in response");
      }
      console.log(res.data);
    } catch (error) {
      message.error("An unknown error occurred, please try again.");
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    setRechargeAmount(e.target.value);
  };

  return (
    <>
      <Form form={form} onFinish={handleRecharge}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Card style={{ width: 200, textAlign: 'center' }}>
            <Image preview={false} width={80} height={80} src={logoUrl} alt={title} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={5}>{title}</Title>
              <Text>{description}</Text>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
            <Form.Item
              name="rechargeAmount"
              rules={[{ required: true, message: 'Please enter a recharge amount' }]}
            >
              <Input 
                placeholder="Enter recharge amount" 
                style={{ maxWidth: 300 }} 
                onChange={handleInputChange} 
                value={rechargeAmount} 
                required={true} 
              />
            </Form.Item>
            <Text style={{ marginLeft: 10, marginBottom: 23 }}>VND</Text>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
          <Checkbox onClick={handleButtonClick} />
          <Text style={{ maxWidth: 400, marginLeft: 5 }}>I understand that, the transfer details and amount must be completely accurate.</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <Button type='primary' style={{ width: 400 }} disabled={buttonStatus} htmlType='submit'>Top-up</Button>
        </div>
      </Form>
    </>
  );
};

export default MomoTransfer;
