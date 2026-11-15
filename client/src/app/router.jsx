import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingLayout from "./layouts/LandingLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "../features/home/pages/Home";
import NotFound from "../pages/NotFound";
import PublicRoute from "../routes/PublicRoute";
import PrivateRoute from "../routes/PrivateRoute";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Overview from "../features/profile/pages/Overview";
import CreatePost from "../features/posts/pages/CreatePost";
import TrackPost from "../features/posts/pages/TrackPost";
import { PATHS } from "../utils/paths";

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
          { path: PATHS.LOGIN, element: <Login /> },
          { path: PATHS.REGISTER, element: <Register /> },
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
    children: [
      {
        path: PATHS.DASHBOARD,
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Overview /> },
          { path: "create-post", element: <CreatePost /> },
          { path: "track-post", element: <TrackPost /> },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
