import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "@/stores/main";

interface AuthState {
  currentUserEmail: string | null;
}

const initialState: AuthState = {
  currentUserEmail: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => initialState,
    setCurrentUserEmail: (state, action: PayloadAction<string>) => {
      state.currentUserEmail = action.payload;
      console.log("debug set email!");
    },
    // increment: (state) => {
    //   state.count += 1;
    // },
    // decrement: (state) => {
    //   state.count -= 1;
    // },
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.count += action.payload;
    // },
  },
});

export const { logout, setCurrentUserEmail } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUserEmail = (state: RootState) =>
  state.auth.currentUserEmail;
