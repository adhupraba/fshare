import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ACCESS_TOKEN, env, UMAMI_PRELOAD_ID, UMAMI_SCRIPT_ID } from "./config/constants";
import { TGetUserResponse } from "./types/auth";
import { store } from "./store";
import { logout, setUser } from "./reducers/auth-reducer";
import api from "./lib/api";

const ProtectedRoute = lazy(() => import("./components/protected-route"));
const Layout = lazy(() => import("./components/layout"));
const Home = lazy(() => import("./pages/home.page"));
const Login = lazy(() => import("./pages/login.page"));
const Register = lazy(() => import("./pages/register.page"));
const ViewFile = lazy(() => import("./pages/view-file.page"));
const ManageUsers = lazy(() => import("./pages/manage-users.page"));
const NotFound = lazy(() => import("./pages/not-found"));

const App = () => {
  useEffect(() => {
    fetchUserDetails();
    insertUmamiScript();
  }, []);

  const insertUmamiScript = () => {
    if (!env.umami.scriptUrl || !env.umami.websiteId) {
      return;
    }

    let script = document.getElementById(UMAMI_SCRIPT_ID) as HTMLScriptElement | null;
    let scriptPreload = document.getElementById(UMAMI_PRELOAD_ID) as HTMLLinkElement | null;

    if (!scriptPreload) {
      scriptPreload = document.createElement("link");
      scriptPreload.id = UMAMI_PRELOAD_ID;
      scriptPreload.rel = "preload";
      scriptPreload.href = env.umami.scriptUrl;
      scriptPreload.as = "script";

      document.head.appendChild(scriptPreload);
    }

    if (!script) {
      script = document.createElement("script");
      script.id = UMAMI_SCRIPT_ID;
      script.defer = true;
      script.src = env.umami.scriptUrl;
      script.setAttribute("data-website-id", env.umami.websiteId);

      document.body.appendChild(script);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const access = localStorage.getItem(ACCESS_TOKEN);

      if (!access) return;

      const { data } = await api.get<TGetUserResponse>("/api/auth/get-user");
      store.dispatch(setUser({ user: data.user }));
    } catch (err) {
      store.dispatch(logout());
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute isPrivate>
                <Suspense>
                  <Home />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-users"
            element={
              <ProtectedRoute isPrivate allowedRoles={["admin"]}>
                <Suspense>
                  <ManageUsers />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="files/shared/:shareToken"
            element={
              <ProtectedRoute isPrivate>
                <Suspense>
                  <ViewFile />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/login"
          element={
            <ProtectedRoute openRoute>
              <Suspense>
                <Login />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute openRoute>
              <Suspense>
                <Register />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Suspense>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
