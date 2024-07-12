import React, { useState } from 'react';
import { Card, Image, Input, Typography, Divider, Button, Checkbox } from 'antd';

const { Title, Text } = Typography;

const Transfer = () => {
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/projectswp-9019a.appspot.com/o/vnpay-logo.jpg?alt=media&token=52ef0034-ac31-4135-8ee9-b07399dc4677";
  const title = "VNPay";
  const description = ""; // Add a description if needed
  const [buttonStatus, setButtonStatus] = useState(true)
  const handleButtonClick = () => {
    setButtonStatus(!buttonStatus)
  }


  return (
    <>
      
        <div style={{ flexDirection: 'column', justifyContent: 'center' }}>
          <Card
            style={{ width: 200, margin: 'auto', textAlign: 'center' }} // Set card width, center content, and auto-margin
          >
            <Image preview={false} width={80} height={80} src={logoUrl} alt={title} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* Center content within card */}
              <Title level={5}>{title}</Title>
              <Text>{description}</Text>

            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}> {/* Align input and currency unit */}
            <Input placeholder="Enter recharge amount" style={{ maxWidth: 300 }} />
            <Text style={{ margin: '0 10px' }}>VND</Text>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}> {/* Checkbox and text */}
          <Checkbox onClick={handleButtonClick} />
          <Text style={{ maxWidth: 400, marginLeft: 5 }}>Tôi hiểu rằng, khi chuyển khoản phải chính xác hoàn toàn nội dung chuyển khoản và số tiền.</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <Button type='primary' style={{ width: 400 }} disabled={buttonStatus}>Top-up</Button>
        </div>
     
    </>
  );
};

export default Transfer;
