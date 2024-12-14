import { ACCESS_TOKEN, AUTH_USER, REFRESH_TOKEN } from "@/config/constants";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TSetTokensPayload, TSetUserPayload, TUserState } from "@/types/user-slice";

const initialState: TUserState = {
  access: null,
  refresh: null,
  user: null,
  isAuthenticated: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<TSetUserPayload>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;

      localStorage.setItem(AUTH_USER, btoa(JSON.stringify(action.payload.user)));
    },
    setTokens: (state, action: PayloadAction<TSetTokensPayload>) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;

      localStorage.setItem(ACCESS_TOKEN, action.payload.access);
      localStorage.setItem(REFRESH_TOKEN, action.payload.refresh);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = null;
      state.access = null;
      state.refresh = null;

      localStorage.clear();
      window.location.href = "/login";
    },
  },
});

export const { setUser, setTokens, logout } = userSlice.actions;

export default userSlice.reducer;
