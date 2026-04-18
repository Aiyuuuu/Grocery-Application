import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      name: "Artisanal Bakery",
      productIds: ["prod-6"]
    },
    {
      name: "The Pantry",
      productIds: ["prod-1", "prod-2", "prod-4", "prod-5", "prod-rtk-0", "prod-rtk-01", "prod-rtk-1", "prod-rtk-2", "prod-rtk-3", "prod-rtk-4", "prod-rtk-5", "prod-rtk-6", "prod-rtk-7", "prod-rtk-8"]
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
      productIds: ["prod-1", "prod-5", "prod-rtk-2", "prod-rtk-6"]
    },
    {
      name: "Protein Rich",
      productIds: ["prod-2", "prod-3", "prod-7", "prod-rtk-4", "prod-rtk-8"]
    },
    {
      name: "Fruits & Veggies",
      productIds: ["prod-8", "prod-rtk-02"]
    }
  ]
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {}
});

export default categoriesSlice.reducer;
