import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingLayout from "./layouts/LandingLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "../pages/NotFound";
import PublicRoute from "../routes/PublicRoute";
import PrivateRoute from "../routes/PrivateRoute";
import RoleRoute from "../routes/RoleRoute";
import { PATHS } from "../utils/paths";
import {
  AdminAudit,
  AdminConfig,
  AdminUsers,
  AlertsPage,
  AnalyticsPage,
  AssignedCases,
  ComplaintQueue,
  ComplaintWorkspace,
  CreatePost,
  EditPost,
  Home,
  HotspotIntelligencePage,
  HotspotMapPage,
  InvestigationWorkspace,
  Login,
  NotificationsPage,
  Overview,
  PostDetails,
  Register,
  SettingsPage,
  TrackPost,
} from "./lazyPages";

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
              { path: "hotspot-intelligence", element: <HotspotIntelligencePage /> },
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
