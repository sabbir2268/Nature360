import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingLayout from "./layouts/LandingLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "../features/home/pages/Home";
import NotFound from "../pages/NotFound";
import PublicRoute from "../routes/PublicRoute";
import PrivateRoute from "../routes/PrivateRoute";
import RoleRoute from "../routes/RoleRoute";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Overview from "../features/profile/pages/Overview";
import CreatePost from "../features/posts/pages/CreatePost";
import EditPost from "../features/posts/pages/EditPost";
import TrackPost from "../features/posts/pages/TrackPost";
import PostDetails from "../features/posts/pages/PostDetails";
import ComplaintQueue from "../features/officer/pages/ComplaintQueue";
import ComplaintWorkspace from "../features/officer/pages/ComplaintWorkspace";
import AssignedCases from "../features/volunteer/pages/AssignedCases";
import InvestigationWorkspace from "../features/volunteer/pages/InvestigationWorkspace";
import HotspotMapPage from "../features/intelligence/pages/HotspotMapPage";
import AnalyticsPage from "../features/intelligence/pages/AnalyticsPage";
import AlertsPage from "../features/intelligence/pages/AlertsPage";
import NotificationsPage from "../features/notifications/pages/NotificationsPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import AdminUsers from "../features/admin/pages/AdminUsers";
import AdminConfig from "../features/admin/pages/AdminConfig";
import AdminAudit from "../features/admin/pages/AdminAudit";
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
          { path: "create-post/:postId/edit", element: <EditPost /> },
          { path: "track-post", element: <TrackPost /> },
          { path: "track-post/:postId", element: <PostDetails /> },
          {
            element: <RoleRoute roles={["Officer", "Volunteer", "Admin"]} />,
            children: [
              { path: "hotspots", element: <HotspotMapPage /> },
              { path: "analytics", element: <AnalyticsPage /> },
              { path: "alerts", element: <AlertsPage /> },
            ],
          },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "settings", element: <SettingsPage /> },

          {
            element: <RoleRoute roles={["Officer", "Admin"]} />,
            children: [
              { path: "complaints", element: <ComplaintQueue /> },
              { path: "complaints/:postId", element: <ComplaintWorkspace /> },
            ],
          },

          {
            element: <RoleRoute roles={["Volunteer"]} />,
            children: [
              { path: "assigned", element: <AssignedCases /> },
              { path: "assigned/:postId", element: <InvestigationWorkspace /> },
            ],
          },

          {
            element: <RoleRoute roles={["Admin"]} />,
            children: [
              { path: "admin/users", element: <AdminUsers /> },
              { path: "admin/config", element: <AdminConfig /> },
              { path: "admin/audit", element: <AdminAudit /> },
            ],
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
