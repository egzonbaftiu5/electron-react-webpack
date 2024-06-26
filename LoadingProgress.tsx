import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function LoadingProgress() {
  return (
    <Box sx={{ display: 'flex',paddingTop: 5 ,justifyContent:'center', alignItems:'center'}}>
      <CircularProgress color='primary' disableShrink={true} value={1} thickness={10}  size={20}/>
    </Box>
  );
}
