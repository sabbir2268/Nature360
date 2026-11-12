import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingLayout from "./layouts/LandingLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "../features/home/pages/Home";
import NotFound from "../pages/NotFound";
import PublicRoute from "../routes/PublicRoute";
import PrivateRoute from "../routes/PrivateRoute";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />,
    children: [{ index: true, element: <Home /> }],
  },

  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
        ],
      },
    ],
  },

  {
    path: "/about",
    element: <Navigate to="/#about" replace />,
  },

  {
    element: <PrivateRoute />,
    children: [],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
