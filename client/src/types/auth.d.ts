import { TPageInfo, TPaginatedResponse } from "./api";

export type TRole = "admin" | "user" | "guest";

export type TUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: TRole;
  is_active: boolean;
};

export type TLoginRequest = {
  email: string;
  password: string;
};

export type TLoginMFARequiredRespose = {
  message: string;
  action: "mfa_required";
  mfa_temp_token: string;
  token_exp_at: string;
};

export type TLoginMFASetupResponse = {
  message: string;
  action: "mfa_setup";
  mfa_temp_token: string;
  totp_qr: string;
  token_exp_at: string;
};

export type TLoginResponse = TLoginMFARequiredRespose | TLoginMFASetupResponse;

export type TRegisterRequest = {
  name: string;
  email: string;
  username: string;
  password: string;
  master_password: string;
};

export type TRegisterResponse = {
  message: string;
  mfa_temp_token: string;
  totp_qr: string;
  token_exp_at: string;
};

export type TMFAConfirmRequest = {
  mfa_temp_token: string;
  totp_code: string;
};

export type TMFAConfirmResponse = {
  message: string;
  access: string;
  refresh: string;
  user: TUser;
};

export type TRefreshTokenRequest = {
  refresh: string;
};

export type TRefreshTokenResponse = {
  access: string;
};

export type TMasterPasswordValidateRequest = {
  master_password: string;
};

export type TMasterPasswordValidateResponse = {
  message: string;
  enc_private_key: string;
};

export type TGetUsersResponse = TPaginatedResponse<TUser>;

export type TGetUserResponse = {
  message: string;
  user: TUser;
};

export type TUpdateUserRequest = {
  id: number;
  role?: TRole;
  is_active?: boolean;
};

export type TUpdateUserResponse = {
  message: string;
  user: TUser;
};
