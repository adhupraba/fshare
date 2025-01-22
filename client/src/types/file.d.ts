export type TRecipient = {
  email: string;
  can_view: boolean;
  can_download: boolean;
};

export type TFileUploadResponse = {
  message: string;
  share_token: string;
  token_exp_at: string;
};

export type TShareData = {
  url: string;
  exp_time: string;
};

export type TFileMetadata = {
  name: string;
  mimetype: string;
  size: number;
  hash: string;
  owner: {
    name: string;
    username: string;
  };
};

export type TFilePermissions = {
  can_view: boolean;
  can_download: boolean;
  encrypted_file_key: string;
  expires_at: string;
};

export type TFileInfo = {
  permissions: TFilePermissions;
  metadata: TFileMetadata;
  encryptedFile: Uint8Array<ArrayBuffer>;
};

export type TDecryptionStages = "fetching" | "noAccess" | "masterPassword" | "decrypting" | "decrypted" | "errored";

export type TAcceptedFileType = "image" | "video" | "audio" | "pdf";
