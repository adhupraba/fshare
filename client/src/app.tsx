import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import ProtectedRoute from "./components/protected-route";
import Layout from "./components/layout";
import { ACCESS_TOKEN } from "./config/constants";
import api from "./lib/api";
import { TGetUserResponse } from "./types/auth";
import { store } from "./store";
import { logout, setUser } from "./reducers/auth-reducer";

const Home = lazy(() => import("./pages/home.page"));
const Login = lazy(() => import("./pages/login.page"));
const Register = lazy(() => import("./pages/register.page"));
const ViewFile = lazy(() => import("./pages/view-file.page"));
const ManageUsers = lazy(() => import("./pages/manage-users.page"));
const NotFound = lazy(() => import("./pages/not-found"));

const App = () => {
  useEffect(() => {
    fetchUserDetails();
  }, []);

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
