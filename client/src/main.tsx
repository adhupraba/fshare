import App from "./app.tsx";
import { createRoot } from "react-dom/client";
import { ACCESS_TOKEN, AUTH_USER, REFRESH_TOKEN } from "./config/constants.ts";
import { store } from "./store.ts";
import { logout, setTokens, setUser } from "./reducers/auth-reducer.ts";
import { Provider } from "react-redux";
import "./styles/index.css";
import { Toaster } from "./components/ui/toaster.tsx";

const access = localStorage.getItem(ACCESS_TOKEN);
const refresh = localStorage.getItem(REFRESH_TOKEN);
const user = localStorage.getItem(AUTH_USER);

if (access && refresh) {
  try {
    if (user) {
      const decodedUser = JSON.parse(atob(user));
      store.dispatch(setUser({ user: decodedUser }));
    }

    store.dispatch(setTokens({ access, refresh }));
  } catch (err) {
    console.error("startup user info load error =>", err);
    store.dispatch(logout());
  }
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
    <Toaster />
  </Provider>
);
