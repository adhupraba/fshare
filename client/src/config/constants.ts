export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";
export const AUTH_USER = "auth-user";
export const PAGE_QUERY_PARAM = "page";

export const UMAMI_SCRIPT_ID = "umami-script";
export const UMAMI_PRELOAD_ID = "umami-preload";

export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  umami: {
    scriptUrl: import.meta.env.VITE_UMAMI_SCRIPT_URL,
    websiteId: import.meta.env.VITE_UMAMI_WEBSITE_ID,
  },
};
