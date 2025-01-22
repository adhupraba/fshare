import { TAcceptedFileType, TFileMetadata, TFilePermissions } from "@/types/file";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const validators = (type: "name" | "username" | "email" | "password" | "file") => {
  if (type === "name") {
    return new RegExp(/^(?:[A-Za-z]{2,}(?: [A-Za-z]{1,})*|[A-Za-z]{1,}(?: [A-Za-z]{1,})*)$/);
  } else if (type === "username") {
    return new RegExp(/^[A-Za-z0-9_]{5,20}$/);
  } else if (type === "email") {
    return new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "i");
  } else if (type === "password") {
    return new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?:{}|<>])[A-Za-z\d!@#$%^&*(),.?:{}|<>]{5,20}$/);
  } else {
    return new RegExp(/^(image\/.+|audio\/.+|video\/.+|application\/pdf)$/);
  }
};

export const getFileType = (mimetype: string): TAcceptedFileType | null => {
  const fileTypes = ["image", "audio", "video"];
  const match = mimetype.match(/(.*)\/(.*)/);

  if (match && fileTypes.includes(match[1])) {
    return match[1] as TAcceptedFileType;
  } else if (mimetype === "application/pdf") {
    return "pdf";
  }

  return null;
};

export const bytesToMB = (bytesSize: number) => {
  const mb = bytesSize / (1024 * 1024);

  return Number(mb.toFixed(2));
};

export const extractMultipartData = (data: ArrayBuffer, contentType?: string) => {
  const boundaryMatch = contentType?.match(/boundary=(.*)$/);
  const boundary = boundaryMatch && boundaryMatch[1];

  if (!boundary) {
    throw new Error("Boundary not found in Content-Type header");
  }

  const text = new TextDecoder("utf-8").decode(data);
  const parts = text.split(`--${boundary}`).filter((part) => part.trim() !== "" && part.trim() !== "--");

  const parsedParts = parts.map((part) => {
    const [headerSection, ...bodyLines] = part.trim().split("\r\n\r\n");
    const body = bodyLines.join("\r\n\r\n");
    const headers: { [key: string]: string } = {};

    headerSection.split("\r\n").forEach((line) => {
      const [key, value] = line.split(":").map((str) => str.trim());
      headers[key.toLowerCase()] = value;
    });

    return { headers, body };
  });

  const permissions = JSON.parse(parsedParts[0].body) as TFilePermissions;
  const metadata = JSON.parse(parsedParts[1].body) as TFileMetadata;

  const encryptedFileHeaders = parsedParts[2]?.headers || {};
  const encryptedFileBody = parsedParts[2]?.body || "";

  const encryptedFile =
    encryptedFileHeaders["content-type"] === "application/octet-stream"
      ? Uint8Array.from(atob(encryptedFileBody), (char) => char.charCodeAt(0))
      : null;

  if (!encryptedFile) {
    throw new Error("Failed to parse encrypted file content.");
  }

  return {
    permissions,
    metadata,
    encryptedFile,
  };
};

export const generateFileHash = async (fileBuffer: ArrayBuffer) => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer); // Compute SHA-256 hash
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert ArrayBuffer to byte array
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join(""); //

  return hashHex;
};

export const validateHash = async (fileBuffer: ArrayBuffer, expectedHash: string): Promise<boolean> => {
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer); // Compute SHA-256 hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert ArrayBuffer to byte array
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join(""); // Convert to hex
    return hashHex === expectedHash; // Compare the computed hash with the expected hash
  } catch (err) {
    console.error("Error validating hash:", err);
    return false;
  }
};
