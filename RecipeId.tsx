import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

interface RecipeProps {
  recipeIds: { id: number; name: string }[];
  selectedRecipe: string;
  // eslint-disable-next-line no-unused-vars
  handleChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  databaseLoaded: boolean;
}

const Recipe: React.FC<RecipeProps> = ({
  recipeIds,
  selectedRecipe,
  handleChange,
  databaseLoaded,
}) => {
  return (
    <FormControl fullWidth variant="outlined" margin="normal">
      {databaseLoaded && (
        <InputLabel id="recipe-select-label">Select Coffee</InputLabel>
      )}
      {databaseLoaded && (
        <Select
          labelId="recipe-select-label"
          id="recipe-select"
          value={selectedRecipe}
          onChange={handleChange}
          label="Select Coffee"
        >
          {recipeIds.map((recipe) => (
            <MenuItem key={recipe.id} value={recipe.id}>
              {recipe.name}
            </MenuItem>
          ))}
        </Select>
      )}
    </FormControl>
  );
};

export default Recipe;
