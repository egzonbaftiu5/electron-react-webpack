import React, { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { FormControlLabel, Typography } from '@mui/material';
import ImportButton from './import/ImportDataBase';
import Box from '@mui/material/Box';
import ToastMessage from './toast/ToastMessage';
import ToggleMui from './Togglemui';
import ListItem from './tabs/ListItem';
import Recipe from './recipe/RecipeId';
import RecipeData from './recipe_data/RecipeData';
import ChartsOverviewDemo from './charts/ChartItem';

function AppMain() {
  const [recipeIds, setRecipeIds] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [databaseLoaded, setDatabaseLoaded] = useState(false);
  const [recipeData, setRecipeData] = useState<any[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'info' | 'error'>(
    'success',
  );
  const [makeDrinkData, setMakeDrinkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoadingProgress, setShowLoadingProgress] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [firstItemClick, setFirstItemClick] = useState(false);

  useEffect(() => {
    const { electron } = window;

    if (electron && electron.ipcRenderer) {
      const typeDataListener = (data: { id: number; name: string }[]) => {
        setRecipeIds(data);
        setDatabaseLoaded(true);
      };

      const recipeDataListener = (data: { recipeTaskData: any[] }) => {
        setRecipeData(data.recipeTaskData);
      };

      const makeDrinkDataListener = (data: { makeDrinkData: any[] }) => {
        setMakeDrinkData(data.makeDrinkData);
      };

      electron.ipcRenderer.on('type-data', typeDataListener);
      electron.ipcRenderer.on('recipe-data', recipeDataListener);
      electron.ipcRenderer.on('make-drink-data', makeDrinkDataListener);

      return () => {};
    } else {
      console.warn('Electron IPC Renderer not available');
    }
  }, []);

  const updateQuantity = (taskId: string, newQuantity: number) => {
    setRecipeData((prevData) =>
      prevData.map((item) =>
        item.taskId === taskId ? { ...item, quantity: newQuantity } : item,
      ),
    );

    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('update-quantity', {
        recipeId: selectedRecipe,
        taskId: taskId,
        newQuantity: newQuantity,
      });
    }
  };

  const toggleMode = () => {
    if (window.toggle && window.toggle.toggle) {
      window.toggle.toggle();
    } else {
      console.error('toggle API not available');
    }
  };

  const updateRange = (taskId: string, newRange: string) => {
    setRecipeData((prevData) =>
      prevData.map((item) =>
        item.taskId === taskId ? { ...item, range: newRange } : item,
      ),
    );

    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('update-range', {
        recipeId: selectedRecipe,
        taskId: taskId,
        newValue: newRange,
      });
    }
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLoading(true);
    setShowLoadingProgress(true);

    const selectedId = event.target.value as string;
    setSelectedRecipe(selectedId);

    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('get-recipe', selectedId);
    }

    setTimeout(() => {
      setLoading(false);
      setShowLoadingProgress(false);
    }, 200);
  };

  const showAlert = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success',
  ) => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const resetMessage = () => {
    setAlertMessage('');
  };

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
    toggleDrawer();
    if (index === 0) {
      setFirstItemClick(true);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const renderContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Recipe
            recipeIds={recipeIds as any}
            selectedRecipe={selectedRecipe as any}
            handleChange={handleChange as any}
            databaseLoaded={databaseLoaded}
          />
        );
      case 1:
        return (
          <RecipeData
            recipeData={recipeData as any}
            updateQuantity={updateQuantity as any}
            updateRange={updateRange as any}
            showAlert={showAlert as any}
            showLoadingProgress={showLoadingProgress}
          />
        );
      case 2:
        return <ChartsOverviewDemo makeDrinkData={makeDrinkData as any} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{}}>
      <Box
        sx={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 170 }}
      >
        <FormControlLabel
          control={
            <ToggleMui sx={{ m: 1 }} defaultChecked onClick={toggleMode} />
          }
          label=""
        />
      </Box>
      <Box className="Hello">
        <Typography variant="h4" component="h2">
          Aura Matic Machine
        </Typography>
      </Box>

      <ToastMessage
        message={alertMessage}
        resetMessage={resetMessage}
        alertType={alertType}
      />

      <>
        <ListItem
          selectedIndex={selectedIndex}
          handleListItemClick={handleListItemClick}
        />
        <Box sx={{ p: 3 }}>
          {firstItemClick && <ImportButton />}
          {renderContent(selectedIndex)}
        </Box>
      </>
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppMain />} />
      </Routes>
    </Router>
  );
}
