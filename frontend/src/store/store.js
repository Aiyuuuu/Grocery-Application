import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './HomePage/productsSlice';
import categoriesReducer from './HomePage/categoriesSlice';
import cartReducer from './CartPage/cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
    categories: categoriesReducer,
  },
});

export default store;

