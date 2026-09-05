import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminContext = createContext();
const ADMIN_STORAGE_KEY = "admin";

export const AdminContextProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  const saveAdmin = (adminData) => {
    if (!adminData) return;
    setAdmin(adminData);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
  };

  const clearAdmin = () => {
    setAdmin(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  // Always fetch from backend on load / refresh
  useEffect(() => {
    const initAdmin = async () => {
      setAuthLoading(true);

      try {
        const { data } = await api.get("/api/auth/getadmin", {
          withCredentials: true,
          validateStatus: (status) => status < 500,
        });

        if (data?.success && data?.admin) {
          // Fresh data from DB → state + localStorage cache
          saveAdmin(data.admin);
        } else {
          clearAdmin();
          if (window.location.pathname.startsWith("/admin")) {
            navigate("/login", { replace: true });
          }
        }
      } catch (error) {
        clearAdmin();
        if (window.location.pathname.startsWith("/admin")) {
          navigate("/login", { replace: true });
        }
      } finally {
        setAuthLoading(false);
      }
    };

    initAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminContext.Provider
      value={{
        admin,
        setAdmin,
        saveAdmin,
        clearAdmin,
        authLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const UseAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error(
      "Please make sure UseAdmin is used inside AdminContextProvider."
    );
  }
  return context;
};