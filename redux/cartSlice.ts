import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  slug: string;
  price: number;
  discount: number;
  discountedPrice: number;
  size: string | null;
  color: string | null;
  image: string | null;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isDrawerOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.variantId === action.payload.variantId
      );

      if (existingItem) {
        const newQty = existingItem.quantity + action.payload.quantity;
        // Clamp to variant stock
        existingItem.quantity = Math.min(newQty, existingItem.stock);
      } else {
        state.items.push(action.payload);
      }
      // Open drawer on add to bag
      state.isDrawerOpen = true;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.variantId !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.variantId === action.payload.variantId);
      if (item) {
        // Clamp between 1 and stock limit
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleDrawer: (state, action: PayloadAction<boolean | undefined>) => {
      state.isDrawerOpen = action.payload !== undefined ? action.payload : !state.isDrawerOpen;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;
