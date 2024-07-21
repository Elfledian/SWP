import React, { useEffect, useState } from 'react'
import api from '../../config/axios'
import { Table } from 'antd';
import moment from 'moment';

const TopUpHistory = () => {
  const userID = localStorage.getItem("userId")
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/transactions/rechargeTransactions/${userID}`);
        const formattedData = response.data.map(transaction => {
          if (transaction.transactionStatus === "RECHARGE") {
            return {
              ...transaction,
              transactionDate: moment(transaction.transactionDate).format('DD-MM-YYYY'),
              totalAmount: `+${new Intl.NumberFormat().format(transaction.totalAmount)}`,
            }
          } else {
            return {
              ...transaction,
              transactionDate: moment(transaction.transactionDate).format('DD-MM-YYYY'),
              totalAmount: `-${new Intl.NumberFormat().format(transaction.totalAmount)}`,
            }
          }
        }).sort((a, b) => b.transactionId - a.transactionId);
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: 'Recharge Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'Top-up Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
    },
    {
      title: 'Status',
      dataIndex: 'transactionStatus',
      key: 'transactionStatus',
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="transactionId"
      loading={loading}
    />
  );
}

export default TopUpHistory