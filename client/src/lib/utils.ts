import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const validators = (type: "name" | "username" | "email" | "password" | "file") => {
  if (type === "name") {
    return new RegExp(/^(?:[A-Za-z]{2,}(?: [A-Za-z]{1,2})*|[A-Za-z]{1,2}(?: [A-Za-z]{1,2})*)$/);
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

export const bytesToMB = (bytesSize: number) => {
  const mb = bytesSize / (1024 * 1024);

  return Number(mb.toFixed(2));
};
