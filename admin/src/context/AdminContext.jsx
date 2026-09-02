import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminContext = createContext();

const ADMIN_STORAGE_KEY = "admin";

export const AdminContextProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();

    // Save admin to state + localStorage
    const saveAdmin = (adminData) => {
        if (!adminData) return;
        setAdmin(adminData);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
    };

    // Clear admin from state + localStorage
    const clearAdmin = () => {
        setAdmin(null);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
    };

    // On app load / refresh
    useEffect(() => {
        const initAdmin = async () => {
            setAuthLoading(true);

            try {
                // 1) localStorage first
                const stored = localStorage.getItem("admin");
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (parsed && parsed._id) {
                            setAdmin(parsed);
                            setAuthLoading(false);
                            return;
                        }
                    } catch {
                        localStorage.removeItem("admin");
                    }
                }

                // 2) No local admin → ask backend (cookie session)
                const { data } = await api.get("/api/auth/getadmin", {
                    withCredentials: true,
                    // optional: prevent global error handlers if you use validateStatus
                    validateStatus: (status) => status < 500,
                });

                if (data?.success && data?.admin) {
                    saveAdmin(data.admin);
                } else {
                    // Not logged in — silent cleanup
                    clearAdmin();
                    if (window.location.pathname.startsWith("/admin")) {
                        navigate("/login", { replace: true });
                    }
                }
            } catch (error) {
                // 401 / network / no cookie → silent, expected
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
        throw new Error("Please make sure UseAdmin is used inside AdminContextProvider.");
    }
    return context;
};