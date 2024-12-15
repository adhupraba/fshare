import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/protected-route";
import Home from "./pages/home.page";
import Login from "./pages/login.page";
import Register from "./pages/register.page";
import ViewFile from "./pages/view-file.page";
import ManageUsers from "./pages/manage-users.page";
import NotFound from "./pages/not-found";
import Layout from "./components/layout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute isPrivate>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-users"
            element={
              <ProtectedRoute isPrivate allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="files/shared/:shareToken"
            element={
              <ProtectedRoute isPrivate>
                <ViewFile />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/login"
          element={
            <ProtectedRoute openRoute>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute openRoute>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
