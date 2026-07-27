import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount: number;
  image: string | null;
  categoryName: string;
  targetGroup: string;
}

interface WishlistState {
  items: WishlistItem[];
  isWishlistOpen: boolean;
}

const initialState: WishlistState = {
  items: [],
  isWishlistOpen: false,
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    toggleWishlistDrawer: (state, action: PayloadAction<boolean>) => {
      state.isWishlistOpen = action.payload;
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist, toggleWishlistDrawer } = wishlistSlice.actions;

export default wishlistSlice.reducer;
