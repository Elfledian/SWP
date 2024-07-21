import { Table } from 'antd';
import React, { useEffect, useState } from 'react'
import api from '../../config/axios';
import moment from 'moment';

const BookingTransactionHistory = () => {
    const userID = localStorage.getItem("userId")
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await api.get(`/transactions/transactionsByAccount/${userID}`);
            const formattedData = response.data.map(transaction => {
                if (transaction.transactionstatus === 'FULLY_PAID') {
                  return {
                    ...transaction,
                    transactiondate: moment(transaction.transactiondate).format('DD-MM-YYYY'),
                    totalamount: `-${new Intl.NumberFormat().format(transaction.totalamount)}`,
                    bookingid: `Paid for booking #${transaction.bookingid}`
                  };
                } else if (transaction.transactionstatus === 'DEPOSITED') {
                  return {
                    ...transaction,
                    transactiondate: moment(transaction.transactiondate).format('DD-MM-YYYY'),
                    totalamount: `-${new Intl.NumberFormat().format(transaction.totalamount / 2)}`,
                    bookingid: `Paid for booking #${transaction.bookingid}`
                  };
                } else {
                  return {
                    ...transaction,
                    transactiondate: moment(transaction.transactiondate).format('DD-MM-YYYY'),
                    totalamount: `+${new Intl.NumberFormat().format(transaction.totalamount)}`,
                    bookingid: `Refund for booking #${transaction.bookingid}`
                  };
                }
              }).sort((a, b) => b.transactionid - a.transactionid);
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
        { title: 'Transaction ID', dataIndex: 'transactionid', key: 'transactionid' },
        { title: 'Amount', dataIndex: 'totalamount', key: 'totalamount' },
        { title: 'Date', dataIndex: 'transactiondate', key: 'transactiondate' },
        { title: 'Status', dataIndex: 'transactionstatus', key: 'transactionstatus' },
        { title: 'Action', dataIndex: 'bookingid', key: 'bookingid' },
      ];
    
      return (
        <Table dataSource={data} columns={columns} rowKey="transactionid" loading={loading}/>
      );
}

export default BookingTransactionHistory