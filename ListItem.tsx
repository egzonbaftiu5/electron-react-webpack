import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import FolderIcon from '@mui/icons-material/Folder';

interface ListItemProps {
  selectedIndex: number;
  handleListItemClick: (index: number) => void;
}

export default function TemporaryDrawer({
  selectedIndex,
  handleListItemClick,
}: ListItemProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const DrawerList = (
    <Box>
      {!toggleDrawer ? (
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {['Import Database', 'Data', 'Charts'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => {
                    handleListItemClick(index);
                    toggleDrawer();
                  }}
                >
                  <ListItemIcon>
                    {index === 0 ? (
                      <InboxIcon />
                    ) : index === 1 ? (
                      <FolderIcon />
                    ) : (
                      <ShowChartIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <Box>
          <List>
            <Box>
              <FolderIcon />
            </Box>
          </List>
        </Box>
      )}
    </Box>
  );

  return (
    <div>
      <Drawer open={drawerOpen} onClose={toggleDrawer}>
        {DrawerList}
        <Divider />
      </Drawer>
      <button onClick={toggleDrawer}>
        {drawerOpen ? (
          <KeyboardDoubleArrowRightIcon />
        ) : (
          <KeyboardDoubleArrowLeftIcon />
        )}
      </button>
    </div>
  );
}
