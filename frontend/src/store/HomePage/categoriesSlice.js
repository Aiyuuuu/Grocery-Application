import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      name: "Artisanal Bakery",
      productIds: ["prod-6"]
    },
    {
      name: "The Pantry",
      productIds: ["prod-1", "prod-2", "prod-4", "prod-5"]
    },
    {
      name: "Dairy & Eggs",
      productIds: ["prod-3"]
    },
    {
      name: "Meat & Seafood",
      productIds: ["prod-7"]
    },
    {
      name: "Sugar Free",
      productIds: ["prod-1", "prod-4", "prod-5"]
    },
    {
      name: "Protein Rich",
      productIds: ["prod-2", "prod-3", "prod-7"]
    },
    {
      name: "Fruits & Veggies",
      productIds: ["prod-8", "prod-9"]
    }
  ]
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {}
});

export default categoriesSlice.reducer;
