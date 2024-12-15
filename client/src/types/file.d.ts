export type TRecipient = {
  email: string;
  can_view: boolean;
  can_download: boolean;
};

export type TFileUploadResponse = {
  message: string;
  share_token: string;
};
