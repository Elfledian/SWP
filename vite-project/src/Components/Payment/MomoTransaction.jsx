import React, { useState, useEffect } from 'react';
import useGetParams from '../../assets/hooks/useGetParams';
import MomoTransactionSuccess from './MomoTransactionSuccess';
import MomoTransactionFailed from './MomoTransactionFailed';

const MomoTransaction = (props) => {
  const params = useGetParams();
  const status = params("resultCode");
  console.log(status)
  return (
    <div>
      {status == +'0' ?(
        <MomoTransactionSuccess/>
      ):(<MomoTransactionFailed/>)
      }
    </div>
  )
};

export default MomoTransaction;
