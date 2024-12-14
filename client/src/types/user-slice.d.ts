import type { TUser } from "./auth";

export type TUserState = {
  access: string | null;
  refresh: string | null;
  user: TUser | null;
  isAuthenticated: boolean | null;
};

export type TSetUserPayload = {
  user: TUser;
};

export type TSetTokensPayload = {
  access: string;
  refresh: string;
};
