import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Recipe from '../recipe/RecipeId';
import RecipeData from '../recipe_data/RecipeData';
import ChartsOverviewDemo from '../charts/ChartItem';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  databaseLoaded: boolean;
  ImportButtonComponent: React.ReactNode;
  recipeIds?: { id: number; name: string }[];
  selectedRecipe?: string;
  // eslint-disable-next-line no-unused-vars
  handleChange?: (event: React.ChangeEvent<{ value: unknown }>) => void;
  recipeData?: any[];
  // eslint-disable-next-line no-unused-vars
  updateQuantity?: (taskId: string, newQuantity: number) => void;
  // eslint-disable-next-line no-unused-vars
  updateRange?: (taskId: string, newRange: string) => void;
  // eslint-disable-next-line no-unused-vars
  showAlert?: (message: string, type?: 'success' | 'error' | 'info') => void;
  makeDrinkData?: any[];
  showLoadingProgress?: boolean;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ImportButtonComponent, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {value === 0 && ImportButtonComponent}
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CustomTab = (props: TabProps) => (
  <Tab
    sx={{
      color: 'rgba(233, 102, 14, 0.884)',
      fontWeight: 600,
      '&:hover': {
        color: 'white',
        backgroundColor: 'black',
      },
    }}
    {...props}
  />
);

export default function BasicTabs({
  databaseLoaded,
  ImportButtonComponent,
  recipeIds,
  selectedRecipe,
  handleChange,
  recipeData,
  updateQuantity,
  updateRange,
  showAlert,
  makeDrinkData,
  showLoadingProgress,
}: TabPanelProps) {
  const [value, setValue] = React.useState(0);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Tabs
        className="tabs-dropdowns"
        orientation="vertical"
        value={value}
        onChange={handleChangeTab}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        <CustomTab label="Import Database" {...a11yProps(0)} />
        {databaseLoaded && <CustomTab label="Data" {...a11yProps(1)} />}
        {databaseLoaded && <CustomTab label="Charts" {...a11yProps(2)} />}
      </Tabs>
      <Box sx={{ flex: 1 }}>
        <CustomTabPanel
          value={value}
          index={0}
          databaseLoaded={databaseLoaded}
          ImportButtonComponent={ImportButtonComponent}
        >
          <Recipe
            recipeIds={recipeIds as any}
            selectedRecipe={selectedRecipe as any}
            handleChange={handleChange as any}
            databaseLoaded={databaseLoaded}
          />
        </CustomTabPanel>
        <CustomTabPanel
          value={value}
          index={1}
          databaseLoaded={databaseLoaded}
          ImportButtonComponent={ImportButtonComponent}
        >
          <RecipeData
            recipeData={recipeData as any}
            updateQuantity={updateQuantity as any}
            updateRange={updateRange as any}
            showAlert={showAlert as any}
            showLoadingProgress={showLoadingProgress}
          />
        </CustomTabPanel>
        <CustomTabPanel
          value={value}
          index={2}
          databaseLoaded={databaseLoaded}
          ImportButtonComponent={ImportButtonComponent}
        >
          <ChartsOverviewDemo makeDrinkData={makeDrinkData as any} />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
