import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/dashboard/Dashboard";
import Payments from "../pages/dashboard/Payments";
import Reviews from "../pages/dashboard/Reviews";

import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";
import CreateProject from "../pages/projects/CreateProject";
import EditProject from "../pages/projects/EditProject";

import Proposals from "../pages/proposals/Proposals";
import ProposalDetails from "../pages/proposals/ProposalDetails";

import Contracts from "../pages/contracts/Contracts";
import ContractDetails from "../pages/contracts/ContractDetails";

import Chat from "../pages/chat/Chat";
import Profile from "../pages/profile/Profile";
import Notifications from "../pages/notifications/Notifications";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminDisputes from "../pages/admin/AdminDisputes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
      </Route>

      {/* MAIN APPLICATION */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/create"
            element={<CreateProject />}
          />

          <Route
            path="/projects/:id"
            element={<ProjectDetails />}
          />

          <Route
            path="/projects/:id/edit"
            element={<EditProject />}
          />

          <Route
            path="/proposals"
            element={<Proposals />}
          />

          <Route
            path="/proposals/:id"
            element={<ProposalDetails />}
          />

          <Route
            path="/contracts"
            element={<Contracts />}
          />

          <Route
            path="/contracts/:id"
            element={<ContractDetails />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/reviews"
            element={<Reviews />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/chat"
            element={<Chat />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>

        {/* ADMIN */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin/disputes"
              element={<AdminDisputes />}
            />
          </Route>
        </Route>
      </Route>

      {/* DEFAULT */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}