import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Select, MenuItem, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { FormLabel } from '@mui/material';

interface Recipe {
  taskId: string;
  quantity: number;
  name: string;
  unit: string;
  range: string | null;
  description: string;
}

interface RecipeDataProps {
  recipeData: Recipe[];
  // eslint-disable-next-line no-unused-vars
  updateQuantity: (taskId: string, newQuantity: number) => void;
  // eslint-disable-next-line no-unused-vars
  updateRange: (taskId: string, newRange: string) => void;
  // eslint-disable-next-line no-unused-vars
  showAlert: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const RecipeData: React.FC<RecipeDataProps> = ({
  recipeData,
  updateQuantity,
  updateRange,
  showAlert,
}) => {
  const [currentRange, setCurrentRange] = useState<{ [key: string]: string }>(
    {},
  );
  const [isButtonVisible, setIsButtonVisible] = useState<{
    [key: string]: boolean;
  }>({});

  // eslint-disable-next-line no-unused-vars
  const [showError, setShowError] = useState<{ [key: string]: boolean }>({});

  const handleQuantityChange = (
    event: React.ChangeEvent<{ value: unknown }>,
    taskId: string,
  ) => {
    const newQuantity = event.target.value as number;
    updateQuantity(taskId, newQuantity);
    showAlert('Quantity updated successfully!');
  };

  const handleRangeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    taskId: string,
  ) => {
    let newRange = event.target.value;
    newRange = newRange.replace(/[^0-9,]/g, '');

    setCurrentRange((prev) => ({ ...prev, [taskId]: newRange }));
    setIsButtonVisible((prev) => ({ ...prev, [taskId]: true }));
    if (newRange.trim() === '') {
      showAlert('This field is mandatory', 'error');
    }
  };

  const handleSaveClick = (taskId: string) => {
    const newRange = currentRange[taskId] || '';
    let newRangeArray = newRange.split(',').map((value) => value.trim());

    newRangeArray = Array.from(
      new Set(newRangeArray.filter((value) => value !== '')),
    ).sort((a, b) => Number(a) - Number(b));

    const filteredRangeString = newRangeArray.join(',');
    updateRange(taskId, filteredRangeString);
    setIsButtonVisible((prev) => ({ ...prev, [taskId]: false }));

    if (filteredRangeString === '') {
      showAlert('This field is mandatory', 'error');
    } else {
      const selectedRecipe = recipeData.find((item) => item.taskId === taskId);
      if (
        selectedRecipe &&
        !newRangeArray.includes(String(selectedRecipe.quantity))
      ) {
        showAlert('Please insert another number in quantity!', 'info');
      } else {
        showAlert('Changes saved successfully!', 'success');
      }
    }
  };

  const handleRangeKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
    taskId: string,
  ) => {
    if (event.key === 'Enter') {
      handleSaveClick(taskId);
    }
  };

  return (
    <Box component="div" className="container-main">
      {recipeData.map((item) => (
        <Box className="dropdown-container" key={item.taskId}>
          <Box id="nameDiv" className="name-label-div">
            <FormLabel id="formName">{item.name}</FormLabel>
          </Box>

          <Box className="input-dropdown-container">
            <FormLabel id="quantityLabel">Quantity</FormLabel>
            <Select
              id="dropdownQuantity"
              value={item.quantity}
              onChange={(event) => handleQuantityChange(event, item.taskId)}
            >
              {(item.range ? item.range.split(',') : []).map((value) => (
                <MenuItem key={value} value={Number(value)}>
                  {value}
                </MenuItem>
              ))}
            </Select>

            <FormLabel id="rangeLabel">Range Numbers</FormLabel>

            <TextField
              id="inputRangeField"
              type="text"
              className="new-range-input"
              value={currentRange[item.taskId] ?? item.range ?? ''}
              onChange={(event) => handleRangeChange(event, item.taskId)}
              onKeyPress={(event) => handleRangeKeyPress(event, item.taskId)}
            />

            {isButtonVisible[item.taskId] && (
              <Button
                id="saveButton"
                variant="outlined"
                onClick={() => handleSaveClick(item.taskId)}
              >
                <EditIcon className="editIcon" />
              </Button>
            )}

            {showError[item.taskId] && (
              <Box className="error-message">This field is mandatory!</Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default RecipeData;
