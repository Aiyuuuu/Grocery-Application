import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../api/services';

const initialState = {
  items: [],
  loading: false,
  error: null,
  synced: false,
};

// Async thunk to fetch cart from server
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.items || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to add item to cart on server
export const addToCartAsync = createAsyncThunk(
  'cart/addItem',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      if (quantity <= 0) {
        await cartService.removeByProductId(id);
        return { id, quantity: 0 };
      }

      const response = await cartService.addItem({ id, quantity });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to clear cart on server
export const clearCartAsync = createAsyncThunk(
  'cart/clearAsync',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.synced = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        const item = action.payload;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== item.id);
          return;
        }

        const existingItem = state.items.find(i => i.id === item.id);
        if (existingItem) {
          existingItem.quantity = item.quantity;
        } else {
          state.items.push(item);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(clearCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.synced = true;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default cartSlice.reducer;