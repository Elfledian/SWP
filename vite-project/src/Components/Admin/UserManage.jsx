

import React, { useState, useEffect } from 'react';
import { Table, Empty, Button, Modal, message } from 'antd';
import api from '../../config/axios';

const UserManage = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [accountIdToUpdate, setAccountIdToUpdate] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState(null);

  const handleUpdateStatus = (accountId) => {
    setAccountIdToUpdate(accountId);
    const currentStatus = accounts.find((account) => account.accountId === accountId)?.status;
    setStatusToUpdate(currentStatus === 'Active' ? false : true);
    setIsUpdateModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    setIsUpdateModalVisible(false);
    const payload = {
      status: statusToUpdate === 'Active' ? false : true,
    };

    try {
      const res = await api.put(`/updateStatus?accountId=${accountIdToUpdate}`, payload);
      message.success('Update success!');
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.accountId === accountIdToUpdate ? { ...account, status: statusToUpdate ? 'Active' : 'Deactivate' } : account
        )
      );
    } catch (error) {
      message.error('An unknown error occurred, try again later.');
      setError(error.message);
      console.error('Error updating account status:', error);
    }
  };

  const handleCancelUpdate = () => {
    setIsUpdateModalVisible(false);
    setAccountIdToUpdate(null);
    setStatusToUpdate(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get('/accounts');
        setAccounts(response.data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'accountId' },
    { title: 'Full name', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Phone No.', dataIndex: 'phone' },
    {
      title: 'Account status',
      dataIndex: 'status',
      render: (text, record) => (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: record.status === 'Active' ? 'green' : 'red',
              marginRight: '8px',
            }}
          />
          <span
            style={{
              color: 'black',
              padding: '5px 10px',
              borderRadius: '4px',
            }}
          >
            {record.status}
          </span>
        </span>
      ),
    },
    {
      title: 'Action',
      dataIndex: '',
      render: (_, record) => (
        record.role !== "ADMIN" &&
        <Button type="primary" onClick={() => handleUpdateStatus(record.accountId)}>
          Change status
        </Button>
      ),
    },
  ];

  return (
    <div>
      {isLoading ? (
        <p>Loading accounts...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : accounts.length === 0 ? (
        <Empty description="No accounts found" />
      ) : (
        <>
          <Table dataSource={accounts} columns={columns} rowKey="id" />
          <Modal
            title="Confirm account status update"
            visible={isUpdateModalVisible}
            onOk={handleConfirmUpdate}
            onCancel={handleCancelUpdate}
          >
            <p>Are you sure you want to update the status of this account?</p>
          </Modal>
        </>
      )}
    </div>
  );
};

export default UserManage;
