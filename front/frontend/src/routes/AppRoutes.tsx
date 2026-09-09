import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import MainLayout from "../layouts/MainLayout";
import Proposals from "../pages/proposals/Proposals";
import ProposalDetails from "../pages/proposals/ProposalDetails";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";
import CreateProject from "../pages/projects/CreateProject";
import EditProject from "../pages/projects/EditProject";
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
      
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        <Route path="/proposals" element={<Proposals />} />
        <Route
        path="/proposals/:id"
        element={<ProposalDetails />}
        />

          {/* Projects */}
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

          {/* Proposals */}
          <Route
            path="/proposals"
            element={
              <div>
                <h1>Proposals</h1>
                <p>Proposals page coming soon...</p>
              </div>
            }
          />

          {/* Contracts */}
          <Route
            path="/contracts"
            element={
              <div>
                <h1>Contracts</h1>
                <p>Contracts page coming soon...</p>
              </div>
            }
          />

          {/* Chat */}
          <Route
            path="/chat"
            element={
              <div>
                <h1>Chat</h1>
                <p>Chat page coming soon...</p>
              </div>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <div>
                <h1>Notifications</h1>
                <p>Notifications page coming soon...</p>
              </div>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <div>
                <h1>Profile</h1>
                <p>Profile page coming soon...</p>
              </div>
            }
          />

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin/users"
              element={
                <div>
                  <h1>Admin Users</h1>
                  <p>Admin users page coming soon...</p>
                </div>
              }
            />

            <Route
              path="/disputes"
              element={
                <div>
                  <h1>Disputes</h1>
                  <p>Disputes page coming soon...</p>
                </div>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}