import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Alert from '@mui/material/Alert';

interface Props {
  message: string;
  resetMessage: () => void;
  alertType: 'success' | 'info' |'error';
}

const ToastMessage: React.FC<Props> = ({ message, resetMessage, alertType }) => {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (message) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        resetMessage();
      }, 2500);
    }
  }, [message, resetMessage]);

  return (
    <Box id="container">
      {showAlert && <Alert severity={alertType}>{message}</Alert>}
    </Box>
  );
};

export default ToastMessage;
