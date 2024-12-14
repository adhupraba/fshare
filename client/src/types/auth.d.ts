export type TRole = "admin" | "user" | "guest";

export type TUser = {
  id: number;
  name: string;
  email: string;
  role: TRole;
};

export type TLoginRequest = {
  email: string;
  password: string;
};

export type TLoginMFARequiredRespose = {
  message: string;
  action: "mfa_required";
  mfa_temp_token: string;
};

export type TLoginMFASetupResponse = {
  message: string;
  action: "mfa_setup";
  mfa_temp_token: string;
  totp_qr: string;
};

export type TLoginResponse = TLoginMFARequiredRespose | TLoginMFASetupResponse;

export type TRegisterRequest = {
  name: string;
  email: string;
  password: string;
  master_password: string;
};

export type TRegisterResponse = {
  message: string;
  mfa_temp_token: string;
  totp_qr: string;
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
