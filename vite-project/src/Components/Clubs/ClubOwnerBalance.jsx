import React, { useEffect, useState } from 'react';
import api from '../../config/axios';
import { Button, Card, Col, Image, Row, Modal, Input, message } from 'antd';

const ClubOwnerBalance = () => {
  const [balance, setBalance] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const userID = localStorage.getItem('userId');
  const accessToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get(`/pay/getBalance/${userID}`);
        setBalance(response.data);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [accessToken]);

  const handleWithdraw = async () => {
    if (withdrawAmount > 0 && withdrawAmount >= 10000 && withdrawAmount <= balance) {
      try {
        const response = await api.post(`/pay/withDraw?amount=${withdrawAmount}`);
        message.success('Withdraw successful');
        setBalance(response.data);
        setWithdrawModalVisible(false);
        setWithdrawAmount(0);
      } catch (error) {
        console.error('Error withdrawing:', error);
        message.error('Withdraw failed');
      }
    } else {
      message.error('Invalid withdrawal amount. Withdraw amount must be at least 10K and not exceed your current balance.');
    }
  };

  const handleWithdrawModalOpen = () => {
    setWithdrawModalVisible(true);
  };

  const handleWithdrawModalClose = () => {
    setWithdrawModalVisible(false);
    setWithdrawAmount(0);
  };

  const handleWithdrawAmountChange = (e) => {
    const value = parseInt(e.target.value);
    setWithdrawAmount(isNaN(value) ? 0 : value);
  };

  return (
    <>
      <Card style={{ marginTop: 20, maxWidth: 500, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <h5>Badcoins</h5>
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
            <Button type="primary" onClick={handleWithdrawModalOpen}>Withdraw</Button>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Withdraw Balance"
        visible={withdrawModalVisible}
        onOk={handleWithdraw}
        onCancel={handleWithdrawModalClose}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Input
          type="number"
          placeholder="Enter withdrawal amount"
          value={withdrawAmount}
          onChange={handleWithdrawAmountChange}
          min={1}
          max={balance}
        />
      </Modal>
    </>
  );
};

export default ClubOwnerBalance;
