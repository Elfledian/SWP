// import React from 'react';
// import { Card, Row, Col, Image } from 'antd';
// import Transfer from './Transfer';

// const TopUp = () => {
//   const handleClick = () => {
//   <Transfer/>
//   }
//   return (
//     <Card onClick={handleClick} style={{maxWidth: 500}}> {/* Added card click handler */}
//       <Row> {/* Reduced gutter for closer alignment */}
//         <Col xs={8} sm={6} md={4} lg={3}>
//           <Image preview={false} width={100} height={100} src="https://firebasestorage.googleapis.com/v0/b/projectswp-9019a.appspot.com/o/vnpay-logo.jpg?alt=media&token=52ef0034-ac31-4135-8ee9-b07399dc4677" />
//         </Col>
//         <Col xs={18} sm={18} md={18} lg={18}>
//           <p style={{ marginLeft: 55, fontWeight: 'bold' }}>Top-up with VNPay</p>
//         </Col>
//       </Row>
//     </Card>
//   );
// };

// export default TopUp;


import React, { useState } from 'react';
import { Card, Row, Col, Image } from 'antd';
import Transfer from './Transfer';

const TopUp = ({ onCardClick }) => {

  const handleClick = () => {
    onCardClick();
  }

  return (
    <>
      <Card hoverable={true} onClick={handleClick} style={{maxWidth: 500}}>
        <Row>
          <Col xs={8} sm={6} md={4} lg={3}>
            <Image preview={false} width={100} height={100} src="https://firebasestorage.googleapis.com/v0/b/projectswp-9019a.appspot.com/o/vnpay-logo.jpg?alt=media&token=52ef0034-ac31-4135-8ee9-b07399dc4677" />
          </Col>
          <Col xs={18} sm={18} md={18} lg={18}>
            <p style={{ marginLeft: 55, fontWeight: 'bold' }}>Top-up with VNPay</p>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default TopUp;
