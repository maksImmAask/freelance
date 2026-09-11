import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";

import { useAuthStore } from "./store/authStore";

export default function App() {
  const loadUser = useAuthStore(
    (state) => state.loadUser
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener(
      "auth:logout",
      handleLogout
    );

    return () => {
      window.removeEventListener(
        "auth:logout",
        handleLogout
      );
    };
  }, [logout]);

  return <AppRoutes />;
}