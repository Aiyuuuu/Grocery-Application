import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== id);
      } else if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        state.items.push({ id, quantity });
      }
    },
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;