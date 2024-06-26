import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LoadingProgress from '../LoadingProgress';

const ImportButton: React.FC = () => {

  const [showLoadingProgress, setShowLoadingProgress] = useState(false);

  const loadingShow = () => {
    setShowLoadingProgress(true);

    setTimeout(() => {
      setShowLoadingProgress(false);
    }, 1000);
  };

  const handleImportClick = () => {
    loadingShow();
    if (window.importFile && window.importFile.importFile) {
      window.importFile.importFile();
    } else {
      console.error('Import API not available');
    }
  };

  return (
    <Box id="importDiv">
      <Button id="importBtn" variant="contained" onClick={handleImportClick}>
        <AttachFileIcon className="attachIcon" />
        Import Database
      </Button>
      <Box>
        {showLoadingProgress && <LoadingProgress />}
      </Box>
    </Box>
  );
};

export default ImportButton;
