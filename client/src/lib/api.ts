import { env } from "@/config/constants";
import { logout, setTokens } from "@/reducers/auth-reducer";
import { store } from "@/store";
import axios from "axios";

type RefreshSubscriberCallback = (token: string) => void;

const api = axios.create({
  baseURL: env.apiUrl,
});

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriberCallback[] = [];

function onRefreshed(newAccessToken: string) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: RefreshSubscriberCallback) {
  refreshSubscribers.push(callback);
}

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const access = state.auth.access;

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const state = store.getState();
      const refresh = state.auth.refresh;

      if (!refresh) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(`${env.apiUrl}/api/auth/token/refresh`, {
          refresh: refresh,
        });

        const newAccess = response.data.access;
        store.dispatch(setTokens({ access: newAccess, refresh: refresh }));
        isRefreshing = false;
        onRefreshed(newAccess);

        originalRequest.headers.Authorization = "Bearer " + newAccess;
        return api(originalRequest);
      } catch (err) {
        store.dispatch(logout());
        isRefreshing = false;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
